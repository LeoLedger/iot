import request from '@/utils/request'

export function getDeptTree(params) {
  return request({
    url: '/dept/tree',
    method: 'get'
  })
}

// 获取部门列表
export function getDeptList(data) {
  return request({
    url: '/dept/list',
    method: 'post',
    data
  })
}
// 获取使用部门列表
export function getDeptAll(params) {
  return request({
    url: '/dept/getAll',
    method: 'get',
    params
  })
}

export function saveOrEditDept(data) {
  return request({
    url: '/dept/save',
    method: 'post',
    data
  })
}

export function getDeptById(params) {
  return request({
    url: '/dept/getDeptById',
    method: 'get',
    params
  })
}

// 删除部门
export function deleteDept(data) {
  return request({
    url: '/dept/delete',
    method: 'post',
    data
  })
}

// 获取已调入部门的用户
export function getInDeptUsers(params) {
  return request({
    url: '/user/listInDept',
    method: 'post',
    data: params
  })
}

// 获取未调入部门的用户
export function getNotInDeptUsers(params) {
  return request({
    url: '/user/listNotInDept',
    method: 'post',
    data: params
  })
}

// 调入人员
export function callInUser(params) {
  return request({
    url: '/dept/callinUser',
    method: 'post',
    data: params
  })
}

// 调出人员
export function calloutUser(params) {
  return request({
    url: '/dept/calloutUser',
    method: 'post',
    data: params
  })
}
