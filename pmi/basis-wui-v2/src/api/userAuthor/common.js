import request from '@/utils/request'

// 租户列表
export function getUserMnList(params) {
    return request({
        url: '/api/UserAuthorization',
        method: 'get',
        params
    })
}

// // 租户详情 
// export function getUserMnList(params) {
//   return request({
//     url: '/api/UserAuthorization',
//     method: 'get',
//     params
//   })
// }
