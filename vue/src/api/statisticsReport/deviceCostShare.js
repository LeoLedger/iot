
import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/device-cost-share/statistics',
            method: 'get',
            params
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'device-cost-share/export')
    }
}
