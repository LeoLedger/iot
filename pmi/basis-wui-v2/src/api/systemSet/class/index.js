import request from "@/utils/request";

//类型列表
export function getClassList(params) {
    return request({
        url: '/class/list',
        method: 'post',
        params
    })
}

//类型列表
export function getClassTree(params) {
    return request({
        url: '/class/tree',
        method: 'get',
        params
    })
}

//获取类型信息
export function getClassInfo(params) {
    return request({
        url: '/class/classInfo',
        method: 'get',
        params
    })
}

//保存类型信息
export function addOrEditClass(data) {
    return request({
        url: '/class/addOrEditClass',
        method: 'post',
        data
    })
}

//删除类型信息
export function deleteClass(params) {
    return request({
        url: '/class/deleteClass',
        method: 'post',
        params
    })
}

//获取自定义树列表
export function getCtdList(params) {
    return request({
        url: '/class/ctdList',
        method: 'get',
        params
    })
}

//保存类型树信息
export function addOrEditCtd(data) {
    return request({
        url: '/class/addOrEditCtd',
        method: 'post',
        data
    })
}
//获取类型树信息
export function getCtdInfo(params) {
    return request({
        url: '/class/ctdInfo',
        method: 'get',
        params
    })
}

//类型列表
export function classPageList(params) {
    return request({
        url: '/class/classPageList',
        method: 'post',
        params
    })
}

//获取待调入的类型树
export function getNotInTreeList(params) {
    return request({
        url: '/class/getNotInTreeList',
        method: 'get',
        params
    })
}

//获取已调入的类型树
export function getInTreeList(params) {
    return request({
        url: '/class/getInTreeList',
        method: 'get',
        params
    })
}

//调入类型树
export function addCT(data) {
    return request({
        url: '/class/addCT',
        method: 'post',
        data
    })
}
//调出类型树
export function delCT(data) {
    return request({
        url: '/class/delCT',
        method: 'post',
        data
    })
}








