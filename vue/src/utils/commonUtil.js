
/**
 * 该功能用于 var resultObj = Object.assign({},obj1, obj2)  中 obj2有深对象 仅对 值做修改的情况
 *
 * @param newObj 被注入的新对象
 * @param defaultObj 默认对象
 * @returns {*|{}}
 */
export const ObjAssignDeep = (newObj, defaultObj) => {
    let target = defaultObj || {},
        injectObj = newObj || {}
    for (const key in injectObj) {
        if (injectObj.hasOwnProperty(key)) {
            if (typeof injectObj[key] === 'object') { // 对象/数组 都在此进行拷贝
                // 如果当前被注入的值是数组 且 原对象没有该数组 或不存在 将会被 直接附值
                if (Array.isArray(injectObj[key]) && (!target[key] || !target[key].length)) {
                    target[key] = JSON.parse(JSON.stringify(injectObj[key]))
                } else {
                    target[key] = ObjAssignDeep(injectObj[key], target[key] || {})
                }
            } else {
                target[key] = injectObj[key]
            }
        }
    }
    return target
}

/**
 * @param obj 【检测对象】
 * @param keyArr 【需要获取该对象内部数据key数组】
 * @returns {*}
 */
export function getDeepValue(obj, keyArr) {
    return keyArr.reduce((acc, key) => {
        return acc[key] ? acc[key] : ''
    }, obj)
}

/**
 * @param num
 * @returns {string} // 保留两位小数的 Str
 */
export function getNumberStr(num) {
    return num.toFixed(2).replace(/\B(?=(\d{3})+\b)/g, ',')
}

// 修正rem比例
let global_VwUnit = 0
export function vwToPx(rem) {
    global_VwUnit = global_VwUnit || (document.documentElement.clientWidth / 100)
    // var fontSize = document.documentElement.style.fontSize
    // return Math.floor(rem * fontSize.replace('px', ''))
    return Math.floor(rem * global_VwUnit)
}

/** 查看log 数据
 * @param content
 * @param title
 * @param background
 */
export const consoleLog = (function() {
    if (process.env.VUE_APP_ENV === 'production') {
        return function log(){}
    }
    return function log(content = 'content', title = 'title', background = '#1475b2') {
        // content = typeof content === 'object' ? JSON.stringify(content, null, '\t') : content // 换行处理
        content = typeof content === 'object' ? JSON.stringify(content) : content
        console.log.apply(null, [`%c ${title}： %c ${content} `, 'padding: 1px; border-radius: 10px; color: #fff; background: #9159B2;', `padding: 1px; border-radius: 10px; color: #fff; background: ${background};`])
    }
})()
