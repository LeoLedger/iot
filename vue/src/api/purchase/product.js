import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取产品列表
    getList: function(data) {
        return request({
            url: 'product/getList',
            method: 'post',
            data
        })
    },
    // 新增or编辑产品信息
    update: function(data) {
        return request({
            url: '/product',
            method: 'post',
            data
        })
    },
    // 删除产品
    delete: function(id) {
        return request({
            url: '/product/' + id,
            method: 'delete'
        })
    },
    // 获取产品详情
    detail: function(id) {
        return request({
            url: '/product/' + id,
            method: 'get'
        })
    },
    // 导出项目列表
    export: function(params) {
        commonExport(params, '/product/export') // 导出接口
    },
    // 获取BOM清单
    getBOM: function(params) {
        return request({
            url: '/product/bom',
            method: 'get',
            params
        })
    },
    // 获取BOM清单版本
    getVersion: function(id) {
        return request({
            url: '/product/bom/' + id,
            method: 'get'
        })
    },
    // 下载产品列表模板
    downTemplate: function(params) {
        commonExport(params, 'product/downTemplate') // 导出接口
    }
}
