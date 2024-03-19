import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取项目列表
    getList: function(params) {
        return request({
            url: '/project/selectProject',
            method: 'get',
            params
        })
    },
    // 新增or编辑项目
    update: function(data) {
        return request({
            url: '/project/saveProject',
            method: 'post',
            data
        })
    },
    // 删除项目
    delete: function(id) {
        return request({
            url: '/project/deleteProject/' + id,
            method: 'delete'
        })
    },
    // 获取项目详情
    detail: function(id) {
        return request({
            url: '/project/selectProjectByGuidId/' + id,
            method: 'get'
        })
    },
    // 获取授权IP
    getEmpowerIp: function(params) {
        return request({
            url: '/project/get-auth-ip',
            method: 'get',
            params
        })
    },
    // 获取出库授权产品列表
    getEmpowerProduct: function(params) {
        return request({
            url: '/project/getIpList',
            method: 'get',
            params
        })
    },
    // 导出项目列表
    export: function(params) {
        commonExport(params, 'project/export') // 导出接口
    },
    // 导出运营标段
    exportSection: function(params) {
        commonExport(params, 'project/export-section') // 导出运营标段
    },
    // 更新项目状态
    updateStatus: function(data) {
        return request({
            url: '/project/updateProjectStatus',
            method: 'post',
            data
        })
    },
    // 下载项目列表模板
    downTemplate: function(params) {
        commonExport(params, 'project/downTemplate') // 导出接口
    }
}
