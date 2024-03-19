
import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取费用汇总
    getCostSummary: function(params) {
        return request({
            url: '/cost-statement/total-cost',
            method: 'get',
            params
        })
    },
    // 获取寄修费用
    getExpressCost: function(params) {
        return request({
            url: '/cost-statement/express-cost',
            method: 'get',
            params
        })
    },
    // 获取维修费用
    getMaintenanceCost: function(params) {
        return request({
            url: '/cost-statement/repair-cost',
            method: 'get',
            params
        })
    },
    // 获取安装费用
    getInstallCost: function(params) {
        return request({
            url: '/cost-statement/install-cost',
            method: 'get',
            params
        })
    }
}
