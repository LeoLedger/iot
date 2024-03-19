import request from "@/utils/request";

/* 角色管理列表 */
export function getRolesList(params) {
    return request({
        url: '/role/getList',
        method: 'post',
        data: params
    });
}

// 获取调入角色的用户列表
export function getCallInUserList(params) {
    return request({
        url: '/role/getRoleCallInUserList',
        method: 'post',
        data: params

    });
}
// 获取调入角色的权限列表
export function getCallInPrivilegeList(params) {
    return request({
        url: '/role/getRoleCallInPrivilegeList',
        method: 'post',
        data: params
    });
}

// 获取未调入角色的用户列表
export function getNotCallInUserList(params) {
    return request({
        url: '/role/getRoleNotCallInUserList',
        method: 'post',
        data: params
    });
}

// 获取未调入角色的权限列表
export function getNotCallInPrivilegeList(params) {
    return request({
        url: '/role/getRoleNotCallInPrivilegeList',
        method: 'post',
        data: params
    });
}

// 调入用户
export function callInUser(params) {
    return request({
        url: '/role/callInUser',
        method: 'post',
        data: params
    });
}

// 调入角色
export function callInPrivilege(params) {
    return request({
        url: '/role/callInPrivilege',
        method: 'post',
        data: params
    });
}

// 调出用户
export function reCallUser(params) {
    return request({
        url: '/role/reCallUser',
        method: 'post',
        data: params
    });
}

// 调出权限
export function reCallPrivilege(params) {
    return request({
        url: '/role/reCallPrivilege',
        method: 'post',
        data: params
    });
}




/* 获取角色详情 */
export function getRolesInfo(roleId) {
    return request({
        url: '/role/getInfo',
        method: 'get',
        params: {
            roleId: roleId
        }
    });
}

/*新增编辑 */
export function saveOrUpdate(data) {
    return request({
        url: '/role/saveOrEdit',
        method: 'post',
        data: data
    });
}

/*删除*/
export function delRoleIds(params) {
    return request({
        url: '/role/del',
        method: 'post',
        data: params
    });
}
