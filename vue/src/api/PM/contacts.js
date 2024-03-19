import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取联系人列表
    getList: function(data) {
        return request({
            url: '/people/find',
            method: 'post',
            data
        })
    },
    // 新增or编辑联系人
    update: function(data) {
        return request({
            url: '/people/save',
            method: 'post',
            data
        })
    },
    // 删除联系人
    delete: function(id) {
        return request({
            url: '/people/' + id,
            method: 'delete'
        })
    },
    // 获取联系人详情
    detail: function(id) {
        return request({
            url: '/people/' + id,
            method: 'get'
        })
    },
    // 导出项目列表
    export: function(params) {
        commonExport(params, 'people/export') // 导出接口
    }
}
