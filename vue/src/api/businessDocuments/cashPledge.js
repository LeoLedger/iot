import request from '@/utils/request'
import { commonExport } from '@/utils'
// 押金
export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/cash-pledge',
            method: 'get',
            params
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'cash-pledge/export') // 导出接口
    }
}
