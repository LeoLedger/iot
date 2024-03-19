
import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/fault',
            method: 'get',
            params
        })
    },
    // 新增or编辑
    update: function(data) {
        return request({
            url: '/fault',
            method: 'post',
            data
        })
    },
    // 删除
    delete: function(id) {
        return request({
            url: '/fault/' + id,
            method: 'delete'
        })
    },
    // 获取详情
    detail: function(id) {
        return request({
            url: '/fault/' + id,
            method: 'get'
        })
    },
    // 获取待处理设备列表
    getDeal: function(params) {
        return request({
            url: '/fault/deal',
            method: 'get',
            params
        })
    },
    // 获取配置信息
    getConfig: function(params) {
        return request({
            url: '/fault/config/',
            method: 'get',
            params
        })
    },
    // 获取临时IMEI
    getTempImei: function(params) {
        return request({
            url: '/fault/temp-imei/generate',
            method: 'get',
            params
        })
    },
    // 设置配置信息
    setConfig: function(data) {
        return request({
            url: '/fault/config/',
            method: 'post',
            data
        })
    },
    // 校验imei是否项目备用设备
    validImei: function(params) {
        return request({
            url: '/fault/validImei',
            method: 'get',
            params
        })
    },
    // 校验设备
    validDevice: function(params) {
        return request({
            url: '/fault/validDevice',
            method: 'get',
            params
        })
    },
    // 校验标段
    validSection: function(sectionId) {
        return request({
            url: '/fault/validSection/' + sectionId,
            method: 'get'
        })
    },
    // 获取可替换设备列表
    getReplaceDevice: function(data) {
        return request({
            url: '/fault/replace-device/list',
            method: 'post',
            data
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'fault/export') // 导出接口
    },
    // 下载模板
    downloadTemplate: function(params = {}) {
        commonExport(params, 'fault/download-template') // 导出接口
    },
    // 工作台导入模板
    workbenchTemplate: function(params = {}) {
        commonExport(params, 'fault/devices/export') // 导出接口
    }
}
