
/**
 * 该功能用于 var resultObj = Object.assign({},obj1, obj2)  中 obj2有深对象 仅对 值做修改的情况
 *
 * @param newObj 被注入的新对象
 * @param defaultObj 默认对象
 * @returns {*|{}}
 */
export const ObjAssignDeep = (newObj, defaultObj) => {
    let target = defaultObj || {},
        injectObj = newObj || {};
    for (let key in injectObj) {
        if (injectObj.hasOwnProperty(key)) {
            if (typeof injectObj[key] === 'object') { // 对象/数组 都在此进行拷贝
                // 如果当前被注入的值是数组 且 原对象没有该数组 或不存在 将会被 直接附值
                if (Array.isArray(injectObj[key]) && (!target[key] || !target[key].length)) {
                    target[key] = JSON.parse(JSON.stringify(injectObj[key]))
                } else {
                    target[key] = ObjAssignDeep(injectObj[key], target[key] || {});
                }
            } else {
                target[key] = injectObj[key];
            }
        }
    }
    return target;
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
 * @returns {String}
 */

export function getPriceStr(num) {
    return (+num).toLocaleString('zh', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}
