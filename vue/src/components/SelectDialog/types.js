
// 选择类型枚举
export default {
    'sim': { dataKey: 'guidId', labelKey: 'sim' }, // 选择SIM卡
    'device': { dataKey: 'guidId', labelKey: 'productCode' }, // 选择设备
    'company': { dataKey: 'guidId', labelKey: 'name' }, // 选择客户
    'people': { dataKey: 'userId', labelKey: 'userName' }, // 选择人员
    'project': { dataKey: 'guidId', labelKey: 'projectName' }, // 选择项目
    'product': { dataKey: 'guidId', labelKey: 'name' }, // 选择产品
    'supplier': { dataKey: 'guidId', labelKey: 'name' }, // 选择供应商
    'contacts': { dataKey: 'guidId', labelKey: 'name' }, // 选择联系人
    'sections': { dataKey: 'guidId', labelKey: 'name' }, // 选择标段
    'empowerIp': { dataKey: 'value', labelKey: 'label' }, // 授权IP
    'projectEO': { dataKey: 'xxx', labelKey: 'xxx' }, // 选择EO项目
    'salesContract': { dataKey: 'guidId', labelKey: 'name' }, // 销售合同
    'purchaseContract': { dataKey: 'guidId', labelKey: 'name' }, // 采购合同
    'materialTesting': { dataKey: 'guidId', labelKey: 'code' }, // 来料批次检测
    'deviceFailure': { dataKey: 'guidId', labelKey: 'imei' }, // 故障设备
    'receivables': { dataKey: 'guidId', labelKey: 'code' }, // 应收账款
    'moneyClaim': { dataKey: 'guidId', labelKey: 'receivableCode' }, // 收款认领信息
    'storagePut': { dataKey: 'guidId', labelKey: 'code' }, // 入库申请单
    'storageOut': { dataKey: 'guidId', labelKey: 'code' }, // 出库申请单
    'express': { dataKey: 'guidId', labelKey: 'code' }, // 快递单,
    'expressBill': { dataKey: 'guidId', labelKey: 'code' }, // 寄修单,
    'maintainBill': { dataKey: 'guidId', labelKey: 'code' }, // 维修单
    'invoice': { dataKey: 'guidId', labelKey: 'code' }, // 发票
    'maintenanceBill': { dataKey: 'guidId', labelKey: 'code' }, // 维修费账单
    'deviceInstallBill': { dataKey: 'guidId', labelKey: 'code' } // 设备安装清单
}

