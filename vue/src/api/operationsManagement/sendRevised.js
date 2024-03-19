
import store from '@/store'
import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/express',
            method: 'get',
            params
        })
    },
    // 新增or编辑
    update: function(data) {
        return request({
            url: '/express',
            method: 'post',
            data
        })
    },
    // 删除
    delete: function(id) {
        return request({
            url: '/express/' + id,
            method: 'delete'
        })
    },
    // 获取详情
    detail: function(id) {
        return request({
            url: '/express/' + id,
            method: 'get'
        })
    },
    // 获取工作台列表
    getVerifyAll: function(params) {
        return request({
            url: '/express/verify-all',
            method: 'get',
            params
        })
    },
    // 获取故障设备
    getFaultDevices: function(params) {
        return request({
            url: '/fault/fault-devices',
            method: 'get',
            params
        })
    },
    // 获取报损设备
    getScrapDevices: function(params) {
        return request({
            url: '/fault/scrap-devices',
            method: 'get',
            params
        })
    },
    // 获取设备附件
    getDeviceFiles: function(params) {
        return request({
            url: '/express/files',
            method: 'get',
            params
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'express/export') // 导出接口
    },
    // 下载模板
    downloadTemplate: function(params = {}) {
        commonExport(params, 'express/download-template') // 导出接口
    },
    // 创建导入模板
    createTemplate: function(params = {}) {
        commonExport(params, 'express/device-waiting-repair/download-template') // 导出接口
    },
    // 分配导入模板
    allocationTemplate: function(params = {}) {
        commonExport(params, 'express/distribution/export') // 导出接口
    },
    // 核验导入模板
    workbenchTemplate: function(params = {}) {
        commonExport(params, 'express/device/export') // 导出接口
    },
    // 下载导入失败的列表
    downloadFailureList: function(id, params) {
        commonExport(params, 'express/download-error/' + id) // 导出接口
    },
    // 编辑导出
    editExport: function(params) {
        commonExport(params, 'express/edit/export')
    },
    // 维修反馈导出
    fedbackExport: function(params) {
        commonExport(params, 'express/feedback/export')
    },
    // 核验确认导出
    verifiableExport: function(params) {
        commonExport(params, 'express/verify-all/export')
    }
}
