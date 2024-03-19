import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/approval-device-in',
            method: 'get',
            params
        })
    },
    // 新增or编辑
    update: function(data) {
        return request({
            url: '/approval-device-in',
            method: 'post',
            data
        })
    },
    // 删除
    delete: function(id) {
        return request({
            url: '/approval-device-in/' + id,
            method: 'delete'
        })
    },
    // 获取详情
    detail: function(id) {
        return request({
            url: '/approval-device-in/' + id,
            method: 'get'
        })
    },
    // 获取仓库列表
    getWarehouse: function(contractId) {
        return request({
            url: `/approval-device-in/${contractId}/wareHouses`,
            method: 'get'
        })
    },
    // 获取设备清单列表
    getDeviceList: function(params) {
        return request({
            url: '/approval-device-in/device-list',
            method: 'get',
            params
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'approval-device-in/export')
    },
    // 导出设备列表
    exportDeviceList: function(params) {
        commonExport(params, 'approval-device-in/export/inDevice')
    },
    // 下载导入模板
    downloadTemplate: function(productCode) {
        commonExport({}, `approval-device-in/${productCode}/downTemplate`)
    }
}
