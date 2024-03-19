import request from "@/utils/request";
import { commonExport } from '@/utils'

// 获取树形结构的数据
export function getSysclassTree(params) { // id
    return request({
        url: '/api/sysclass/GetTree',
        method: 'get',
        params
    })
}

// 系统列表搜索
export function getSysClass(params) {
    return request({
        url: '/api/SysClass',
        method: 'get',
        params
    })
}

// 系统列表导出
export function exportSysClass(params) {
    commonExport(params, '/api/sysclass/Export') // 导出接口
}

// 系统新增或编辑
export function editSysClass(data) { // id
    return request({
        url: '/api/SysClass',
        method: 'post',
        data
    })
}

// 系统删除
export function deleteSysClassDetail(id) {
    return request({
        url: "/api/SysClass/" + id,
        method: 'delete',
    })
}

// 系统详情
export function getSysClassDetail(id) {
    return request({
        url: "/api/SysClass/" + id,
        method: 'get',
    })
}
