import request from '@/utils/request'
import { commonExport, commonExportByPost } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/fault-repair-car',
            method: 'get',
            params
        })
    },
    // 新增or编辑
    update: function(data) {
        return request({
            url: '/fault-repair-car',
            method: 'post',
            data
        })
    },
    // 删除
    delete: function(id) {
        return request({
            url: '/fault-repair-car/' + id,
            method: 'delete'
        })
    },
    // 获取详情
    detail: function(id) {
        return request({
            url: '/fault-repair-car/' + id,
            method: 'get'
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'fault-repair-car/export')
    },
    // 导出列表-post方式
    exportByPost: function(data) {
        commonExportByPost(data, 'fault-repair-car/export', '车辆设备故障维修管理.xlsx')
    },
    // 下载故障设备数据模板
    downloadFault: function(params) {
        commonExport(params, 'fault-repair-car/export-fault-car')
    },
    // 下载故障设备数据+模板(故障确认)
    downloadFaultConfirm: function(params) {
        commonExport(params, 'fault-repair-car/export-fault-car-device')
    },
    // 导入故障设备数据模板(只校验)
    importFault: function(params) {
        return request({
            url: '/fault-repair-car/import-fault-car',
            method: 'post'
        })
    },
    // 导入故障设备数据模板-故障确认(只校验)
    importFaultConfirm: function(params) {
        return request({
            url: '/fault-repair-car/import-fault-car-device',
            method: 'post'
        })
    },
    getDeviceList: function(params) {
        return request({
            url: '/fault-repair-car/get-device',
            method: 'get',
            params
        })
    },
    // 下载导入失败的列表
    downloadFailureList: function(params) {
        commonExport(params, 'fault-repair-car/export-error') // 导出接口
    }
}
