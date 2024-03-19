/** *
 * 枚举类型
 */
// 企业规模
export const companyScaleEnum = [{
  value: 0,
  label: '100人以下'
}, {
  value: 1,
  label: '100~500人'
}, {
  value: 2,
  label: '500~1000人'
}, {
  value: 3,
  label: '1000~2000人'
}, {
  value: 4,
  label: '2000~5000人'
}, {
  value: 5,
  label: '5000~10000人'
}, {
  value: 6,
  label: '10000~20000人'
}, {
  value: 7,
  label: '20000人以上'
}]

// 企业类型
export const companyTypeEnum = [{
  value: 0,
  label: '私营企业'
}, {
  value: 1,
  label: '国营企业'
}, {
  value: 2,
  label: '合资公司'
}, {
  value: 3,
  label: '外资公司'
}]

export const insuranceEventEnum = [{
  value: 0,
  label: '入职办理五险一金'
},
{
  value: 1,
  label: '离职停缴五险一金'
}
]

export const auditStatus = [{
  value: 0,
  label: '待审核'
},
{
  value: 1,
  label: '审核通过'
},
{
  value: 2,
  label: '审核不通过'
}
]

export const sexEnum = [{
  value: false,
  label: '女'
}, {
  value: true,
  label: '男'
}]

// 是否启用
export const enableEnum = [{
  value: false,
  label: '否'
}, {
  value: true,
  label: '是'
}]

export const eduLevelEnum = [{
  value: 0,
  label: '小学'
},
{
  value: 1,
  label: '初中'
},
{
  value: 2,
  label: '高中或中专'
},
{
  value: 3,
  label: '大学专科'
},
{
  value: 4,
  label: '大学本科'
},
{
  value: 5,
  label: '硕士及以上'
}
]

// 合同类型
export const contractTypeEnum = [{
  value: 0,
  label: '销售合同'
}, {
  value: 1,
  label: '续期合同'
}]

// 合同签订枚举
export const contractSignStatusEnum = [{
  value: 0,
  label: '未签订'
}, {
  value: 1,
  label: '已签订'
}, {
  value: 2,
  label: '免签'
}]

// 分级分类 分类级别
export const classLevelEnum = [{
  value: 14002, // 0
  label: '大类'
}, {
  value: 14003, // 1
  label: '小类'
}]

// 角色类型
export const roleTypeEnum = [{
  value: 12001, // 0
  label: '系统角色'
}, {
  value: 12002, // 1
  label: '自定义角色'
}]

// 角色状态 10401：正常，10402：暂停，10403：删除
export const roleStatusEnum = [{
  value: 10401, // 0
  label: '正常'
}, {
  value: 10402, // 1
  label: '暂停'
}, {
  value: 10403, // 1
  label: '删除'
}]

// 用户中心的人员状态
const UserpeopleStatus = [{
  value: 0,
  text: '办理入职中'
}, {
  value: 1,
  text: '在职'
},
{
  value: 2,
  text: '离职'
}
]
// 角色归属类型

const ownerTypeEnum = [{
  value: 0,
  text: '外部角色'
}, {
  value: 1,
  text: '内部角色'
}]

// 用户类型
export const userTypeEnum = [
  {
    value: 11001,
    label: '用户'
  },
  {
    value: 11002,
    label: '采集员'
  },
  {
    value: 11003,
    label: '班组长'
  }
]

// 类型：15001：部门；15002：待定， 15003 ：企业；15004： 项目组
export const deptTypeEnum = [
  {
    value: 15001,
    label: '部门'
  },
  {
    value: 15002,
    label: '待定'
  },
  {
    value: 15003,
    label: '企业'
  },
  {
    value: 15004,
    label: '项目组'
  }
]

export default {
  companyScaleEnum,
  companyTypeEnum,
  auditStatus,
  sexEnum,
  eduLevelEnum,
  insuranceEventEnum, // 五险一金事件类型。
  UserpeopleStatus, // 用户中心人员状态
  ownerTypeEnum,
  userTypeEnum // 用户类型
}
