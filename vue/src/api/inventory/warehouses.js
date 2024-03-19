import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取仓库列表
    getList: function(type) {
        return request({
            url: '/warehouses/find/' + type,
            method: 'get'
        })
    },
    // 新增or编辑
    update: function(data) {
        return request({
            url: '/warehouses/save',
            method: 'post',
            data
        })
    },
    // 删除
    delete: function(id) {
        return request({
            url: '/warehouses/' + id,
            method: 'delete'
        })
    },
    // 获取详情
    detail: function(id) {
        return request({
            url: '/warehouses/' + id,
            method: 'get'
        })
    },
    // 查看仓库日志
    getActLogList: function(params) {
        return request({
            url: '/warehouses/warehouses-act-log',
            method: 'get',
            params
        })
    },
    // 查看仓位
    getShippingSpaceList: function(params) {
        return request({
            url: '/warehouses/warehouses-shipping-space',
            method: 'get',
            params
        })
    },
    // 查看某仓库下的仓位
    getStatistics: function(params) {
        return request({
            url: '/warehouses/statistics',
            method: 'get',
            params
        })
    },
    // 导出仓库日志列表
    exportLog: function(params) {
        commonExport(params, 'warehouses/warehouses-act-log/export') // 导出接口
    },
    // 导出修改成本中心模板
    downloadTemplate: function(params) {
        commonExport(params, 'device/costCenter/downTemplate') // 导出接口
    }
}
