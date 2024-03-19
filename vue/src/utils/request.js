import qs from 'qs'
import axios from 'axios'
import {
    Message,
    MessageBox
} from 'element-ui'
import store from '../store'
import {
    getToken,
    getRefreshToken,
    getTime,
    getLoginTime
} from '@/utils/auth'
import { getDeepValue, consoleLog } from './commonUtil'

const timeout = 600000
// 根据是否生产环境判断 函数外壳
const environmentalWrap = function(fn) {
    // 在生产环境 禁止 log 输出
    if (process.env.VUE_APP_ENV === 'production') {
        return function() {}
    }
    return fn
}

// 当请求发生错误
const errorLog = environmentalWrap(function(res, type = 'default') {
    var config = res.config
    console.log(
        `%c request【Error】 url: ${config.url}`, 'color: #F74242',
        'result: ', res)
        // console.log(`%c error: ${type} Start ____________________`, 'color: #ebb836')
        // const config = res.config
        // console.log(`url: ${config.url}`)
        // console.log(res)
        // console.log(`%c ________________________________________ error: ${type} End`, 'color: #ebb836')
})

// 当请求成功
const successLog = environmentalWrap(function(res, type = 'default') {
    const config = res.config
    // 由于前后端联调 params 无法直接 接口 请求复制为对象 需打印   // config.data 可以直接复制 不多做log
    if (config.params) {
        consoleLog(config.params, 'request config.params', '#8140F2')
    }
    console.log(`%c request 【Success】 url: ${config.url}`, 'color: #0EB13C', 'result:', res.data)
    // console.log(`%c success: ${type} Start ____________________`, 'color: #0eb13c')
    // const config = res.config
    // console.log(`url: ${config.url}`)
    // if (config.params) {
    //     consoleLog(config.params, 'config.params', '#8140F2')
    // }
    // if (config.data) {
    //     consoleLog(config.data, 'config.data', '#F2C540')
    // }
    // console.log('%c response_Success[data]', 'color: #36a4e8', res.data)
    // // consoleLog(res.data, 'response_Success[data]', '#36a4e8')
    // console.log(`%c ________________________________________ success: ${type} End`, 'color: #0eb13c')
})
axios.defaults.timeout = timeout
// 创建axios实例
const service = axios.create({
    // baseURL: 'https://api.shunone.com', // api 的 base_url
    baseURL: process.env.BASE_API, // api 的 base_url
    withCredentials: true, // send cookies when cross-domain requests
    timeout // 请求超时时间
})

var notification = false
// request拦截器
service.interceptors.request.use(
    config => {
        const onlineTime = Math.floor((new Date().getTime() - getLoginTime()) / 1000)
        const whiteList = ['/login', '/share/'] // 白名单过滤
        const isWhitePath = whiteList.some(whitePath => {
            return location.href.search(whitePath) !== -1
        })
        if (!isWhitePath && onlineTime > getTime()) {
            if (notification === false) {
                MessageBox.alert('长时间在线，请重新登录验证身份', '请重新登录', {
                    showClose: false,
                    type: 'error',
                    duration: 0,
                    confirmButtonText: '点击重登',
                    callback: action => {
                        store.dispatch('fedLogOut').then(() => {
                            location.reload() // 为了重新实例化vue-router对象 避免bug
                        })
                    }
                })
                notification = true
            }
            return
        }
        // 去掉传递数组时，参数结尾的中括号
        if (config.method === 'get') {
            config.paramsSerializer = function(params) {
                return qs.stringify(params, { arrayFormat: 'repeat' })
            }
        }
        if (!config.headers.token && store.getters.token) {
            config.headers.token = getToken() // 每次提交都带上bearer以及access_token
            // 让每个请求携带自定义token 请根据实际情况自行修改
        }
        return config
    },
    error => {
        // Do something with request error
        Message({
            message: error,
            type: 'error',
            duration: 5000
        })
        return Promise.reject(error)
    }
)

let refresh = false // 刷新 token 请求开关 只请求一次

// response 拦截器
service.interceptors.response.use(
    response => {
        if (response.status === 200) {
            if (response.data.hasOwnProperty('data')) {
                /** 如果不想要弹窗提示 需要自定义 transformResponse 对 data 自定义 showToast = false */
                if (!response.data.success) {
                    if (response.data.showToast !== false) {
                        Message({
                            message: response.data.msg,
                            type: 'error',
                            duration: 5000
                        })
                    }
                    return Promise.reject(response.data)
                }
            }
            successLog(response)
            if (response.data) return response.data
        } else {
            Message({
                message: response.data.msg,
                type: 'error',
                duration: 5000
            })
            return Promise.reject(response)
        }
    },
    error => {
        const {
            status,
            statusText,
            data
        } = error.response || {}
        errorLog(error, 'default')
        if (!error.response) {
            let info = {}
            // 请求超时状态
            if (error.message.includes('timeout')) {
                info = {
                    code: 5000,
                    msg: 'Network Error'
                }
                Message.error('请求超时，请检查网络是否连接正常')
            } else {
                // 可以展示
                info = {
                    code: status,
                    data: data,
                    msg: statusText
                }
                if (notification === false) {
                    Message.error('请求失败，请检查网络是否已连接')
                }
            }
            return Promise.reject(info)
        }
        if (status === 401) {
            // 刷新 token 请求开关 只请求一次
            if (refresh) { return }
            refresh = true
            // 刷新 token
            service({
                url: '/oauth2/token',
                data: 'grant_type=refresh_token&refresh_token=' + getRefreshToken(),
                method: 'post',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: 'basic YXBwOmU5QzZsZ05PbFRWSXFkNWJy'
                }
            }).then(res => {
                refresh = false
                store.commit('SET_TOKEN', res.data.access_token)
                store.commit('SET_REFRESH_TOKEN', res.data.refresh_token)
            })
            return Promise.reject(error)
        }
        /** 如果是通过 transformResponse 对 data 自定义 */
        if (data.isCustomize === true) {
            return Promise.reject(error.response)
        }
        const _statusText = {
            // 401: '登录超时，请刷新登录后重试',
            404: '找不到对应的请求资源',
            405: '请求方法禁用',
            403: '被拒绝的请求',
            400: '错误的请求',
            500: '服务器遇到错误，无响应',
            502: '无效响应',
            503: '服务不可用',
            'invalid_grant': '验证码错误'
        }
        Message({
            message: data.message && data.message || _statusText[status] || '未知错误！',
            type: 'error',
            duration: 5000
        })
        return Promise.reject(error)
    }
)

export default service
// 用于 数据 取消上次请求绑定 使用
export const CancelToken = axios.CancelToken
