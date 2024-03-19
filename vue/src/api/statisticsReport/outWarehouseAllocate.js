
import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/inventory/transferReport',
            method: 'get',
            params
        })
    },
    // 详情
    detail: function(params) {
        return request({
            url: '/inventory/transferDetail',
            method: 'get',
            params
        })
    }
}
