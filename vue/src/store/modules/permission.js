import { isRequest, currentRoutes } from '@/router'

const _import = require('../../router/_import_' + process.env.NODE_ENV)

import store from '../index'
import { getMenuTree } from '@/api/user'
import resourceApi from '@/api/resource'
import Layout from '@/views/layout/Layout'
/**
 * 通过meta.role判断是否与当前用户权限匹配
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
    if (route.meta && route.meta.roles) {
        return roles.some(role => route.meta.roles.includes(role))
    } else {
        return true
    }
}

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param routes asyncRouterMap
 * @param roles
 */
function filterAsyncRouter(routes, roles) {
    const res = []
    routes.forEach(route => {
        const tmp = {
            ...route
        }
        if (hasPermission(roles, tmp)) {
            if (tmp.children) {
                tmp.children = filterAsyncRouter(tmp.children, roles)
            }
            res.push(tmp)
        }
    })
    return res
}

// function lazy(name) {
//   return () => import(`@/views/${name}`)
// }

function flatRouter(children, path = '', routers = []) {
    children.forEach(item => {
        if (item.children && item.children.length > 0) {
            flatRouter(item.children, `${path}/${item.path}`, routers)
        } else {
            item = {
                ...item,
                path: `${path}/${item.path}`
            }
            routers.push(item)
        }
    })
    return routers
}
function treeRoutes(routes) {
    return routes.map(item => {
        var route = {
            name: item.menuName,
            path: item.linkUrl,
            meta: {
                icon: item.cssClass,
                title: item.menuName
            }
        }
        if (item.children && item.children.length) {
            route.children = treeRoutes(item.children)
        }
        if (item.componentKey) {
            try {
                route.component = _import(item.componentKey)
                route.component.$route_name = item.menuName
            } catch (err) {
                console.log(err)
            }
        } else {
            route.component = Layout
        }
        return route
    })
}

const permission = {
    state: {
        routers: [],
        flatRouters: [],
        areaTree: []
    },
    getters: {
        areaTree: (state) => state.areaTree
    },
    mutations: {
        SET_ROUTERS: (state, routers) => {
            state.routers = routers
            state.flatRouters = routers.map(item => {
                item = { ...item }
                if (item.children && item.children.length > 0) {
                    item.children = flatRouter(item.children, item.path)
                }
                return item
            })
        },
        SET_FEATURE: (state, feature) => {
            state.feature = feature
        }
    },
    actions: {
        // 获取系统菜单
        generateRoutes({ commit, dispatch }) {
            return new Promise((resolve, reject) => {
                if (isRequest) {
                    getMenuTree({
                        appId: store.getters.appId
                    }).then(res => {
                        if (res && res.success) {
                            var data = res.data
                            var routers = treeRoutes(data.menus)
                            commit('SET_ROUTERS', currentRoutes.concat(routers))
                            commit('SET_FEATURE', data.permissionGrants)
                            resolve()
                        }
                    }).catch(error => {
                        reject(error)
                    })
                } else {
                    commit('SET_ROUTERS', currentRoutes)
                    resolve(currentRoutes)
                }
                dispatch('generateAreaTree')
                dispatch('queryWarehouseTree')
            })
        },
        // 获取地理区域数据
        generateAreaTree({ state }) {
            return new Promise((resolve, reject) => {
                resourceApi.getMapTree().then(res => {
                    state.areaTree = res.data
                    resolve(state.areaTree)
                }).catch(reject)
            })
        }
    }
}

export default permission
