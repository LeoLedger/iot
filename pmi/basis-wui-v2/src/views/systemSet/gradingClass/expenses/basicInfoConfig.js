import store from '@/store'
import {classLevelEnum} from '@/utils/enum'
const getSetting = store.getters.getAppSettings
export const PARENT_ID = +getSetting('ProjectExpenditureClassId')
// export const PARENT_ID = 116

export const classLevel = [14002, 14003] // 大类  小类

// 基础信息
export const basicForms = [
    {
        prop: 'name',
        label: '分类名称',
    }, { // [1]
        prop: 'code',
        label: '分类编号',
        isEdit: false
    }, /*{ // [2]
        prop: 'parentId',
        label: '上级分类', // option
        itemType: 'select',
        options: [],
        isEdit: false
    },  */ { // [2]
        prop: 'parentIdStr', // parentId
        label: '上级分类', // option
        itemType: 'cascader',
        options: [],
        showAllLevels: false
    }, { // [3]
        prop: 'type',
        label: '分类级别',
        itemType: 'select',
        options: classLevelEnum,
        isEdit: false
    }, {
        prop: 'sort',
        label: '分类排序',
        itemType: 'inputNumber',
        controlsPosition: 'none',
        className: 'textCenter',
        unPrecision: true,
    }, {
        prop: 'remarks',
        label: '备注',
        itemType: 'textarea',
        span: 24,
    }]
