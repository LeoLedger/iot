/** 问题反馈接口 */
import request from '@/utils/request'
import { commonExport } from '@/utils'

// 问题反馈导出
export function queryFeedbackExport(params) {
    commonExport(params, '/api/Feedback/Export')
}

// 问题反馈列表
export function getFeedbackList(params) {
    return request({
        url: '/api/Feedback',
        method: 'get',
        params
    })
}

// 问题反馈详情
export function getFeedbackDetails(id) {
    return request({
        url: '/api/Feedback/' + id,
        method: 'get'
    })
}

// 问题反馈列表
export function getFeedbackOption(params) {
    return request({
        url: '/api/FeedbackOption',
        method: 'get',
        params
    })
}
// 统计列表
export function getFeedbackStatisticsList(params) {
    return request({
        url: '/api/Feedback/GetStatisticsList',
        method: 'get',
        params
    })
}

// 新增或者编辑问题反馈规则配置
export function postFeedbackOption(data) {
    return request({
        url: '/api/FeedbackOption',
        method: 'post',
        data
    })
}

// 反馈规则配置
export function deleteFeedbackOption(id, deleteContract = true) {
    return request({
        url: '/api/FeedbackOption/' + id,
        method: 'delete',
        params: { deleteContract }
    })
}
