/** 客户管理接口 */
import request from '@/utils/request'
import { commonExport } from '@/utils'


// 客户导出
export function queryTenantExport(params) {
    commonExport(params, '/api/Tenant/Export')
}

// 客户搜索
export function getTenantList(params) {
    return request({
        url: '/api/Tenant',
        method: 'get',
        params
    })
}

// 新增或者编辑客户信息
export function queryTenantEdit(data) {
  return request({
    url: '/api/Tenant',
    method: 'post',
    data
  })
}

// 删除客户信息
export function queryTenantDelete(id, deleteContract = true) {
  return request({
    url: '/api/Tenant/'+ id,
    method: 'delete',
    params: {deleteContract}
  })
}
// 判断客户是否存在合同
export function queryExistsContract(tenantId) {
    return request({
        url: '/api/TenantContract/ExistsContract',
        method: 'get',
        params: {tenantId}
    })
}
// 客户详情信息
export function getTenantDetail(id) {
  return request({
    url: '/api/Tenant/' + id,
    method: 'get'
  })
}

// 启用客户 /api/Tenant/{id} 启用
export function editTenantEnable(data) {
    return request({
        url: '/api/Tenant/' + data.id + '?enable=' + data.enable,
        method: 'post',
    })
}

/**
 * ServicePackage : 服务套餐
 */

// 服务套餐详情
export function getServicePackageDetail(id) {
    return request({
        url: '/api/ServicePackage/' + id,
        method: 'get'
    })
}

// 删除服务套餐
export function deleteServicePackageDetail(id) {
    return request({
        url: '/api/ServicePackage/' + id,
        method: 'delete'
    })
}

// 搜索 服务套餐
export function searchServicePackage(params) {
    return request({
        url: '/api/ServicePackage',
        method: 'get',
        params
    })
}

// 创建或修改服务套餐
export function changeServicePackage(data) {
    return request({
        url: '/api/ServicePackage',
        method: 'post',
        data
    })
}

// 导出服务套餐
export function exportServicePackage(params) {
    commonExport(params, '/api/ServicePackage/Export')
}

/**
 * TenantContract : 合同管理
 */

// 合同导出
export function exportTenantContract(params) {
    commonExport(params, '/api/TenantContract/Export')
}

// 获取合同收款情况
export function getContractPayPlanDetail(tenantId) {
    return request({
        url: '/api/TenantContract/GetPayPlanDetail',
        method: 'get',
        params: {tenantId}
    })
}

// 合同搜索
export function tenantContractList(params) {
    return request({
        url: '/api/TenantContract',
        method: 'get',
        params
    })
}

// 合同 创建或编辑合同
export function editTenantContract(data) {
    return request({
        url: '/api/TenantContract',
        method: 'post',
        data
    })
}

// 合同删除
export function deleteTenantContract(id) {
    return request({
        url: '/api/TenantContract/' + id,
        method: 'delete'
    })
}

// 合同详情
export function getTenantContractDetail(id) {
    return request({
        url: '/api/TenantContract/' + id,
        method: 'get'
    })
}

/**
 * TenantContractPayPlan : 收款接口
 */

// 根据合同ID或者合同剩余未收款金额
export function getSurplusAmount(params) {
    return request({
        url: '/api/TenantContractPayPlan/GetSurplusAmount/',
        method: 'get',
        params
    })
}

// 添加收款
export function addContractPayPlan(data) {
    return request({
        url: '/api/TenantContractPayPlan',
        method: 'post',
        data
    })
}
