import request from "@/utils/request";
import {
    buildUrl
} from "@/utils";
import {
    getToken
} from "@/utils/auth"; //导入token
// 权限列表
export function GetPrivilegePage(params) {
    return request({
        url: '/privilege/search',
        method: 'post',
        data: params
    })
}

// 导出权限列表
export function exportPermissionXml(params) {
    const tmp = JSON.parse(JSON.stringify(params));
    tmp["access_token"] = getToken();
    const url = buildUrl(
        process.env.VUE_APP_BASE_API + "/api/privilege/ExportPrivilegeRecord",
        tmp
    );
    window.open(url);
}

// 删除权限
export function removeAuth(data) {
    return request({
        url: '/privilege/delete',
        method: 'post',
        data
    })
}

// 删除权限 批量
export function removeMany(data) {
    return request({
        url: '/privilege/del',
        method: 'post',
        data
    })
}

//处理权限

export function handlerAuth(data) {
    return request({
        url: 'privilege/saveOrEdit',
        method: 'post',
        data
    })
}

// 权限详情
export function getAuthInfo(privilegeId) {
    return request({
        url: '/privilege/detail?privilegeId=' + privilegeId,
        method: 'get'
    })
}

// 获取系统权限树

export function GetPrivilegeTree(params) {
    return request({
        url: '/privilege/tree',
        method: 'post',
        data: params
    })
}

// 获取某菜单功能权限列表
export function GetPrivilegeList(params) {
    return request({
        url: '/privilege/GetList',
        method: 'post',
        data: params
    })
}
