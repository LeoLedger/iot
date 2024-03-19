import request from '@/utils/request'

// 登录
export function login(data) {
    return request({
        url: '/login',
        data,
        method: 'post'
    })
}
// 登录
export function loginByToken(data) {
    return request({
        url: '/sync/loginByToken',
        data,
        method: 'post'
    })
}
// 登出
export function logout() {
    return request({
        url: '/logout',
        method: 'post'
    })
}
// 获取验证码
export function getCaptcha(params) {
    return request({
        url: '/captcha',
        method: 'get',
        params
    })
}
// 获取菜单
export function getMenuTree() {
    return request({
        url: '/menu-grant/list?appId=409d1a3c-2068-459c-9f9d-8e591d12d6dc',
        method: 'get'
    })
}
// 获取用户信息
export function getUserInfo() {
    return request({
        url: '/account/userinfo',
        method: 'get'
    })
}
// 更新密码
export function updatePassword(params) {
    return request({
        url: '/user/password',
        method: 'put',
        params
    })
}
