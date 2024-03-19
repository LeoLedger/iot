// API
import businessDocumentsApi from '@/api/businessDocuments'
import deviceAllocateApi from '@/api/businessDocuments/deviceAllocate'
// 方法
import enums from '@/utils/enum'

import {
    login,
    loginByToken,
    logout,
    getUserInfo
} from '@/api/user'
import {
    setLoginTime,
    setTime,
    getToken,
    setToken,
    removeToken,
    getRefreshToken,
    setRefreshToken,
    removeRefreshToken
} from '@/utils/auth'

const user = {
    state: {
        roles: [],
        isLogin: false,
        userInfo: {},
        token: getToken(),
        refreshToken: getRefreshToken(),
        // 仓库及仓位数据
        warehouseTree: null,
        // 待处理故障设备数量
        troubleTicketCount: 0,
        // 待处理寄修设备数量
        sendRevisedCount: 0,
        // 可审批数量
        canApprovalCount: {}
    },
    mutations: {
        SET_ROLES: (state, roles) => {
            state.roles = roles
        },
        SET_TOKEN: (state, token) => {
            state.token = token
            setToken(token)
        },
        SET_USERINFO: (state, value) => {
            state.userInfo = value
        },
        SET_LOGIN_STATUS(state, value) {
            state.isLogin = value
        },
        SET_REFRESH_TOKEN: (state, token) => {
            state.refreshToken = token
            setRefreshToken(token)
        },
        setTroubleTicketCount: (state, count) => {
            state.troubleTicketCount = count
        },
        setSendRevisedCount: (state, count) => {
            state.sendRevisedCount = count
        }
    },

    actions: {
        // token登录
        loginByToken({ commit }, token) {
            return new Promise((resolve, reject) => {
                loginByToken(token).then(data => {
                    if (data.success) {
                        data = data.data
                        commit('SET_TOKEN', data.access_token)
                        commit('SET_REFRESH_TOKEN', data.refresh_token)
                        setTime(data.expires_in)
                        setLoginTime(new Date().getTime())
                        resolve(data)
                    } else {
                        reject(data)
                    }
                }).catch(error => {
                    reject(error)
                })
            })
        },
        // 用户名登录
        login({ commit }, userInfo) {
            return new Promise((resolve, reject) => {
                login(userInfo).then(data => {
                    if (data.success) {
                        data = data.data
                        commit('SET_TOKEN', data.access_token)
                        commit('SET_REFRESH_TOKEN', data.refresh_token)
                        setTime(data.expires_in)
                        setLoginTime(new Date().getTime())
                        resolve(data)
                    } else {
                        reject(data)
                    }
                }).catch(error => {
                    reject(error)
                })
            })
        },
        // 获取用户信息
        getUserInfo({ commit, state }) {
            return new Promise((resolve, reject) => {
                getUserInfo().then(res => {
                    commit('SET_ROLES', [1])
                    commit('SET_USERINFO', res.data)
                    commit('SET_LOGIN_STATUS', true)
                    resolve()
                }).catch(error => {
                    reject(error)
                })
            })
        },
        // 登出
        logOut({ commit, state }) {
            return new Promise((resolve, reject) => {
                logout(state.token)
                    .then(() => {
                        commit('SET_TOKEN', '')
                        commit('SET_LOGIN_STATUS', false)
                        commit('SET_ROLES', [])
                        removeToken()
                        removeRefreshToken()
                        resolve()
                    })
                    .catch(error => {
                        reject(error)
                    })
            })
        },
        // 前端 登出
        fedLogOut({ commit }) {
            return new Promise(resolve => {
                commit('SET_TOKEN', '')
                removeToken()
                removeRefreshToken()
                resolve()
            })
        },
        // 获取仓库列表
        queryWarehouseTree({ state }) {
            return new Promise((resolve, reject) => {
                if (state.warehouseTree) {
                    resolve()
                } else {
                    deviceAllocateApi.getWarehouse().then(({ data }) => {
                        var warehouseTree = enums.productCategoryId.map(option => {
                            option = {
                                label: option.label,
                                value: option.id,
                                children: []
                            }
                            data.filter(item => item.category === option.value).map(item => {
                                var node = option.children.find(v => v.value === item.warehousesId)
                                if (!node) {
                                    node = {
                                        label: item.warehouseName,
                                        value: item.warehousesId,
                                        children: []
                                    }
                                    option.children.push(node)
                                }
                                node.children.push({
                                    label: item.spaceName,
                                    value: item.guidId,
                                    typeId: item.typeId
                                })
                            })
                            return option
                        })
                        state.warehouseTree = warehouseTree
                        resolve()
                    }).catch(reject)
                }
            })
        },
        // 获取可审批数量
        async getCanApprovalCount({ state }) {
            let res = await businessDocumentsApi.getCount()
            let counts = {}
            res.data.forEach(item => {
                counts[item.type] = item.count
            })
            state.canApprovalCount = counts
        }
    }
}

export default user
