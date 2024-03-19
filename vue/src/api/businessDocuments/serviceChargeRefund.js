import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/approvalServiceCharge',
            method: 'get',
            params
        })
    },
    // 新增or编辑
    update: function(data) {
        return request({
            url: '/approvalServiceCharge',
            method: 'post',
            data
        })
    },
    // 删除
    delete: function(id) {
        return request({
            url: '/approvalServiceCharge/' + id,
            method: 'delete'
        })
    },
    // 获取详情
    detail: function(id) {
        return request({
            url: '/approvalServiceCharge/' + id,
            method: 'get'
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'approvalServiceCharge/export')
    },
    // 获取设备列表
    getDeviceList: function(sectionId) {
        return request({
            url: '/approvalServiceCharge/getSmart/' + sectionId,
            method: 'get'
        })
    },
    // 下载导入模板
    downloadTemplate: function(params) {
        commonExport(params, 'approvalServiceCharge/downTemplate')
    }
}
