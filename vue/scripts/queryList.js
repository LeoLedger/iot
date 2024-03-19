const axios = require('axios')

// 创建axios实例
const service = axios.create({
    baseURL: 'http://192.168.0.229:11009/sy.api', // api 的 base_url
    timeout: 60000, // 请求超时时间
    headers: {
        'Authorization': 'bearer ' + '4e66ebc31e314e1b89ae44ab9f003ae4fe7d7bcf05af4334af7e1fc9f5382c90'
    }
})
module.exports = {
    queryColumns: () => service({
        url: '/api/people?code=&phone=&idCard=&name=&pageSize=15&pageIndex=1&gps=',
        method: 'get',
        params: {
        }
    }).then(async res => {
        console.error(res.data.data, 'res...')
        const data = res.data.data
        const rows = data.rows || []
        if (rows.length) {
            const obj = rows[0]
            const columns = Object.keys(obj).map(key => ({
                prop: key,
                label: `请修改__${key}__${obj[key]}`
            }))

            return columns
        }
        return []
    })
}
