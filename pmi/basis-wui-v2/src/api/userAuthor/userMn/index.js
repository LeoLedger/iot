import request from '@/utils/request'

import {
    buildUrl
} from "@/utils";
import {
    getToken
} from "@/utils/auth"; //导入token

// 用户管理列表
export function getUserMnList(params) {
    return request({
        url: '/user/list',
        method: 'get',
        params
    })
}

// 导出用户列表
export function exportUserList(params) {
    const tmp = JSON.parse(JSON.stringify(params));
    tmp["access_token"] = getToken();
    const url = buildUrl(
        process.env.VUE_APP_BASE_API + "/api/UserAuthorization/ExportUserRecord",
        tmp
    );
    window.open(url);
}

// 编辑、新增用户
export function handelUser(data) {
    return request({
        url: '/api/UserAuthorization/Post',
        method: "post",
        data
    })
}
// 删除客户

export function removeUser(id) {
    return request({
        url: '/api/UserAuthorization/' + id,
        method: 'delete',

    })
}

// 获取关联客户列表
export function getRelatiion(params) {
    return request({
        url: '/api/Tenant',
        method: 'get',
        params
    })
}

// 获取用户详情


export function getUserInfo(params) {
    return request({
        url: "/api/UserAuthorization/Get",
        method: 'get',
        params
    })
}
