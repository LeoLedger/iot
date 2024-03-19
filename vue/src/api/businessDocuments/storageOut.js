import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/approval-device-out',
            method: 'get',
            params
        })
    },
    // 新增or编辑
    update: function(data) {
        return request({
            url: '/approval-device-out',
            method: 'post',
            data
        })
    },
    // 删除
    delete: function(id) {
        return request({
            url: '/approval-device-out/' + id,
            method: 'delete'
        })
    },
    // 获取详情
    detail: function(params) {
        return request({
            url: '/approval-device-out/detail',
            method: 'get',
            params
        })
    },
    // 获取设备列表
    getDeviceList: function(data) {
        return request({
            url: '/approval-device-out/stock',
            method: 'post',
            data
        })
    },
    // 获取已出库的设备列表
    getOutDeviceList: function(params) {
        return request({
            url: '/approval-device-out/out-number',
            method: 'get',
            params
        })
    },
    // 获取配置的设备列表
    getConfigDeviceList: function(data) {
        return request({
            url: '/approval-device-out/out-device/list',
            method: 'post',
            data
        })
    },
    // 获取配置的设备列表
    exportConfigDeviceList: function(params) {
        commonExport(params, 'approval-device-out/out-device/export')
    },
    // 获取合同详情
    contractDetail: function(params) {
        return request({
            url: '/approval-device-out/contract-detail/',
            method: 'get',
            params
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'approval-device-out/export')
    },
    // 下载导入模板
    downloadTemplate: function(params) {
        commonExport(params, 'approval-device-out/download-template')
    },
    // 下载补购导入模板
    downloadBuyinTemplate: function(params) {
        commonExport(params, 'approval-device-out/download-buyin-template')
    },
    // 下载补购错误文件
    downloadBuyinError: function(batchId, params) {
        commonExport(params, 'approval-device-out/download-buyin-error/' + batchId)
    }
}
