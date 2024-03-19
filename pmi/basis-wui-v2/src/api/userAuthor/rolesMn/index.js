import request from "@/utils/request";
import {
    buildUrl
} from "@/utils";
import {
    getToken
} from "@/utils/auth"; //导入token

// 角色管理列表
export function getRolesList(params) {
    return request({
        url: '/api/UserAuthorization/GetRole',
        method: 'get',
        params
    })
}

// 导出角色管理列表
export function exportRolesList(params) {
    const tmp = JSON.parse(JSON.stringify(params));
    tmp["access_token"] = getToken();
    const url = buildUrl(
        process.env.VUE_APP_BASE_API + "/api/UserAuthorization/ExportRoleRecord",
        tmp
    );
    window.open(url);
}

// 删除角色
export function removeRoles(params) {
    return request({
        url: '/api/UserAuthorization/DeleteRole',
        method: 'delete',
        params
    })
}
//  提交角色
export function handelRole(data) {
    return request({
        url: '/api/UserAuthorization/CreateOrUpdateRole',
        method: 'post',
        data
    })
}

// 获取角色详情
export function getRoleInfo(params) {
    return request({
        url: '/api/UserAuthorization/GetRoleDetail',
        method: 'get',
        params
    })
}
