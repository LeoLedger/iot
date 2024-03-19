import request from '@/utils/request'

export default {
    // 获取可审批数量
    getCount: function() {
        return request({
            url: '/approval/todo-num',
            method: 'get'
        })
    }
}
