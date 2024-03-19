import request from '@/utils/request'
import { commonExport, commonExportByPost } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/approvalDeviceReturn',
            method: 'get',
            params
        })
    },
    // 新增or编辑
    update: function(data) {
        return request({
            url: '/approvalDeviceReturn',
            method: 'post',
            data
        })
    },
    // 删除
    delete: function(id) {
        return request({
            url: '/approvalDeviceReturn/' + id,
            method: 'delete'
        })
    },
    // 获取详情
    detail: function(id) {
        return request({
            url: '/approvalDeviceReturn/' + id,
            method: 'get'
        })
    },
    // 获取标段下产品列表
    getProdList: function(sectionId) {
        return request({
            url: '/approvalDeviceReturn/getProdList/' + sectionId,
            method: 'get'
        })
    },
    // 获取退库单下的设备
    getProdDeviceList: function(id) {
        return request({
            url: '/approvalDeviceReturn/return-device/' + id,
            method: 'get'
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'approvalDeviceReturn/export')
    },
    // 下载导入模板
    downloadTemplate: function() {
        commonExport({}, 'approvalDeviceReturn/downTemplate')
    },
    exportDevice: function(data) {
        commonExportByPost(data, '/approvalDeviceReturn/exportDevice', '销售合同.xls')
    }
}
