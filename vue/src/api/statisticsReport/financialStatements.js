/*
 * @Author: xieqingsong
 * @Date: 2023-10-07 17:16:45
 * @LastEditTime: 2023-10-12 19:15:38
 * @Description: Edit By xieqingsong(Department of Development)
 */

import request from '@/utils/request'
import { commonExportByPost } from '@/utils'

export default {
    // 环卫合同导入-标明细行列表
    pageContractTenderDetail: function(data) {
        return request({
            url: 'sale/report/pageContractTenderDetail',
            method: 'post',
            data
        })
    },
    // 环卫合同导入-标明细行列表导出
    export: function(data) {
        commonExportByPost(data, '/sale/report/pageContractTenderDetail/export', '标明细行列表.xls')
    },
    // 环卫合同导入-收款计划列表
    pageContractCollectionPlan: function(data) {
        return request({
            url: '/sale/report/pageContractCollectionPlan',
            method: 'post',
            data
        })
    },
    // 环卫合同导入-收款计划列表导出
    pageContractCollectionPlanExport: function(data) {
        commonExportByPost(data, '/sale/report/pageContractCollectionPlan/export', '收款计划列表.xls')
    },
    // 收款单列表
    pageContractReceipt: function(data) {
        return request({
            url: '/sale/report/pageContractReceipt',
            method: 'post',
            data
        })
    },
    // 收款单列表导出
    pageContractReceiptExport: function(data) {
        commonExportByPost(data, '/sale/report/pageContractReceipt/export', '收款单列表.xls')
    },
    // 押金收款单列表
    pageContractCashPledgeReceipt: function(data) {
        return request({
            url: '/sale/report/pageContractCashPledgeReceipt',
            method: 'post',
            data
        })
    },
    // 押金收款单列表导出
    pageContractCashPledgeReceiptExport: function(data) {
        commonExportByPost(data, '/sale/report/pageContractCashPledgeReceipt/export', '押金收款单列表.xls')
    },
    // 销售出库单列表
    pageSaleOutMenu: function(data) {
        return request({
            url: '/sale/report/pageSaleOutMenu',
            method: 'post',
            data
        })
    },
    // 销售出库单列表导出
    pageSaleOutMenuExport: function(data) {
        commonExportByPost(data, '/sale/report/pageSaleOutMenu/export', '销售出库单列表.xls')
    },
    // 删除设备列表
    handleDelete: function(data) {
        return request({
            url: '/device-duplicate-fix/deleteByImei/' + data,
            method: 'delete'
        })
    },
    // 批量删除设备列表
    handleMultipleDelete: function(data) {
        return request({
            url: '/device-duplicate-fix/deleteByImei',
            method: 'post',
            data
        })
    },
}
