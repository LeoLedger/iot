import request from '@/utils/request'
import { commonExport, commonExportByPost } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/fault-repair-car-device',
            method: 'get',
            params
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'fault-repair-car-device/export') // 导出接口
    },
    // 导出列表-post方式
    exportByPost: function(data) {
        commonExportByPost(data, 'fault-repair-car-device/export', '故障设备-车.xlsx')
    },
    // 获取设备附件
    getDeviceFiles: function(params) {
        return request({
            url: '/fault-repair-car/files',
            method: 'get',
            params
        })
    }
}
