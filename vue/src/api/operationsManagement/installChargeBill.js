
import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/install-settlement',
            method: 'get',
            params
        })
    },
    // 更新结算数据
    update: function(data) {
        return request({
            url: '/install-settlement',
            method: 'post',
            data
        })
    },
    // 获取详情
    detail: function(id) {
        return request({
            url: '/install-settlement/' + id,
            method: 'get'
        })
    },
    // 导出列表
    export: function(params) {
        commonExport(params, 'install-settlement/export') // 导出接口
    },
    // 下载导入模板
    downloadTemplate: function(params) {
        commonExport(params, 'install-settlement/downTemplate')
    }
}
