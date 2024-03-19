
import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/inventory/outBook',
            method: 'get',
            params
        })
    },
    // 导出
    export: function(params) {
        commonExport(params, 'inventory/exportOutReport') // 导出接口
    }
}
