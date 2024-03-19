import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/accounting-detail',
            method: 'get',
            params
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'accounting-detail/export')
    }
}
