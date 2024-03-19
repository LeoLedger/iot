import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    /**
     * 获取物联地图-全国视图数据
     * count: 统计数字
     * regionData: [
     *    { name 省名, lat 省坐标, lng 省坐标, code 省行政编码, count 设备总数}
     * ]
     * */
    getProvinceList: function(params) {
        return request({
            url: '/smart-map/polymerize',
            method: 'get',
            params
        })
    },
    /**
     * 物联地图-设备数据
     * count: 统计数字
     * deviceData: [
     *    { guidId 设备id, productType 设备产品类型... }
     * ]
     * */
    getDeviceList: function(params) {
        return request({
            url: '/smart-map/scatter',
            method: 'get',
            params
        })
    },
    /**
     * 物联地图-通过level和name获取mapId
     */
    getMapId: function(params) {
        return request({
            url: '/smart-map/getMapId',
            method: 'get',
            params
        })
    },
    /**
     * 物联地图-获取当前用户的地图配置
     */
    getUserMapConfig: function() {
        return request({
            url: '/smart-map/getConfig',
            method: 'get'
        })
    },
    /**
     * 物联地图-获取当前用户的地图配置
     */
    updateUserMapConfig: function(data) {
        return request({
            url: '/smart-map/createOrUpdateConfig',
            method: 'post',
            data
        })
    }
}
