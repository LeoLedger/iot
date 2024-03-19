import { loginAct, logoutAct, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  appSettings: [],
  isAdmin: false,
  perms: [] // 用户权限标识集合
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, user) => {
    state.name = user.userName
    state.isAdmin = user.userIsAdmin === 1
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_APP_SETTINGS: (state, appSettings) => {
    state.appSettings = appSettings
  },
  SET_Perms(state, perms) { // 用户权限标识集合
    state.perms = perms || []
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    return new Promise((resolve, reject) => {
      loginAct(userInfo)
        .then(response => {
          const { data } = response
          if (data.success) {
            commit('SET_TOKEN', data.data.access_token)
            setToken(data.data.access_token)
            resolve()
          } else {
            throw data.msg
          }
        })
        .catch(error => {
          reject(error)
        })
    })
  },
  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token)
        .then(response => {
          const { data } = response
          if (!data.data) {
            reject('登录超时,请重新登录!')
          }
          const { info, permissions } = data.data
          commit('SET_NAME', info)
          commit('SET_Perms', permissions)
          // commit('SET_AVATAR', avatar)
          // commit('SET_APP_SETTINGS', appSettings)

          resolve(data)
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logoutAct(state.token)
        .then(() => {
          commit('SET_TOKEN', '')
          commit('SET_NAME', '')
          removeToken()
          resetRouter()
          resolve()
        })
        .catch(error => {
          reject(error)
        })
    })
  },
  // 前端 登出
  FedLogOut({
    commit
  }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_NAME', '')
      removeToken()
      resetRouter()
      resolve()
    })
  },
  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_NAME', '')
      removeToken()
      resolve()
    })
  }

}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
