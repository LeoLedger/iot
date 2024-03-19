import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/fault-code-config',
            method: 'get',
            params
        })
    },
    getTree: function() {
        return request({
            url: '/fault-code-config/menus',
            method: 'get'
        })
    },
    // 新增or编辑
    update: function(data) {
        return request({
            url: '/fault-code-config',
            method: 'post',
            data
        })
    },
    // 删除
    delete: function(guid) {
        return request({
            url: '/fault-code-config/' + guid,
            method: 'delete'
        })
    },
    // 获取详情
    detail: function(guid) {
        return request({
            url: '/fault-code-config/' + guid,
            method: 'get'
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'fault-code-config/export')
    }
}
