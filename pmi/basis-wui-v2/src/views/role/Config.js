import { roleStatusEnum, roleTypeEnum } from '@/utils/enum'
// 根部门，深圳市
export const DEPT_ID = ''// '00000000-0000-0000-0000-000000000000';
// 基础信息
export const basicForms = [
  {
    prop: 'id',
    label: '标识ID'
  },
  {
    prop: 'roleName',
    label: '角色名称',
    maxlength: 10,
    rules: {
      required: true,
      trigger: 'change',
      message: '请填角色名称'
    },
    blur(value, params) {
    }
  }, { // [1]
    prop: 'roleCode',
    label: '角色编号',
    isEdit: false,
    rules: {
      required: true,
      trigger: 'change',
      message: '角色编号生成失败!'
    }
  }, {
    prop: 'deptStr',
    label: '所属部门',
    itemType: 'cascader',
    options: [],
    showAllLevels: true,
    rules: {
      required: true,
      trigger: 'change',
      message: '请选择所属部门'
    }
  },
  {
    prop: 'mapStr',
    label: '所属区域',
    itemType: 'cascader',
    options: [],
    showAllLevels: true,
    rules: {
      required: true,
      trigger: 'change',
      message: '请选择所属区域'
    }
  }, {
    prop: 'roleType',
    label: '角色类型',
    itemType: 'select',
    options: roleTypeEnum,
    rules: {
      required: true,
      trigger: 'change',
      message: '请选择角色类型'
    }
  }, {
    prop: 'roleStatus',
    label: '角色状态',
    itemType: 'select',
    options: roleStatusEnum,
    rules: {
      required: true,
      trigger: 'change',
      message: '请选择角色状态'
    }
  }, {
    prop: 'orderNum',
    label: '排序',
    itemType: 'inputNumber',
    controlsPosition: 'none',
    className: 'textCenter',
    unPrecision: true,
    min: 0
  }, {
    prop: 'remarks',
    label: '备注',
    itemType: 'textarea',
    numLimit: 250,

    span: 24
  }]
