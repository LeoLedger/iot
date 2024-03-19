import request from '@/utils/request'
import { commonExport } from '@/utils'

export default {
    // 获取列表
    getList: function(params) {
        return request({
            url: '/execute/collection',
            method: 'get',
            params
        })
    }
}
