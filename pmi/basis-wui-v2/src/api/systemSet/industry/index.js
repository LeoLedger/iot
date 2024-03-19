import request from '@/utils/request'

/**
 * 行业分页列表
 * @param params
 */
export function getPage(params) {
  return request({
    url: '/industry/page',
    method: 'post',
    data: params
  })
}

/**
 * 行业分页列表
 * @param params
 */
export function addOrEdit(data) {
  return request({
    url: '/industry/addOrEdit',
    method: 'post',
    data
  })
}

/**
 * 行业分页列表
 * @param params
 */
export function getInfo(params) {
  return request({
    url: '/industry/info',
    method: 'get',
    params
  })
}

// 删除菜单
export function deleteIndustry(params) {
  return request({
    url: '/industry/delete',
    method: 'post',
    params
  })
}
