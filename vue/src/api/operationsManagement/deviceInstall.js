
import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/device-install',
            method: 'get',
            params
        })
    },
    // 获取详情
    detail: function(id) {
        return request({
            url: '/device-install/' + id,
            method: 'get'
        })
    },
    // 结束任务
    close: function(id) {
        return request({
            url: '/device-install/close/' + id,
            method: 'put'
        })
    },
    // 获取安装设备列表
    getDeviceList: function(params) {
        return request({
            url: '/device-install-details',
            method: 'get',
            params
        })
    },
    // 获取安装设备详情
    getDeviceDetail: function(id) {
        return request({
            url: '/device-install-details/' + id,
            method: 'get'
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'device-install/export') // 导出接口
    },
    // 导出设备列表
    exportDevice: function(params) {
        commonExport(params, 'device-install-details/export') // 导出接口
    }
}
