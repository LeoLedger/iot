
import request from '@/utils/request'
//获取树
export  function getMapTree(params) {
    return request({
        url: '/map/tree',
        method: 'get'
    })
}

//树
export function getMapTreeById(params) {
    return request({
        url: '/map/treeById',
        method: 'get',
        params
    })
}



export function getMapInTreeListById(params) {
    return request({
        url: '/map/mapInTreeListById',
        method: 'get',
        params
    })
}


// 系统区域列表
export function getMapList() {
    return request({
        url: '/map/list',
        method: 'get'
    })
}
// 区域列表
export function getMapListSearch(params) {
    return request({
        url: '/map/search',
        method: 'post',
        data: params
    })
}

// 获取区域详情
export function getMapInfo(params) {
    return request({
        url: '/map/getMap',
        method: 'get',
        params
    })
}

// 删除区域
export function deleMap(params) {
    return request({
        url: "/map/deleteMap",
        method: 'post',
        params
    })
}
// 修改区域
export function handlerMap(params) {
    return request({
        url: '/map/saveOrEditMap',
        method: 'post',
        data: params
    })
}

// 区域树列表
export function getMapTreeDefineList(params) {
    return request({
        url: '/map/mapTreeDefinelist',
        method: 'post',
        data: params
    })
}

// 获取区域树详情
export function getMapTreeDefineInfo(params) {
    return request({
        url: '/map/getMapTreeDefine',
        method: 'get',
        params
    })
}


// 修改区域
export function handlerMapTreeDefine(params) {
    return request({
        url: '/map/saveOrEditMapTreeDefine',
        method: 'post',
        data: params
    })
}

// 删除区域树
export function deleteMapTree(params) {
    return request({
        url: "/map/deleteMapTree",
        method: 'post',
        params
    })
}
// 区域在树列表
export function getInMapList(params) {
    return request({
        url: '/map/getInMapList',
        method: 'post',
        data: params
    })
}
// 调入区域到树
export function handlerMapInTree(params) {
    return request({
        url: '/map/callMapInTree',
        method: 'post',
        data: params
    })
}
//调出树
export function callOutMapInTree(params) {
    return request({
        url: '/map/callOutMapInTree',
        method: 'post',
        data: params
    });
}
