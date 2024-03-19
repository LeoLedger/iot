import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/device-incoming-inspection',
            method: 'get',
            params
        })
    },
    // 新增or编辑
    update: function(data) {
        return request({
            url: '/device-incoming-inspection',
            method: 'post',
            data
        })
    },
    // 删除
    delete: function(id) {
        return request({
            url: '/device-incoming-inspection/' + id,
            method: 'delete'
        })
    },
    // 获取详情
    detail: function(id) {
        return request({
            url: '/device-incoming-inspection/' + id,
            method: 'get'
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'device-incoming-inspection/export') // 导出接口
    },
    // 下载导入模板
    downloadTemplate: function(params) {
        commonExport(params, 'device-incoming-inspection/download') // 导出接口
    }
}
