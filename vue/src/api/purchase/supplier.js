import request from '@/utils/request'
import { commonExport } from '@/utils'
export default {
    // 获取供应商列表
    getList: function(params) {
        return request({
            url: '/purchase-supplier',
            method: 'get',
            params
        })
    },
    // 更新供应商信息
    update: function(data) {
        return request({
            url: '/purchase-supplier',
            method: 'post',
            data
        })
    },
    // 删除供应商
    delete: function(id) {
        return request({
            url: '/purchase-supplier/' + id,
            method: 'delete'
        })
    },
    // 获取供应商详情
    detail: function(id) {
        return request({
            url: '/purchase-supplier/' + id,
            method: 'get'
        })
    },
    export: function(params) {
        commonExport(params, 'purchase-supplier/export') // 导出接口
    },
    // 获取包含人员智能设备的供应商列表
    getListCondition: function(params) {
        return request({
            url: '/purchase-supplier/list-condition',
            method: 'get',
            params
        })
    }
}
