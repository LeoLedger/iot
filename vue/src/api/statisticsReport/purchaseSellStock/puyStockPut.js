
import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/inventory/enterBook',
            method: 'get',
            params
        })
    },
    // 导出
    export: function(params) {
        commonExport(params, 'inventory/exportEnterReport') // 导出接口
    }
}
