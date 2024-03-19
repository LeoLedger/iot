import request from '@/utils/request'

export function getAppList(data) {
  return request({
    url: '/app/getAppList',
    method: 'post',
    data
  })
}

export function getAllAppList(data) {
  return request({
    url: '/app/getAllAppList',
    method: 'get',
    data
  })
}

export function getAppById(params) {
  return request({
    url: '/app/getAppById',
    method: 'get',
    params: params
  })
}

export function saveOrEditApp(data) {
  return request({
    url: '/app/saveOrEditApp',
    method: 'post',
    data
  })
}

export function deleteByAppId(params) {
  return request({
    url: '/app/deleteByAppId',
    method: 'get',
    params: params
  })
}

/**
 * 根据程序guid获取程序code
 * @param params
 */
export function getAppCodeByGuid(params) {
  return request({
    url: '/app/getAppCodeByGuid',
    method: 'get',
    params: params
  })
}

