import request from '@/utils/request'
import { commonExport } from '@/utils'
// 退还押金
export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/approvalCashPledge',
            method: 'get',
            params
        })
    },
    // 新增or编辑
    update: function(data) {
        return request({
            url: '/approvalCashPledge',
            method: 'post',
            data
        })
    },
    // 删除
    delete: function(id) {
        return request({
            url: '/approvalCashPledge/' + id,
            method: 'delete'
        })
    },
    // 获取详情
    detail: function(id) {
        return request({
            url: '/approvalCashPledge/' + id,
            method: 'get'
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'approvalCashPledge/export') // 导出接口
    },
    // 通过标段ID获取退库单下的清单
    getProdList: function(id) {
        return request({
            url: '/approvalCashPledge/return-device/' + id,
            method: 'get'
        })
    },
    // 通过退还清单id获取单下的设备
    getDeviceList: function(id) {
        return request({
            url: '/approvalCashPledge/return/' + id,
            method: 'get'
        })
    }
}
