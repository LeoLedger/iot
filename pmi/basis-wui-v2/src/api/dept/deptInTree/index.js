import request from "@/utils/request";

//新增/修改 部门树体
export function saveDeptInTree(params) {
  return request({
    url: '/deptInTree/save',
    method: 'post',
    data: params
  })
}

//查询列表
export function getDeptInTreeList(params) {
  return request({
    url: '/deptInTree/list',
    method: 'post',
    data: params
  })
}

//删除
export function deleteDeptInTree(params) {
  return request({
    url: '/deptInTree/delete',
    method: 'post',
    data: params
  })
}

//获取调入的树数据
export function getInTreeList(params) {
  return request({
    url: '/deptInTree/tree',
    method: 'get',
    params
  })

}
