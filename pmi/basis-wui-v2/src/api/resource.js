import request from '@/utils/request'

// 获取系统结构
export function getSysTem(params) {
    return request({
        url: '/app/tree',
        method: 'get'
    })
}

// 获取编码
export function getCode(data) {
    return request({
        url: '/com/getCode',
        method: 'get',
        params: data
    })
}
// 获取成本中心
export function getCostCenter(params) {
    return request({
        url: '/cost-center/list',
        method: 'get',
        params
    })
}
