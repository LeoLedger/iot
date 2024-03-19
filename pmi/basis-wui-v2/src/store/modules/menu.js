// 设置文件
import store from '../index'
import {getMenuList, getMenuTree} from '@/api/menu'
import util from '@/utils/util'
import {constantRoutes} from '@/router'

function completeRoutes(routes) {
    routes.forEach(item => {
        if (item.component == null) {
            item.component = Layout
        } else {
            item.component = require(item.file)
        }
        if (item.children.length > 0) {
            completeRoutes(item.children)
        } else {
            //const { redirect, ...results } = item
            //item = results
        }
    })
    return routes
}

export default {
    namespaced: true,
    state: {
        // 侧栏菜单
        aside: []
    },
    actions: {
        getMenu({commit, state}) {
            let menuData = [];
            getMenuList()
                .then((res) => {
                    menuData = res.data.data
                    //const menuData = util.formatRoutes(data)
                })
            return menuData;
        },
        getMenuTree({commit}) {
            return new Promise((resolve, reject) => {
                getMenuTree({
                    appId: store.getters.appId
                })
                    .then(res => {
                        if (res && res.data.success) {
                            let dynamicRoutes = util.formatRoutes(res.data.data);
                            dynamicRoutes[0].path = "/";
                            dynamicRoutes[0].redirect = dynamicRoutes[0].children[0].path
                            dynamicRoutes.push(// 404 page must be placed at the end !!!
                                {
                                    path: '*',
                                    redirect: '/404',
                                    hidden: true
                                })

                            commit("setAsideSet", dynamicRoutes)
                            resolve(store.getters.addRouters)
                        }
                    })
                    .catch(error => {
                        reject(error)
                    })
            })
        }
    },
    mutations: {
        /**
         * @description 设置侧边栏菜单
         */
        setAsideSet(state, menu) {
            state.aside = constantRoutes.concat(menu);
        }
    }
}
