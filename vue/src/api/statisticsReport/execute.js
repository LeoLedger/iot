
import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取财务收入执行列表
    getIncomeList: function(params) {
        return request({
            url: '/execute/income',
            method: 'get',
            params
        })
    },
    // 导出财务收入执行列表
    exportIncome: function(params) {
        commonExport(params, 'execute/exportIncome')
    },
    // 财务成本结转(项目维度)
    getProjectList: function(params) {
        return request({
            url: '/execute/project-transfer',
            method: 'get',
            params
        })
    },
    // 导出财务成本结转(项目维度)
    exportProject: function(params) {
        commonExport(params, 'execute/exportProject')
    },
    // 财务成本结转(产品维度)
    getProductList: function(params) {
        return request({
            url: '/execute/product-transfer',
            method: 'get',
            params
        })
    },
    // 导出财务成本结转(产品维度)
    exportProduct: function(params) {
        commonExport(params, 'execute/exportProduct')
    },
    getProductDetails: function(params) {
        return request({
            url: '/execute/product-details',
            method: 'get',
            params
        })
    },
    getNewDetails: function(params) {
        return request({
            url: '/execute/new-details',
            method: 'get',
            params
        })
    }
}
