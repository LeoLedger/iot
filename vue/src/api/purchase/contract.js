import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取采购合同列表
    getList: function(params) {
        return request({
            url: '/purchase-contract',
            method: 'get',
            params
        })
    },
    // 新增or编辑采购合同
    update: function(data) {
        return request({
            url: '/purchase-contract/',
            method: 'post',
            data
        })
    },
    // 删除采购合同
    delete: function(id) {
        return request({
            url: '/purchase-contract/' + id,
            method: 'delete'
        })
    },
    // 获取采购合同详情
    detail: function(id) {
        return request({
            url: '/purchase-contract/' + id,
            method: 'get'
        })
    },
    // 获取合同付款状态
    getPayStatus: function(id) {
        return request({
            url: '/purchase-contract/pay-status/' + id,
            method: 'get'
        })
    },
    // 导出合同列表
    export: function(params) {
        commonExport(params, '/purchase-contract/export') // 导出接口
    },
    // 导出采购清单列表
    exportProd: function(params) {
        commonExport(params, '/purchase-contract/export-prod') // 导出接口
    }
}
