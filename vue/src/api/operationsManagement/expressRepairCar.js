import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/expressRepairCar',
            method: 'get',
            params
        })
    },
    // 新增or编辑
    update: function(data) {
        return request({
            url: '/expressRepairCar',
            method: 'post',
            data
        })
    },
    // 删除
    delete: function(guid) {
        return request({
            url: '/expressRepairCar/' + guid,
            method: 'delete'
        })
    },
    // 获取详情
    detail: function(guid) {
        return request({
            url: '/expressRepairCar/' + guid,
            method: 'get'
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'expressRepairCar/export') // 导出接口
    },
    exportDevice: function(params) {
        commonExport(params, 'expressRepairCar/export-device') // 导出接口
    },
    getDeviceList: function(params) {
        return request({
            url: '/expressRepairCar/get-device',
            method: 'get',
            params
        })
    },
    // 导出模板
    downloadTemplate: function(params) {
        commonExport(params, 'expressRepairCar/down-template') // 导出接口
    },
    downloadTemplateRepair: function(params) {
        commonExport(params, 'expressRepairCar/down-template-repair') // 导出接口
    }
    // // 下载导入失败的列表
    // downloadFailureList: function(params) {
    //     commonExport(params, 'expressRepairCar/export-error') // 导出接口
    // }
}
