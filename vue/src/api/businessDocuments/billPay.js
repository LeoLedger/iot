import request from '@/utils/request'
import { commonExport } from '@/utils'
// 应收账单
export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/bill-pay',
            method: 'get',
            params
        })
    },
    // // 新增or编辑
    // update: function(data) {
    //     return request({
    //         url: '/bill-pay',
    //         method: 'post',
    //         data
    //     })
    // },
    // 删除
    // delete: function(id) {
    //     return request({
    //         url: '/bill-pay/' + id,
    //         method: 'delete'
    //     })
    // },
    // 获取详情
    // detail: function(id) {
    //     return request({
    //         url: '/bill-pay/' + id,
    //         method: 'get'
    //     })
    // },
    // 导出列表
    export: function(params) {
        commonExport(params, 'bill-pay/export') // 导出接口
    }
}
