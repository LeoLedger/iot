
import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/inventory/outReport',
            method: 'get',
            params
        })
    },
    // 详情
    detail: function(params) {
        return request({
            url: '/inventory/outDetail',
            method: 'get',
            params
        })
    }
}
