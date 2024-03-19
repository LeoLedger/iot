import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/approvalPurchase',
            method: 'get',
            params
        })
    },
    // 新增or编辑
    update: function(data) {
        return request({
            url: '/approvalPurchase',
            method: 'post',
            data
        })
    },
    // 删除
    delete: function(id) {
        return request({
            url: '/approvalPurchase/' + id,
            method: 'delete'
        })
    },
    // 获取详情
    detail: function(id) {
        return request({
            url: '/approvalPurchase/' + id,
            method: 'get'
        })
    },
    // 核销
    verifiable: function(data) {
        return request({
            url: '/approvalPurchase/verifiable',
            method: 'post',
            data
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'approvalPurchase/export') // 导出接口
    }
}
