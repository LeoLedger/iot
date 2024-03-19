import request from "@/utils/request";

//字典分页列表
export function getDictList(params) {
    return request({
        url: '/dict/list',
        method: 'post',
        params
    })
}

//字典列表
export function getDictListAll(params) {
    return request({
        url: '/dict/listAll',
        method: 'get',
        params
    })
}

//获取字典信息
export function getDictInfo(params) {
    return request({
        url: '/dict/dictInfo',
        method: 'get',
        params
    })
}

//保存字典信息
export function submintDict(data) {
    return request({
        url: '/dict/addOrEditDict',
        method: 'post',
        data
    })
}

//删除字典信息
export function deleteDict(params) {
    return request({
        url: '/dict/deleteDict',
        method: 'post',
        params
    })
}

//命名空间树形查询
export function getDictTree(params) {
    return request({
        url: '/namespace/tree',
        method: 'get',
        params
    })
}

//命名空间列表
export function getNSList(params) {
    return request({
        url: '/namespace/nsList',
        method: 'get',
        params
    })
}

//保存命名空间信息
export function submintNS(data) {
    return request({
        url: '/namespace/addOrEditNS',
        method: 'post',
        data
    })
}


