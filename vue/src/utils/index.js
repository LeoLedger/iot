/**
 * Created by jiachenpan on 16/11/18.
 */

import XLSX from 'XLSX'
import { getToken } from './auth' // 导入token
import { Message } from 'element-ui'
import enums from '@/utils/enum'
import moment from 'moment'
import store from '@/store'
import request from '@/utils/request'
export * from './commonUtil'
import qs from 'qs'

export const BASE_API = process.env.BASE_API
export const uploadFileUrl = BASE_API + 'fmp/upload' // 附件上传
export const previewImgSrc = BASE_API + 'fmp/thumbImage/' // 略缩图
export const baseImgSrc = BASE_API + 'fmp/open/' // 打开文件
export const baseDownSrc = BASE_API + 'fmp/download/' // 下载文件
// Promise队列
if (!Promise.prototype.queue) {
    Promise.prototype.queue = function (arr) {
        var sequence = Promise.resolve()
        arr.forEach((item) => {
            sequence = sequence.then(item)
        })
        return sequence
    }
}
// 判断是否为空
export function isEmpty(value) {
    return ['', null, void 0].includes(value)
}
// 小于10的数字补零
export function numberFixZero(num) {
    return num < 10 ? `0${num}` : num
}
// 获取指定url参数对象
export function getQueryObject(url) {
    url = url == null ? window.location.href : url
    const search = url.substring(url.lastIndexOf('?') + 1)
    const obj = {}
    const reg = /([^?&=]+)=([^?&=]*)/g
    search.replace(reg, (rs, $1, $2) => {
        const name = decodeURIComponent($1)
        let val = decodeURIComponent($2)
        val = String(val)
        obj[name] = val
        return rs
    })
    return obj
}
// 获取一个uuid
export function generateUUID() {
    var d = new Date().getTime()
    if (window.performance && typeof window.performance.now === 'function') {
        d += performance.now() // use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0
        d = Math.floor(d / 16)
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    })
    return uuid
}
// json对象转url参数
export function param(json) {
    if (!json) return ''
    return cleanArray(
        Object.keys(json).map(key => {
            if (json[key] === undefined) return ''
            return encodeURIComponent(key) + '=' + encodeURIComponent(json[key])
        })
    ).join('&')
}
// url参数转对象
export function param2Obj(url) {
    const search = url.split('?')[1]
    if (!search) {
        return {}
    }
    return JSON.parse(
        '{"' +
        decodeURIComponent(search)
            .replace(/"/g, '\\"')
            .replace(/&/g, '","')
            .replace(/=/g, '":"') +
        '"}'
    )
}

/**
 * This is just a simple version of deep copy
 * Has a lot of edge cases bug
 * If you want to use a perfect deep copy, use lodash's _.cloneDeep
 */
export function deepClone(source) {
    if (!source && typeof source !== 'object') {
        throw new Error('error arguments', 'shallowClone')
    }
    const targetObj = source.constructor === Array ? [] : {}
    Object.keys(source).forEach(keys => {
        if (source[keys] && typeof source[keys] === 'object') {
            targetObj[keys] = deepClone(source[keys])
        } else {
            targetObj[keys] = source[keys]
        }
    })
    return targetObj
}
// 数字货币化
export function moneyFormater(value) {
    if (!value) return '0.00'

    /* 原来用的是Number(value).toFixed(0)，这样取整时有问题，例如0.51取整之后为1，感谢Nils指正*/
    var intPart = Number(value) | 0 // 获取整数部分
    var intPartFormat = intPart.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,') // 将整数部分逢三一断
    var floatPart = '.00' // 预定义小数部分
    var value2Array = value.split('.')

    // =2表示数据有小数位
    if (value2Array.length == 2) {
        floatPart = value2Array[1].toString() // 拿到小数部分

        if (floatPart.length == 1) {
            // 补0,实际上用不着
            return intPartFormat + '.' + floatPart + '0'
        } else {
            return intPartFormat + '.' + floatPart
        }
    } else {
        return intPartFormat + floatPart
    }
}

function encode(val) {
    return encodeURIComponent(val)
        .replace(/%40/gi, '@')
        .replace(/%3A/gi, ':')
        .replace(/%24/g, '$')
        .replace(/%2C/gi, ',')
        .replace(/%20/g, '+')
        .replace(/%5B/gi, '[')
        .replace(/%5D/gi, ']')
}

function isDate(val) {
    return toString.call(val) === '[object Date]'
}

function isObject(val) {
    return val !== null && typeof val === 'object'
}

function forEach(obj, fn) {
    if (obj === null || typeof obj === 'undefined') {
        return
    }

    if (typeof obj !== 'object') {
        obj = [obj]
    }

    if (Array.isArray(obj)) {
        for (var i = 0, l = obj.length; i < l; i++) {
            fn.call(null, obj[i], i, obj)
        }
    } else {
        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                fn.call(null, obj[key], key, obj)
            }
        }
    }
}
export function buildUrl(url, params) {
    var serializedParams
    var parts = []

    forEach(params, function serialize(val, key) {
        if (val === '' || val === null || typeof val === 'undefined') {
            return
        }

        if (!Array.isArray(val)) {
            val = [val]
        }

        forEach(val, function parseValue(v) {
            if (isDate(v)) {
                v = v.toISOString()
            } else if (isObject(v)) {
                v = JSON.stringify(v)
            }
            parts.push(encode(key) + '=' + encode(v))
        })
    })

    serializedParams = parts.join('&')

    if (serializedParams) {
        var hashmarkIndex = url.indexOf('#')
        if (hashmarkIndex !== -1) {
            url = url.slice(0, hashmarkIndex)
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams
    }
    return url
}
export function isPromise(value) {
    return value && typeof value.then === 'function'
}
/**
 * 导出列表
 * @param params
 * @param api
 */
export const commonExport = (params = {}, api) => {
    params.pageIndex = 1
    params['token'] = getToken()
    const url = buildUrl(process.env.BASE_API + api, params)
    console.log(url)
    window.open(url)
}
/**
 * 导出列表,但是post
 * @param params 请求参数
 * @param url 请求url
 * @param fileName 文件名（带后缀）
 */
export const commonExportByPost = async (params = {}, url, fileName) => {
    params.pageIndex = 1
    const res = await request({
        url,
        method: 'post',
        data: params,
        responseType: 'blob',
        timeout: 1000 * 60 * 10
    })
    const blob = new Blob([res], {
        type: 'application/vnd.ms-excel'
    })
    let _fileName = fileName || '表格.xlsx'
    const elink = document.createElement('a')
    elink.download = _fileName
    elink.style.display = 'none'
    elink.href = URL.createObjectURL(blob)
    document.body.appendChild(elink)
    elink.click()
    URL.revokeObjectURL(elink.href)
    document.body.removeChild(elink)
}

// 复制数据
export function copyInputVal(val, msg = '复制成功') {
    const input = document.createElement('input')
    input.value = val
    document.body.append(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    Message({
        message: msg,
        type: 'success',
        duration: 2000
    })
}

// 地址逆解析
export const getAddressData = (function () {
    window.__initGlobal = () => {
        window.__initGlobal = null
    }
    const $script = document.createElement('script')
    window.document.body.appendChild($script)
    $script.src = '//api.map.baidu.com/api?v=3.0&ak=0n7IG5lHNun8ivuGXc9qWNGMUObGY852&callback=__initGlobal'
    let geocoder = null
    return function (point, config = {}, extendData = {}) {
        geocoder = new BMap.Geocoder()
        const conf = {
            lngKey: 'lng',
            latKey: 'lat',
            ...config
        }
        return new Promise((resolve, reject) => {
            // try{
            geocoder.getLocation(new BMap.Point(point[conf.lngKey], point[conf.latKey]), data => {
                data._extendsData = extendData
                resolve(data)
            })
            // } catch (e) {
            //     resolve({})
            // }
        })
    }
})()
/**
 * 格式化金额数字
 */
export function getPriceFormat(num, digit = 2) {
    return (+num).toLocaleString('zh', {
        minimumFractionDigits: digit,
        maximumFractionDigits: digit
    })
}

/**
 * 保留两位小数，但小数位等于0时不保留
 */
export function getNumberFormat(value, digit = 2) {
    const split = getPriceFormat(value || 0, digit).split('.')
    split[1] = split[1].replace(/0+$/, '')
    if (split[1] > 0) {
        return split.join('.')
    } else {
        return split[0]
    }
}
/**
 * 友好数字，为大于1万的数据添加单位
 * @param value 需要转换的数字
 * @param fixed 保留几位小数
 * @param threshold 添加单位的阈值，小于该值时不会进行处理
 */
export function friendlyNumber(value, fixed = 2, threshold = 1e4) {
    value = Number(value)
    if (isNaN(value)) {
        return 0
    }
    var absVal = Math.abs(value)
    var units = ['', '千', '万', '千万', '亿']
    var values = [1, 1e3, 1e4, 1e7, 1e8]
    var index = values.findIndex(item => item >= threshold)
    if (absVal < values[index]) {
        return Number(value.toFixed(fixed))
    }
    var maxValue = values.slice(-1)[0]
    for (let i = index; i < values.length; i++) {
        if (absVal >= values[i] && absVal < (values[i + 1] || maxValue)) {
            return (value / values[i]).toFixed(fixed) + units[i]
        }
    }
    return Number((value / maxValue).toFixed(fixed)) + units.slice(-1)[0]
}

/**
 * 友好时间，秒转换为时分秒
 */
export function friendlyTime(value) {
    const hour = Math.floor(value / 3600)
    const minute = Math.floor((value % 3600) / 60)
    const second = Math.floor((value % 3600 % 60) / 60)
    let str = ''
    if (hour > 0) {
        str += hour + '小时'
    } else {
        str += '0小时'
    }
    if (minute > 0) {
        str += numberFixZero(minute) + '分'
    }
    if (second > 0) {
        str += numberFixZero(second) + '秒'
    }
    return str
}

// 将数组转对象, 如果不给key,那么默认用数组下标作为属性名
export function arr2obj(arr, key) {
    const obj = {}
    if (key) {
        if (arr && arr.length > 0 && arr[0][key]) {
            arr.forEach((item, index) => {
                if (obj[key] === undefined) {
                    const key_ = item[key]
                    obj[key_] = item
                }
            })
        } else return {}
    } else {
        arr.forEach((item, index) => {
            if (obj[index] === undefined) {
                obj[index] = item
            }
        })
    }
    return obj
}
// 将一个sheet转成最终的excel文件的blob对象，然后利用URL.createObjectURL下载
export function sheet2blob(sheet, sheetName) {
    sheetName = sheetName || 'sheet1'
    var workbook = {
        SheetNames: [sheetName],
        Sheets: {}
    }
    workbook.Sheets[sheetName] = sheet
    // 生成excel的配置项
    var wopts = {
        bookType: 'xlsx', // 要生成的文件类型
        bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
        type: 'binary'
    }
    var wbout = XLSX.write(workbook, wopts)
    var blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' })
    // 字符串转ArrayBuffer
    function s2ab(s) {
        var buf = new ArrayBuffer(s.length)
        var view = new Uint8Array(buf)
        for (var i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF
        return buf
    }
    return blob
}
/**
 * 通用的打开下载对话框方法，没有测试过具体兼容性
 * @param url 下载地址，也可以是一个blob对象，必选
 * @param saveName 保存文件名，可选
 */
export function openDownloadDialog(url, saveName) {
    if (typeof url === 'object' && url instanceof Blob) {
        url = URL.createObjectURL(url) // 创建blob地址
    }
    var aLink = document.createElement('a')
    aLink.href = url
    aLink.download = saveName || '' // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
    var event
    if (window.MouseEvent) event = new MouseEvent('click')
    else {
        event = document.createEvent('MouseEvents')
        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    }
    aLink.dispatchEvent(event)
}

/**
 * 获取本月/下月/上月首尾日期
 * @param type "s"代表开始,"e"代表结束
 * @param months 不传或0代表本月，-1代表上月，1代表下月
 * @returns {string}
 */
export function getDayOfTheMonth(type, months) {
    var d = new Date()
    var year = d.getFullYear()
    var month = d.getMonth() + 1
    if (Math.abs(months) > 12) {
        months = months % 12
    }
    if (months !== 0) {
        if (month + months > 12) {
            year++
            month = (month + months) % 12
        } else if (month + months < 1) {
            year--
            month = 12 + month + months
        } else {
            month = month + months
        }
    }
    month = month < 10 ? '0' + month : month
    var date = d.getDate()
    var firstday = year + '-' + month + '-' + '01'
    var lastday = ''
    if (month === '01' || month === '03' || month === '05' || month === '07' || month === '08' || month === '10' || month === '12') {
        lastday = year + '-' + month + '-' + 31
    } else if (month === '02') {
        if ((year % 4 === 0 && year % 100 !== 0) || (year % 100 === 0 && year % 400 === 0)) {
            lastday = year + '-' + month + '-' + 29
        } else {
            lastday = year + '-' + month + '-' + 28
        }
    } else {
        lastday = year + '-' + month + '-' + 30
    }
    var day = ''
    if (type === 's') {
        day = firstday
    } else {
        day = lastday
    }
    return day
}

/**
 * 过滤列表
 * @param list 数据列表
 * @param params 过滤参数
 * @param configs 过滤配置
 * [
 *     {
 *          name: '需要比较的属性名称',
 *          type: '比较类型'    1、string 字符串模糊比较 2、same 完全相同 3、date 日期
 *          filter: 自定义过滤方法
 *          dataKey: 数据属性名称
 *     }
 * ]
 */
export function filterList(list, params, configs) {
    if (Array.isArray(list)) {
        return list.filter(item => {
            return configs.findIndex(config => {
                let value1 = item[config.dataKey || config.name]
                let value2 = params[config.name]
                if (typeof config.filter === 'function') {
                    return !config.filter(item)
                }
                if (isEmpty(value2)) return
                switch (config.type) {
                    case 'same': return value1 !== value2
                    case 'date': return !moment(value1).isSame(moment(value2))
                    case 'string': return isEmpty(value1) || value1.indexOf(value2) === -1
                    case 'dateRange':
                        if (Array.isArray(value2)) {
                            if (isEmpty(value2[0]) || isEmpty(value2[1])) {
                                return true
                            }
                            return moment(value1).isBetween(value2[0], value2[1])
                        }
                        return true
                }
            }) === -1
        })
    }
    return []
}
/**
 * 导出表格数据
 * @param options 选项配置
 * {
 *      name：导出文件名
 *      columns：表格配置项
 *      dataList：数据列表
 * }
 */
export function exportTabel(options) {
    let { name, columns, dataList } = options
    let data = [columns.map(v => v.label)]
    let cols = columns.map(column => {
        return {
            wch: (column.width || column.minWidth || 100) / 7
        }
    })
    dataList.forEach(row => {
        data.push(columns.map(column => {
            let value = row[column.prop]
            switch (column.type) {
                case 'date':
                    if (value) {
                        return moment(value).format(column.format || 'YYYY-MM-DD')
                    }
                    return ''
                case 'dict':
                case 'status':
                    var dictData = column.enums || enums[column.dictType] || store.commit('getDict', column.dictType)
                    if (dictData) {
                        return (dictData.find(v => v.value === row[column.prop]) || {}).label || ''
                    }
                    return ''
                case 'dateRange':
                    // 日期范围
                    var end = row[column.endKey]
                    var start = row[column.startKey]
                    if (start && end) {
                        return `${moment(start).format(column.format || 'yyyy-MM-DD')} 至 ${moment(end).format(column.format || 'yyyy-MM-DD')}`
                    }
                    return ''
                default:
                    return value
            }
        }))
    })
    var sheet = XLSX.utils.aoa_to_sheet(data)
    sheet['!cols'] = cols
    openDownloadDialog(sheet2blob(sheet), name + '.xlsx')
}

