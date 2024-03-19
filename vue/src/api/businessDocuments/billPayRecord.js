import request from '@/utils/request'
import { commonExport } from '@/utils'
// 应收账单
export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/bill-pay-record',
            method: 'get',
            params
        })
    },
    // 新增or编辑
    update: function(data) {
        return request({
            url: '/bill-pay-record',
            method: 'post',
            data
        })
    },
    // 删除
    delete: function(guidId) {
        return request({
            url: '/bill-pay-record/' + guidId,
            method: 'delete'
        })
    },
    // 获取详情
    detail: function(id) {
        return request({
            url: '/bill-pay-record/' + id,
            method: 'get'
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'bill-pay-record/export') // 导出接口
    },
    // 查看发票列表
    getInvoiceList: function(params) {
        return request({
            url: '/bill-pay-record/invoice',
            method: 'get',
            params
        })
    },
    // 获取认领列表
    getClaimList: function(params) {
        return request({
            url: '/bill-pay-record/record',
            method: 'get',
            params
        })
    },
    // 获取已退还押金
    getReturnCashList: function(params) {
        return request({
            url: '/bill-pay-record/newRecord',
            method: 'get',
            params
        })
    },
    adopted: function(data) {
        return request({
            url: '/bill-pay-record/adopted',
            method: 'post',
            data
        })
    }
}
