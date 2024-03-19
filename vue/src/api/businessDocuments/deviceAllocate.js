import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/approvalDeviceTransfer',
            method: 'get',
            params
        })
    },
    // 新增or编辑
    update: function(data) {
        return request({
            url: '/approvalDeviceTransfer',
            method: 'post',
            data
        })
    },
    // 删除
    delete: function(id) {
        return request({
            url: '/approvalDeviceTransfer/' + id,
            method: 'delete'
        })
    },
    // 获取详情
    detail: function(id) {
        return request({
            url: '/approvalDeviceTransfer/' + id,
            method: 'get'
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'approvalDeviceTransfer/export')
    },
    // 获取仓库列表
    getWarehouse: function() {
        return request({
            url: '/approvalDeviceTransfer/warehouse/list',
            method: 'get'
        })
    },
    // 获取仓库仓位下的产品类型
    getProductTypeList: function(params) {
        return request({
            url: '/approvalDeviceTransfer/product-inventory/list',
            method: 'get',
            params
        })
    },
    // 获取调拨设备列表
    getDeviceList: function(params) {
        return request({
            url: '/approvalDeviceTransfer/device/list',
            method: 'get',
            params
        })
    },
    // 下载导入模板
    downloadTemplate: function(params) {
        commonExport(params, 'approvalDeviceTransfer/download-template')
    }
}
