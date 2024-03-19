import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/approval-inventoryt-device',
            method: 'get',
            params
        })
    },
    // 新增or编辑
    update: function(data) {
        return request({
            url: '/approval-inventoryt-device',
            method: 'post',
            data
        })
    },
    // 删除
    delete: function(id) {
        return request({
            url: '/approval-inventoryt-device/' + id,
            method: 'delete'
        })
    },
    // 获取详情
    detail: function(id) {
        return request({
            url: '/approval-inventoryt-device/' + id,
            method: 'get'
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'approval-inventoryt-device/export')
    },
    // 获取盘点清单
    getCheckList: function(params) {
        return request({
            url: '/approval-inventoryt-device/prod',
            method: 'get',
            params
        })
    },
    // 获取盘点清单
    getDeviceList: function(params) {
        return request({
            url: '/approval-inventoryt-device/device',
            method: 'get',
            params
        })
    },
    // 下载导入模板
    downloadTemplate: function(productCode) {
        commonExport({}, '/approval-inventoryt-device/device/downTemplate')
    }
}
