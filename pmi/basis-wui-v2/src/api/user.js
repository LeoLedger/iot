import request from '@/utils/request'

export function loginAct(data) {
  return request({
    url: '/login',
    data,
    method: 'post'
  })
}

export function getInfo(token) {
  return request({
    url: '/user/userInfo',
    method: 'get'
    // params: {
    //   token
    // }
  })
}

export function logoutAct() {
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

// 获取公钥
export function getPublicKey(params) {
  return request({
    url: '/getPublicKey',
    method: 'get',
    params
  })
}
