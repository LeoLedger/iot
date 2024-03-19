import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取智能设备列表
    getList: function(params) {
        return request({
            url: '/device',
            method: 'get',
            params
        })
    },
    dis: function(params) {
        return request({
            url: '/device/dis',
            method: 'get',
            params
        })
    },
    // 获取详情
    detail: function(id) {
        return request({
            url: '/device/' + id,
            method: 'get'
        })
    },
    // 通过imei获取详情
    detailByImei: function(imei) {
        return request({
            url: '/device/getByImei/' + imei,
            method: 'get'
        })
    },
    // 为设备替换SIM卡
    updateSim: function({ imei, sim }) {
        return request({
            url: '/device/updateSim?imei=' + imei + '&' + 'sim=' + sim,
            method: 'post'
        })
    },
    // 挂起某台设备
    hangup: function(data) {
        return request({
            url: '/device/hangup',
            method: 'post',
            data
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'device/export') // 导出接口
    },
    // 导出所有仓位的智能设备
    exportAll: function(params) {
        commonExport(params, 'device/export-all') // 导出接口
    },
    // 获取智能设备日志列表
    getLogList: function(params) {
        return request({
            url: '/device/log',
            method: 'get',
            params
        })
    },
    // 导出智能设备日志列表
    exportLog: function(params) {
        commonExport(params, 'device/export-log') // 导出接口
    },
    // 为设备分配备用项目
    distributionToProject: function(data) {
        return request({
            url: '/device/distribution',
            method: 'post',
            data
        })
    },
    // 项目备用设备分配列表
    getDistributionList: function(params) {
        return request({
            url: '/device/distribution',
            method: 'get',
            params
        })
    },
    // 项目备用设备分配详情
    getDistributionDetail: function(id) {
        return request({
            url: '/device/' + id + '/distribution',
            method: 'get'
        })
    },
    // 更新备用项目设备详情
    updateDistribution: function(data) {
        return request({
            url: '/device/distribution',
            method: 'put',
            data
        })
    },
    // 项目备用设备分配列表导出
    exportDistributionList: function(params) {
        commonExport(params, 'device/export-distribution') // 导出接口
    },
    // 备用设备导入模板
    downloadDistributionTemplate: function(params) {
        commonExport(params, 'device/distribution/downTemplate')
    },
    // 获取产品类型列表
    getDictList: function(params) {
        return request({
            url: '/device/dictList',
            method: 'get',
            params
        })
    },
    // 获取标段下正常状态设备的产品列表
    getListCondition: function(params) {
        return request({
            url: '/device/list-condition',
            method: 'get',
            params
        })
    },
    // 通过imei获取设备的最后维修时间
    getLastRepairedTime: function(imei) {
        return request({
            url: '/fault-repair-car/getLast?imei=' + imei,
            method: 'get'
        })
    },
    // 获取设备通信记录
    getCommunication: function(params) {
        return request({
            url: '/device/communication',
            method: 'get',
            params
        })
    },
    exportCommunication: function(params) {
        commonExport(params, 'device/export-communication') // 导出接口
    },
    // 获取GPS动态记录
    getGps: function(params) {
        return request({
            url: '/device/gps',
            method: 'get',
            params
        })
    },
    getGpsHistory: function(params) {
        return request({
            url: '/device/gps-history',
            method: 'get',
            params
        })
    },
    exportGps: function(params) {
        commonExport(params, 'device/export-gps') // 导出接口
    }
}
