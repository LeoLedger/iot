import request from '@/utils/request'
import { commonExport } from '@/utils'
// 收款认领
export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/bill-receivable-record-claim',
            method: 'get',
            params
        })
    },
    // 新增or编辑
    update: function(data) {
        return request({
            url: '/bill-receivable-record-claim',
            method: 'post',
            data
        })
    },
    // 删除
    delete: function(id) {
        return request({
            url: '/bill-receivable-record-claim/' + id,
            method: 'delete'
        })
    },
    // 获取详情
    detail: function(id) {
        return request({
            url: '/bill-receivable-record-claim/' + id,
            method: 'get'
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'bill-receivable-record-claim/export') // 导出接口
    },
    // 获取发票详情
    invoicedDetail: function(id) {
        return request({
            url: '/bill-receivable-record-claim/getInvoiced/' + id,
            method: 'get'
        })
    },
    adopted: function(data) {
        return request({
            url: '/bill-receivable-record-claim/adopted',
            method: 'post',
            data
        })
    }
}
