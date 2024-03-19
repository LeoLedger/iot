import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/repair-bill',
            method: 'get',
            params
        })
    },
    // 获取详情
    detail: function(id) {
        return request({
            url: '/repair-bill/' + id,
            method: 'get'
        })
    },
    // 获取结算列表
    settleList: function(params) {
        return request({
            url: '/repair-bill-settle',
            method: 'get',
            params
        })
    },
    // 获取结算详情
    settleDetail: function(id) {
        return request({
            url: '/repair-bill-settle/' + id,
            method: 'get'
        })
    },
    // 更新结算数据
    updateSettle: function(data) {
        return request({
            url: '/repair-bill-settle',
            method: 'post',
            data
        })
    },
    // 删除结算
    deleteSettle: function(id) {
        return request({
            url: '/repair-bill-settle/' + id,
            method: 'delete'
        })
    },
    // 导出项目列表
    exportSettle: function(params) {
        commonExport(params, '/repair-bill-settle/export') // 导出接口
    },
    // 获取详情
    confirm: function(data) {
        return request({
            url: '/repair-bill/confirm',
            method: 'post',
            data
        })
    },
    batchConfirm: function(data) {
        return request({
            url: '/repair-bill/save-confirmed-list',
            method: 'post',
            data
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'repair-bill/export') // 导出接口
    },
    // 下载模板
    downloadTemplate: function(params = {}) {
        commonExport(params, 'repair-bill-settle/down-template') // 导出接口
    },
    downloadFailureList: function(id) {
        commonExport({}, '/repair-bill-settle/download-error/' + id) // 导出接口
    }
}
