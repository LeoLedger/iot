import request from '@/utils/request'

export function getUserById(params) {
  return request({
    url: 'user/getUserById',
    method: 'get',
    params
  })
}

// 获取用户列表
export function getUserList(data) {
  return request({
    url: '/user/list',
    method: 'post',
    data
  })
}

//添加用户
export function saveUser(data) {
  return request({
    url: '/user/save',
    method: 'post',
    data
  })
}

//删除用户
export function deleteUser(data) {
  return request({
    url: '/user/delete',
    method: 'post',
    data
  })
}

// 获取调入用户的角色
export function getUserCallInRoleList(params) {
    return request({
        url: '/user/getUserCallInRoleList',
        method: 'post',
        data: params

    });
}
// 获取未调入用户的角色
export function getUserNotCallInRoleList(params) {
    return request({
        url: '/user/getUserNotCallInRoleList',
        method: 'post',
        data: params
    });
}
// 调入角色
export function callInRole(params) {
    return request({
        url: '/user/callInRole',
        method: 'post',
        data: params
    });
}
// 调出角色
export function reCallRole(params) {
    return request({
        url: '/user/reCallRole',
        method: 'post',
        data: params
    });
}


// 获取调入用户的权限
export function getUserCallInPrivilegeList(params) {
    return request({
        url: '/user/getUserCallInPrivilegeList',
        method: 'post',
        data: params

    });
}
// 获取未调入用户的权限
export function getUserNotCallInPrivilegeList(params) {
    return request({
        url: '/user/getUserNotCallInPrivilegeList',
        method: 'post',
        data: params
    });
}
// 调入权限
export function callInPrivilege(params) {
    return request({
        url: '/user/callInPrivilege',
        method: 'post',
        data: params
    });
}
// 调出权限
export function reCallPrivilege(params) {
    return request({
        url: '/user/reCallPrivilege',
        method: 'post',
        data: params
    });
}


// 获取调入用户的部门
export function getUserCallInDeptList(params) {
    return request({
        url: '/user/getUserCallInDeptList',
        method: 'post',
        data: params

    });
}
// 获取未调入用户的部门
export function getUserNotCallInDeptList(params) {
    return request({
        url: '/user/getUserNotCallInDeptList',
        method: 'post',
        data: params
    });
}
// 调入部门
export function callInDept(params) {
    return request({
        url: '/user/callInDept',
        method: 'post',
        data: params
    });
}
// 调出部门
export function reCallDept(params) {
    return request({
        url: '/user/reCallDept',
        method: 'post',
        data: params
    });
}


// 获取 调入/未调入 行业
export function getIndustryList(params) {
  return request({
    url: '/user/getIndustryList',
    method: 'post',
    data: params
  });
}

// 调入行业
export function callInIndustry(params) {
  return request({
    url: '/user/callInIndustry',
    method: 'post',
    data: params
  });
}

// 调出行业
export function reCallIndustry(params) {
  return request({
    url: '/user/reCallIndustry',
    method: 'post',
    data: params
  });
}
