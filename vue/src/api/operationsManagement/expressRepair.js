import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/express-repair/find',
            method: 'get',
            params
        })
    },
    getApprovalDeviceList: function(params) {
        return request({
            url: '/express-repair/select-by-approval',
            method: 'get',
            params
        })
    },
    // 新增or编辑
    update: function(data) {
        return request({
            url: '/express-repair/save',
            method: 'post',
            data
        })
    },
    // 删除
    delete: function(id) {
        return request({
            url: '/express-repair/' + id,
            method: 'delete'
        })
    },
    // 获取详情
    detail: function(uuid) {
        return request({
            url: '/express-repair/' + uuid,
            method: 'get'
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'express-repair/export') // 导出接口
    },
    // 导出模板
    downloadTemplate: function(params) {
        commonExport(params, 'express-repair/down-template') // 导出接口
    }
}
