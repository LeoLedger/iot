// export const PARENT_ID = +process.env.VUE_APP_CITY_ASSESSMENT_ID
// console.error(PARENT_ID, 'PARENT_ID   VUE_APP_CITY_ASSESSMENT_ID')
import store from '@/store'
export const classLevel = [14002, 14003] // 大类  小类
const getSetting = store.getters.getAppSettings
export const PARENT_ID = +getSetting('pmi_class_case_id')
console.error(PARENT_ID, 'PARENT_ID')
