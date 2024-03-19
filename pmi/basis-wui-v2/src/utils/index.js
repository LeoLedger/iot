/**
 * Created by PanJiaChen on 16/11/18.
 */
import {
  getToken
} from './auth' // 导入token

// 判断是否为空
export function isEmpty(value) {
  return ['', null, void 0].includes(value)
}
/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
      time = parseInt(time)
    }
    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value ] }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
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
        .replace(/=/g, '":"')
        .replace(/\+/g, ' ') +
      '"}'
  )
}

/**
 * @param url
 * @param params
 * @returns {*}
 */
export function buildUrl(url, params) {
  var serializedParams
  var parts = []

  forEach(params, function serialize(val, key) {
    if (val === '' || val === null || typeof val === 'undefined') {
      return
    }

    if (isArray(val)) {
      key = key + '[]'
    } else {
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

function isArray(val) {
  return toString.call(val) === '[object Array]'
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

  if (isArray(obj)) {
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

// 除去空白省份
export function deleteNullCity(data) {
  for (const i in data) {
    for (const j in data[i].children) {
      for (const k in data[i].children[j].children) {
        delete data[i].children[j].children[k].children
      }
    }
  }
}

/**
 * 导出列表
 * @param params
 * @param api
 */
export const commonExport = (params, api) => {
  const tmp = JSON.parse(JSON.stringify(params))
  tmp['access_token'] = getToken()
  const url = buildUrl(process.env.VUE_APP_BASE_API + api, tmp)
  window.open(url)
}
