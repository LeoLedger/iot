import request from '@/utils/request'

// 菜单列表
export function getMenuList(params) {
    return request({
        url: '/menu/search',
        method: 'post',
        data: params
    })
}
// 菜单下拉list
export function getMenuOption(params) {
    return request({
        url: '/menu/getSimpleList',
        method: 'get',
        params
    })
}

// 删除菜单
export function deleMenu(params) {
    return request({
        url: '/menu/deleteMenu',
        method: 'post',
        params
    })
}
// 操作菜单
export function handlerMenu(data) {
    return request({
        url: '/menu/saveOrEditMenu',
        method: 'post',
        data
    })
}
// 菜单详情
export function getMenuInfo(params) {
    return request({
        url: '/menu/getMenu',
        method: 'get',
        params
    })
}

// buttons功能详情
export function getButtonList(params) {
    return request({
        url: '/menu/GetButtonList',
        method: 'get',
        params
    })
}
// 根据id获取菜单树
export function getMenuTree(id, params) {
    return request({
        url: '/menu/all/' + id,
        method: 'get',
        params
    })
}
