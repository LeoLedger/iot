import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/accounting-cost',
            method: 'get',
            params
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'accounting-cost/export')
    },
    // 获取详情列表
    getDetailList: function(params) {
        return request({
            url: '/accounting-cost/detail',
            method: 'get',
            params
        })
    },
    // 导出详情列表
    exportDetail: function(params) {
        commonExport(params, 'accounting-cost/export-detail')
    }
}
