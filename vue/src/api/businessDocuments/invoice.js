import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/approvalInvoice',
            method: 'get',
            params
        })
    },
    // 新增or编辑
    update: function(data) {
        return request({
            url: '/approvalInvoice',
            method: 'post',
            data
        })
    },
    // 删除
    delete: function(id) {
        return request({
            url: '/approvalInvoice/' + id,
            method: 'delete'
        })
    },
    // 获取开票申请单详情
    detail: function(id) {
        return request({
            url: '/approvalInvoice/' + id,
            method: 'get'
        })
    },
    // 获取发票实体详情
    invoiceDetail: function(id) {
        return request({
            url: '/approvalInvoice/getInvoice/' + id,
            method: 'get'
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'approvalInvoice/export')
    },
    // 获取押金条编号
    getDepositCode: function(params) {
        return request({
            url: '/approvalInvoice/getCode',
            method: 'get',
            params
        })
    },
    // 获取最新的开票金额
    getNewestAmount: function(params) {
        return request({
            url: '/bill-receivable/unPage',
            method: 'get',
            params
        })
    },
    // 新增or编辑
    replace: function(data) {
        return request({
            url: '/approvalInvoice/replace',
            method: 'post',
            data
        })
    },
    // 作废发票
    cancel: function(data) {
        return request({
            url: '/approvalInvoice/cancel',
            method: 'post',
            data
        })
    },
    // 作废发票
    again: function(data, id) {
        return request({
            url: '/approvalInvoice/' + id + '/again',
            method: 'post',
            data
        })
    }
}
