import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/approval-device-damaged',
            method: 'get',
            params
        })
    },
    // 新增or编辑
    update: function(data) {
        return request({
            url: '/approval-device-damaged',
            method: 'post',
            data
        })
    },
    // 删除
    delete: function(id) {
        return request({
            url: '/approval-device-damaged/' + id,
            method: 'delete'
        })
    },
    // 获取详情
    detail: function(id) {
        return request({
            url: '/approval-device-damaged/' + id,
            method: 'get'
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'approval-device-damaged/export')
    },
    // 获取报损设备列表 approvalDeviceDamagedId
    getDeviceList: function(params) {
        return request({
            url: '/approval-device-damaged/device',
            method: 'get',
            params
        })
    },
    // 下载导入模板
    downloadTemplate: function(params) {
        commonExport(params, 'approval-device-damaged/device/downTemplate')
    }
}
