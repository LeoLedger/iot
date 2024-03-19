import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/approval-sim-renew',
            method: 'get',
            params
        })
    },
    // 新增or编辑
    update: function(data) {
        return request({
            url: '/approval-sim-renew',
            method: 'post',
            data
        })
    },
    // 删除
    delete: function(id) {
        return request({
            url: '/approval-sim-renew/' + id,
            method: 'delete'
        })
    },
    // 获取详情
    detail: function(id) {
        return request({
            url: '/approval-sim-renew/' + id,
            method: 'get'
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'approval-sim-renew/export')
    },
    // 导入模板
    downloadTemplate: function(params) {
        commonExport(params, 'approval-sim-renew/device/downTemplate')
    },
    getDeviceList: function(params) {
        return request({
            url: '/approval-sim-renew/device',
            method: 'get',
            params
        })
    },
    // 下载导入失败的列表
    downloadFailureList: function(id, params) {
        commonExport(params, 'approval-sim-renew/download-error/' + id) // 导出接口
    }
}
