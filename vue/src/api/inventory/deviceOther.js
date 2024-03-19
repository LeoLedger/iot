import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取智能设备列表
    getList: function(params) {
        return request({
            url: '/device-other',
            method: 'get',
            params
        })
    },
    // 获取详情
    detail: function(id) {
        return request({
            url: '/device-other/' + id,
            method: 'get'
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'device-other/export') // 导出接口
    },
    // 统计
    num: function(params) {
        return request({
            url: '/device-other/num',
            method: 'get',
            params
        })
    }
}
