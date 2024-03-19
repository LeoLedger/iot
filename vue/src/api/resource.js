import request from '@/utils/request'
import { uploadFileUrl } from '@/utils'

export default {
    /**
    * 获取区域树
    */
    getMapTree: function(params) {
        return request({
            url: '/map',
            method: 'get',
            params
        })
    },
    /**
    * 根据关键词搜索地点
    */
    getMaps: function(params) {
        return request({
            url: '/maps',
            method: 'get',
            params
        })
    },
    // 获取系统字典
    getDict(nsId) {
        return request({
            url: '/dict/dictList?nsId=' + nsId,
            method: 'get'
        })
    },
    // 获取系统字典
    getAllDict() {
        return request({
            url: '/namespace/nsAndDict',
            method: 'get'
        })
    },
    // 获取所有人员列表
    getUserList: function(params) {
        return request({
            url: '/user/selectAllUser',
            method: 'get',
            params
        })
    },
    // 获取部门列表
    getDeptList: function(params) {
        return request({
            url: '/dept/find',
            method: 'get',
            params
        })
    },
    // 获取产品常用语
    getProductLanguages: function(params) {
        return request({
            url: '/product-languages',
            method: 'get',
            params
        })
    },
    // 保存地图边界
    setMapBoundary: function(id, data) {
        return request({
            url: '/map/boundary/' + id,
            method: 'post',
            data
        })
    },
    // 识别发票信息
    identifyInvoice: function(fileId) {
        return request({
            url: '/invoice/identify/' + fileId,
            method: 'get'
        })
    },
    // 获取部门下的用户
    getDeptUser: function(data) {
        return request({
            url: '/user/listInDept',
            method: 'post',
            data
        })
    },
    // 获取角色下的用户
    getRoleUser: function(data) {
        return request({
            url: '/user/listInRole',
            method: 'post',
            data
        })
    },
    // 获取成本中心
    getCostCenter: function(params) {
        return request({
            url: '/cost-center/list',
            method: 'get',
            params
        })
    },
    // 获取实体修改记录
    entityChanges(params) {
        return request({
            url: '/entity-changes',
            method: 'get',
            params
        })
    },
    // 上传文件
    uploadFile(blob, fileName) {
        blob.lastModifiedDate = new Date()
        blob.name = fileName
        let data = new FormData()
        data.append('file', blob, fileName)
        return request({
            url: uploadFileUrl,
            method: 'post',
            data
        })
    }
}
