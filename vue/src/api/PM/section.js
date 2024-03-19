import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取标段列表
    getList: function(params) {
        return request({
            url: '/section/selectSection',
            method: 'get',
            params
        })
    },
    // 新增or编辑标段
    update: function(data) {
        return request({
            url: '/section/saveSection',
            method: 'post',
            data
        })
    },
    // 删除标段
    delete: function(id) {
        return request({
            url: '/section/deleteById/' + id,
            method: 'delete'
        })
    },
    // 获取标段详情
    detail: function(id) {
        return request({
            url: '/section/selectById/' + id,
            method: 'get'
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'section/export') // 导出接口
    },
    // 获取标段列表
    getSim: function(params) {
        return request({
            url: '/section/getSim',
            method: 'get',
            params
        })
    },
    // 获取标段列表
    getOther: function(params) {
        return request({
            url: '/section/getOther',
            method: 'get',
            params
        })
    },
    // 获取在运营人员设备的标段列表
    getListCondition: function(params) {
        return request({
            url: '/section/list-condition',
            method: 'get',
            params
        })
    },
    // 导出列表
    exportSimOrOther: function(params) {
        commonExport(params, 'section/exportExcel') // 导出接口
    }
}
