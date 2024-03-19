import request from '@/utils/request'

export function getWorkFlow(param) {
  return request({
    url: '/workFlow/getWorkFlow',
    method: 'get',
    params: param
  })
}

export function getWorkFlowList(param) {
  return request({
    url: '/workFlow/getWorkFlowList',
    method: 'post',
    data: param
  })
}

export function saveWorkFlow(param) {
  return request({
    url: '/workFlow/saveWorkFlow',
    method: 'post',
    data: param
  })
}

export function deleteWorkFlow(param) {
  return request({
    url: '/workFlow/deleteWorkFlow',
    method: 'get',
    params: param
  })
}

export function initWorkFlow() {
  return request({
    url: '/workFlow/initWorkFlow',
    method: 'get'
  })
}

export function exportWorkFlow(param) {
  return request({
    url: '/workFlow/exportWorkFlow',
    method: 'get',
    params: param,
    responseType: 'blob'
  })
}

