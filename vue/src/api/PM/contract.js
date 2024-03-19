import request from '@/utils/request'
import { commonExport, commonExportByPost } from '@/utils'

export default {
    // 获取销售合同列表
    getList: function(params) {
        return request({
            url: '/sales-contract',
            method: 'get',
            params
        })
    },
    // 新增or编辑销售合同
    update: function(data) {
        return request({
            url: '/sales-contract',
            method: 'post',
            data
        })
    },
    // 删除销售合同
    delete: function(id) {
        return request({
            url: '/sales-contract/' + id,
            method: 'delete'
        })
    },
    // 获取销售合同详情
    detail: function(id) {
        return request({
            url: '/sales-contract/' + id,
            method: 'get'
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'sales-contract/export') // 导出接口
    },
    // 导出列表-post方式
    exportByPost: function(data) {
        commonExportByPost(data, 'sales-contract/export', '销售合同.xls')
    },
    // 导出配置续费模板-post方式
    exportTemplateByPost: function(data) {
        commonExportByPost(data, 'sales-contract/export', '续费设备清单.xlsx')
    },
    // 下载导入失败的列表
    downloadFailureList: function(params) {
        commonExport(params, 'sales-contract/export-error') // 导出接口
    },
    // 获取补购、续费的产品及服务内容列表
    getProList: function(params) {
        return request({
            url: '/sales-contract/get-proList',
            method: 'get',
            params
        })
    },
    // 获取补购、续费的产品原价格
    getOriginPrice: function(params) {
        return request({
            url: '/sales-contract/get-origin',
            method: 'get',
            params
        })
    },
    // 获取续费设备列表
    getRenewDevice: function(params) {
        return request({
            url: '/sales-contract/get-deviceList',
            method: 'get',
            params
        })
    },
    // 获取可调入设备列表
    getImportDevice: function(params) {
        return request({
            url: '/sales-contract/get-deviceListIn',
            method: 'get',
            params
        })
    },
    // 调入or调出设备
    updateDeviceStatus: function(data) {
        return request({
            url: '/sales-contract/update-deviceList',
            method: 'post',
            data
        })
    },
    // 生成设备列表
    generateDeviceList: function(params) {
        return request({
            url: '/sales-contract/generate-deviceList',
            method: 'get',
            params
        })
    },
    // 获取出库申请单列表
    getStorageOutList: function(params) {
        return request({
            url: '/approval-device-out/find',
            method: 'get',
            params
        })
    },
    // 更新历史续费合同
    updateHistory: function(data) {
        return request({
            url: '/sales-contract/create-history',
            method: 'post',
            data
        })
    },
    // 获取历史续费合同的补购、续费的产品及服务内容列表
    getHistoryProList: function(params) {
        return request({
            url: '/sales-contract/get-proList-history',
            method: 'get',
            params
        })
    },
    //
    exportDevice: function(data) {
        commonExportByPost(data, '/sales-contract/exportDevice', '销售合同.xls')
    }
}
