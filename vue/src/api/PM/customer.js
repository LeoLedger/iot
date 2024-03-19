import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取客户列表
    getList: function(data) {
        return request({
            url: '/customer/find',
            method: 'post',
            data
        })
    },
    // 新增or编辑客户
    update: function(data) {
        return request({
            url: '/customer/save',
            method: 'post',
            data
        })
    },
    // 删除客户
    delete: function(id) {
        return request({
            url: '/customer/' + id,
            method: 'delete'
        })
    },
    // 获取客户详情
    detail: function(guid) {
        return request({
            url: '/customer/' + guid,
            method: 'get'
        })
    },
    // 导出
    export: function(params) {
        commonExport(params, 'customer/export')
    },
    // 获取客户或供应商的收付款统计列表
    billList: function(guid) {
        return request({
            url: '/customer/bill/' + guid,
            method: 'get'
        })
    },
    // 下载客户列表模板
    downTemplate: function(params) {
        commonExport(params, 'customer/downTemplate') // 导出接口
    }
}
