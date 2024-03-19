import request from '@/utils/request'

export default {
    // 获取流程
    getFlow: function(params) {
        return request({
            url: '/workFlow/getFlow',
            method: 'get',
            params
        })
    },
    // 获取下一环节
    getNextActivities: function(params) {
        return request({
            url: '/workFlow/getNextActivities',
            method: 'get',
            params
        })
    },
    // 发送案件
    send: function(data) {
        return request({
            url: '/workFlow/send',
            method: 'post',
            data
        })
    },
    // 回退案件
    back: function(data) {
        return request({
            url: '/workFlow/back',
            method: 'post',
            data
        })
    },
    // 撤回案件
    withdraw: function(data) {
        return request({
            url: '/workFlow/withdraw',
            method: 'post',
            data
        })
    }
}
