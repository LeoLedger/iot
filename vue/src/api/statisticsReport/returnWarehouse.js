
import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/inventory/returnReport',
            method: 'get',
            params
        })
    },
    // 详情
    detail: function(params) {
        return request({
            url: '/inventory/returnDetail',
            method: 'get',
            params
        })
    }
}
