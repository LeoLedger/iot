
import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/inventory/enterReport',
            method: 'get',
            params
        })
    },
    detail: function(params) {
        return request({
            url: '/inventory/enterDetail',
            method: 'get',
            params
        })
    }
}
