
import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/after-sale/car/statistics',
            method: 'get',
            params
        })
    },
    getDetails: function(params) {
        return request({
            url: '/after-sale/car/details',
            method: 'get',
            params
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'after-sale/export-car-fault-stat')
    }
}
