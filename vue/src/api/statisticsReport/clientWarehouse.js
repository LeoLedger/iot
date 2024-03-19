
import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取列表
    toCompany: function(params) {
        return request({
            url: '/inventory/report-customer',
            method: 'get',
            params
        })
    },
    toProject: function(params) {
        return request({
            url: '/inventory/report-project',
            method: 'get',
            params
        })
    },
    toSection: function(params) {
        return request({
            url: '/inventory/report-section',
            method: 'get',
            params
        })
    }
}
