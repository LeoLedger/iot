import request from "@/utils/request";

//新增/修改 部门树
export function saveDeptTreeDefine(data) {
  return request({
    url: '/deptTreeDefine/save',
    method: 'post',
    data
  })
}

//获取部门树列表
export function getDeptTreeDefineList() {
  return request({
    url: '/deptTreeDefine/list',
    method: 'get'
  })
}
