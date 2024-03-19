import request from '@/utils/request'
import { commonExport } from '@/utils'
// 应收账单
export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/bill-receivable',
            method: 'get',
            params
        })
    },
    // 新增or编辑
    update: function(data) {
        return request({
            url: '/bill-receivable',
            method: 'post',
            data
        })
    },
    // 删除
    delete: function(id) {
        return request({
            url: '/bill-receivable/' + id,
            method: 'delete'
        })
    },
    // 获取详情
    detail: function(id) {
        return request({
            url: '/bill-receivable/' + id,
            method: 'get'
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'bill-receivable/export') // 导出接口
    },
    // 合计
    getSummary: function(params) {
        return request({
            url: '/bill-receivable/total-amount',
            method: 'get',
            params
        })
    }
}
