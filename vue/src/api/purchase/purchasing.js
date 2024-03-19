import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取采购清单列表
    getList: function(params) {
        return request({
            url: '/purchase-contract/prod',
            method: 'get',
            params
        })
    },
    // 导出
    export: function(params) {
        commonExport(params, '/purchase-contract/export-prod')
    }
}
