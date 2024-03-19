import request from '@/utils/request'

// 系统菜单列表
export function getMenuList() {
    return request({
        url: '/menu/list',
        method: 'get'
    })
}

export function getMenuTree(params) {
    return request({
        url: '/menu/tree',
        method: 'get',
        params
    })
}

// 获取系统结构
export function getSysMenu(params) {
    return request({
        url: '/menu/tree',
        method: 'get',
        params
    })
}

// 获取权限树
export function getMenuGrant(params) {
    return request({
        url: '/menu-grant',
        method: 'get',
        params
    })
}
// 更新权限树
export function updateMenuGrant(params, data) {
    return request({
        url: '/menu-grant',
        method: 'post',
        params,
        data
    })
}
