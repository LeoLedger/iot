import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取智能设备列表
    getList: function(params) {
        return request({
            url: '/device-sim/new-warehouse',
            method: 'get',
            params
        })
    },
    // 获取详情
    detail: function(id) {
        return request({
            url: '/device-sim/' + id,
            method: 'get'
        })
    },
    detailBySiM: function(sim) {
        return request({
            url: '/device-sim/' + sim + '/detail',
            method: 'get'
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'device-sim/export') // 导出接口
    },
    exportAll: function(params) {
        commonExport(params, 'device-sim/exportAll') // 导出接口
    },
    // 获取所有SIM卡列表
    getListAll: function(params) {
        return request({
            url: '/device-sim/list-all',
            method: 'get',
            params
        })
    }
}
