import request from '@/utils/request'
import { commonExport } from '@/utils'
// 收款明细
export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/bill-pay-record/customer',
            method: 'get',
            params
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'bill-pay-record/customer/export') // 导出接口
    }
}
