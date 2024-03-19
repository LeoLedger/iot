
import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取费用汇总
    getCostSummary: function(params) {
        return request({
            url: '/cost-statement/extend-sim',
            method: 'get',
            params
        })
    },
    // 获取SIM卡续费
    getSim: function(params) {
        return request({
            url: '/cost-statement/sim-cost',
            method: 'get',
            params
        })
    },
    // 获取设备延保
    getExtendEarranty: function(params) {
        return request({
            url: '/cost-statement/extend-life-cost',
            method: 'get',
            params
        })
    }
}
