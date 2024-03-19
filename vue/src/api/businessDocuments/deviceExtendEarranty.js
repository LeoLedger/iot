import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/approval-extend',
            method: 'get',
            params
        })
    },
    // 新增or编辑
    update: function(data) {
        return request({
            url: '/approval-extend',
            method: 'post',
            data
        })
    },
    // 删除
    delete: function(id) {
        return request({
            url: '/approval-extend/' + id,
            method: 'delete'
        })
    },
    // 获取详情
    detail: function(id) {
        return request({
            url: '/approval-extend/' + id,
            method: 'get'
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'approval-extend/export')
    },
    // 获取延保产品
    getDevice: function(params) {
        return request({
            url: '/approval-extend/getDevice',
            method: 'get',
            params
        })
    },
    // 获取原始入库单的产品
    getOriginProduct: function(params) {
        return request({
            url: '/approval-extend/getOriginPro',
            method: 'get',
            params
        })
    },
    // 获取原始入库单的设备
    getOriginDevice: function(params) {
        return request({
            url: '/approval-extend/getOriginDevice',
            method: 'get',
            params
        })
    }
}
