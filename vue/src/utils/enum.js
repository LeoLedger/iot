/**
 * 系统共用、稳定的数据。
 */

export default {
    // 性别
    sex: [
        { label: '男', value: 0 },
        { label: '女', value: 1 }
    ],
    // 项目状态
    projectStatus: [
        { label: '已关闭', value: 0, color: '#e65a6b' },
        { label: '正常', value: 1, color: '#3ac270' }
    ],
    // 公司类型
    companyType: [
        { label: '客户', value: 0 },
        { label: '供应商', value: 1 }
    ],
    // 仓库类型
    warehousesType: [
        { label: '实体仓库', value: 0 },
        { label: '虚拟仓库', value: 1 }
    ],
    // 合同类型
    contractType: [
        { label: '销售+服务', value: 0, type: 1 },
        { label: '设备+服务', value: 1, type: 1 },
        { label: '补购', value: 2, type: 2 },
        { label: '续费', value: 3, type: 3 },
        { label: '其他', value: 9, type: 1 }
    ],
    // 合同状态
    contractStatus: [
        { label: '审核中', value: 1, color: '#55b1f2' },
        { label: '待执行', value: 2, color: '#ffb364' },
        { label: '执行中', value: 3, color: '#67c23a' },
        { label: '已终止', value: 4, color: '#bfbfbf' }
    ],
    // 合同有无盖章
    contractSeal: [
        { label: '无盖章', value: 0 },
        { label: '有盖章', value: 1 }
    ],
    // 合同有无盖章
    isProjectContract: [
        { label: '否', value: 0 },
        { label: '是', value: 1 }
    ],
    // 是否虚拟合同
    isVirtualContract: [
        { label: '否', value: 0 },
        { label: '是', value: 1 }
    ],
    // 是否历史设备合同
    isDeviceHistoryContract: [
        { label: '否', value: 0 },
        { label: '是', value: 1 }
    ],
    // 销售模式
    salesType: [
        { label: '销售', value: 0 },
        { label: '租赁', value: 1 },
        { label: '其他', value: 2 }
    ],
    // 审批类型
    approvalType: [
        { label: '需求申请单', value: 0 },
        { label: '入库申请单', value: 1 },
        { label: '出库申请单', value: 2 },
        { label: '退库申请单', value: 3 },
        { label: '开票申请单', value: 4 },
        { label: '退还押金申请单', value: 5 },
        { label: '服务费退款申请单', value: 6 },
        { label: '设备延保申请单', value: 7 },
        { label: 'sim卡续费申请单', value: 8 },
        { label: '设备调拨申请单', value: 9 },
        { label: '设备报损申请单', value: 10 },
        { label: '设备安装申请单', value: 11 },
        { label: '销售合同', value: 12 },
        { label: '库存盘点申请单', value: 13 }
    ],
    // 审批类型
    approvalStatus: [
        { label: '未办理', value: 0, color: '#555' },
        { label: '通过', value: 1, color: '#76c84f' },
        { label: '驳回', value: 2, color: '#f59a23' },
        { label: '已撤回', value: 3, color: '' },
        { label: '已取消', value: 4, color: '' },
        { label: '已停止', value: 5, color: '#fc455c' },
        { label: '重新开始', value: 6, color: '' }
    ],
    // 单据状态
    documentStatus: [
        { label: '审批中', value: 0, color: '#55b1f2' },
        { label: '已撤回', value: 1, color: '#f59a23' },
        { label: '已驳回', value: 2, color: '#e65a6b' },
        { label: '已通过', value: 3, color: '#67c23a' },
        { label: '已核销', value: 4, color: '#67c23a' }
    ],
    // 认领状态
    claimStatus: [
        { label: '待认领', value: 0, color: '#e65a6b' },
        { label: '已认领', value: 1, color: '#55b1f2' }
    ],
    // 设备状态
    deviceStatus: [
        { label: '正常', value: 1, color: '#67c23a' },
        { label: '报损', value: 2, color: '#f59a23' },
        { label: '报障', value: 3, color: '#f59a23' },
        { label: '待检测', value: 4, color: '#55b1f2' },
        { label: '寄修中', value: 5, color: '#55b1f2' },
        { label: '保修中', value: 6, color: '#55b1f2' },
        { label: '报废', value: 7, color: '#e65a6b' },
        { label: '挂起', value: 8, color: '#e65a6b' },
        { label: '已停用', value: 9, color: '#bbb' },
        { label: '待寄修', value: 10, color: '#55b1f2' },
        { label: '已丢失', value: 11, color: '#bbb' },
        { label: '损坏', value: 12, color: '#f59a23' },
        { label: '过保', value: 13, color: '#f59a23' },
        { label: '故障', value: 14, color: '#e65a6b' },
        { label: '调拨中', value: 15, color: '#55b1f2' }
    ],
    // 收款-费用类型
    costType: [
        { label: '押金', value: 0, dialogType: 'salesContract' },
        { label: '服务费', value: 1, dialogType: 'salesContract' },
        { label: '产品销售费', value: 2, dialogType: 'salesContract' },
        { label: '安装费', value: 3, dialogType: 'deviceInstallNew' },
        { label: '扣除押金', value: 4, dialogType: 'returnCashApproval' },
        { label: '设备维修费', value: 5, dialogType: 'maintenanceBill' },
        { label: '迁装费', value: 6, dialogType: 'salesContract' },
        { label: '维修费结算', value: 7, dialogType: 'closeingBill' }
    ],
    // 付款-费用类型
    payType: [
        { label: '采购付款', value: 0, dialogType: 'purchaseContract' },
        { label: '设备维修费', value: 1, dialogType: 'maintenanceBill' },
        { label: 'SIM卡流量费', value: 2, dialogType: 'renewSIMApproval' },
        { label: '服务费退款', value: 3, dialogType: 'serviceChargeRefundApproval' },
        { label: '退还押金', value: 4, dialogType: 'returnCashApproval' },
        { label: '设备延保', value: 5, dialogType: 'deviceExtendEarrantyApproval' },
        { label: '设备安装费', value: 6, dialogType: 'deviceInstallNew' },
        { label: '维修费结算', value: 7, dialogType: 'closeingBill' }
    ],
    // 收入核算-单据类型
    accountBillType: [
        { label: '出库单', value: 0, dialogType: 'storageOutApproval' },
        { label: '销售合同', value: 1, dialogType: 'salesContract' },
        { label: '退还押金申请单', value: 2, dialogType: 'returnCashApproval' },
        { label: '寄修单', value: 3, dialogType: 'sendRevised' },
        { label: '维修单', value: 4, dialogType: 'carTroubleBill' },
        { label: '报损申请单', value: 5, dialogType: 'deviceDamagedApproval' },
        { label: '退库申请单', value: 6, dialogType: 'storageBackApproval' },
        { label: '故障单', value: 7, dialogType: 'troubleTicket' },
        { label: '延保申请单', value: 8, dialogType: 'deviceExtendEarrantyApproval' },
        // { label: '设备安装单', value: 9, dialogType: 'deviceInstall' },
        { label: '安装费账单', value: 9, dialogType: 'installChargeBill' },
        { label: '维修费账单', value: 10, dialogType: 'closeingBill' }
    ],
    // 成本/收入核算-费用类型
    accountCostType: [
        { label: '产品销售收入', value: 1 },
        { label: '服务费', value: 2 },
        { label: '扣除押金', value: 3 },
        { label: '安装费', value: 4 },
        { label: '维修费', value: 5 },
        { label: '采购成本', value: 6 },
        { label: '设备维保费', value: 7 },
        { label: 'SIM卡流量费', value: 8 },
        { label: '设备维修费', value: 9 },
        { label: '迁装费', value: 10 }
    ],
    // 结转-结转类型
    accountDetailType: [
        { label: '收入', value: 0 },
        { label: '成本', value: 1 }
    ],
    // 付款/收款记录-类型
    paymentRecordType: [
        { label: '正常', value: 0 },
        { label: '冲抵单', value: 1 }
    ],
    // 操作类型
    operatorType: [
        { label: '出库', value: 0, dialogType: 'storageOutApproval' },
        { label: '入库', value: 1, dialogType: 'storagePutApproval' },
        { label: '调拨', value: 2, dialogType: 'deviceAllocateApproval' },
        { label: '退库', value: 3, dialogType: 'storageBackApproval' },
        { label: '续期', value: 4, dialogType: 'salesContract' },
        { label: '寄修', value: 5, dialogType: 'sendRevised' },
        { label: '延保', value: 6, dialogType: 'deviceExtendEarrantyApproval' },
        { label: '维修替换', value: 7, dialogType: 'troubleTicket' },
        { label: '故障登记', value: 8, dialogType: 'troubleTicket' },
        { label: '随设备入库', value: 9, dialogType: 'storagePutApproval' },
        { label: '随设备退库', value: 10, dialogType: 'storageBackApproval' },
        { label: '随设备报损', value: 11, dialogType: 'deviceDamagedApproval' },
        { label: '重新绑定设备', value: 12, dialogType: 'sendRevised' },
        { label: '随设备替换', value: 13, dialogType: 'troubleTicket' },
        { label: '随设备报修', value: 14, dialogType: 'sendRevised' },
        { label: '替换报损', value: 15, dialogType: 'sendRevised' },
        { label: '报损', value: 16, dialogType: 'deviceDamagedApproval' },
        { label: '寄修核检', value: 17, dialogType: 'sendRevised' },
        { label: '故障报损', value: 18, dialogType: 'troubleTicket' },
        { label: '随设备出库', value: 19, dialogType: 'storageOutApproval' },
        { label: '随寄修设备报损', value: 20, dialogType: 'sendRevised' },
        { label: '随故障设备报损', value: 21, dialogType: 'troubleTicket' },
        { label: 'SIM卡续费', value: 22, dialogType: 'renewSIMApproval' },
        { label: '报废', value: 23, dialogType: 'carTroubleBill' },
        { label: '保修替换', value: 24, dialogType: 'carTroubleBill' },
        { label: '维修登记', value: 25, dialogType: 'carTroubleBill' },
        { label: '随设备报废', value: 26, dialogType: 'carTroubleBill' },
        { label: '随设备替换', value: 27, dialogType: 'carTroubleBill' },
        { label: '随设备报修', value: 28, dialogType: 'carTroubleBill' },
        { label: '重新绑定设备', value: 29, dialogType: 'carTroubleBill' },
        { label: '寄修替换', value: 30, dialogType: 'sendRevised' },
        { label: '寄修回收备用', value: 31, dialogType: 'sendRevised' },
        { label: '挂起', value: 32 },
        { label: '丢失', value: 33, dialogType: 'storageOutApproval' },
        { label: '重新绑定设备', value: 34, dialogType: 'storageOutApproval' },
        { label: '车辆寄修报废', value: 35, dialogType: 'expressRepairCar' },
        { label: '车辆寄修备用', value: 36, dialogType: 'expressRepairCar' }
    ],
    // 出库类型
    storageOutType: [
        { label: '全新出库', value: 0 },
        { label: '旧设备出库', value: 1 },
        { label: '保修更换出库', value: 2 },
        { label: '保修更换出库', value: 3 }
    ],
    // 开票状态
    invoiceStatus: [
        { label: '未开票', value: 0, color: '#555' },
        { label: '开票中', value: 1, color: '#55b1f2' },
        { label: '已开票', value: 2, color: '#67c23a' }
    ],
    // 检测类型
    checkType: [
        { label: '来料检测', value: 0 },
        { label: '领料检测', value: 1 }
    ],
    // 检测结果
    checkResult: [
        { label: '合格', value: 0, color: '#6fc544' },
        { label: '不合格', value: 1, color: '#f85c5c' }
    ],
    // 抽检结果
    spotCheckResult: [
        { label: '通过', value: 0, color: '#6fc544' },
        { label: '不通过', value: 1, color: '#f85c5c' }
    ],
    // 发票类型
    invoiceType: [
        { label: '增值税普通发票（纸）', value: 0 },
        { label: '增值税普通发票（电子）', value: 3 },
        { label: '增值税专用发票（纸）', value: 1 },
        { label: '增值税专用发票（电子）', value: 4 },
        { label: '押金条', value: 2 }
    ],
    // 发票类型
    isMergeInvoice: [
        { label: '是', value: 0 },
        { label: '否', value: 1 }
    ],
    // 故障单状态
    troubleBillsStatus: [
        { label: '待处理', value: 0, color: '#555' },
        { label: '处理中', value: 1, color: '#55b1f2' },
        { label: '已处理', value: 2, color: '#67c23a' }
    ],
    // 故障单处理方式
    troubleBillsHandlingWay: [
        { label: '寄修', value: 0 },
        { label: '收回备用', value: 1 },
        { label: '挂起', value: 2 },
        { label: '报废', value: 3 },
        { label: '二次返修', value: 4 },
        { label: '退回', value: 5 },
        { label: '过保', value: 6 }
    ],
    // 车辆故障单处理方式
    carTroubleBillsHandlingWay: [
        { label: '继续运营', value: 0 },
        { label: '收回备用库', value: 1 },
        { label: '报废', value: 2 }
    ],
    expressRepairCarHandlingWay: [
        { label: '收回备用库', value: 1 },
        { label: '报废', value: 0 }
    ],
    expressRepairCarVerificationResult: [
        { label: '已修好', value: 1 },
        { label: '永久损坏', value: 0 }
    ],
    // 故障单维修状态
    troubleBillsRepairStatus: [
        { label: '待处理', value: 1 },
        { label: '待寄修', value: 2 },
        { label: '寄修中', value: 3 },
        { label: '已完成', value: 4 }
    ],
    // 故障单替换设备类型
    troubleReplaceType: [
        { label: '备用设备', value: 0 },
        { label: '全新设备', value: 1 },
        { label: '挂起设备', value: 2 },
        { label: '原设备寄回', value: 3 }
    ],
    // 是否二次返修
    isSecondRepair: [
        { label: '否', value: 0 },
        { label: '是', value: 1 }
    ],
    // 产品种类ID
    productCategoryId: [
        { id: 'B16C3151-11D2-4364-8F45-63EFFFFCF424', value: 0, label: '智能设备' },
        { id: 'BBB76246-2925-43D8-B81D-D5FF74F1D1D7', value: 1, label: 'SIM卡' },
        { id: 'FBB2B7F6-CD9A-48CA-8300-C72D34BC3100', value: 2, label: '其他产品' }
    ],
    // 处理状态
    handleStatus: [
        { label: '处理中', value: 0, color: '#55b1f2' },
        { label: '已处理', value: 1, color: '#67c23a' }
    ],
    // 维修状态
    repairStatus: [
        { label: '处理中', value: 0, color: '#55b1f2' },
        { label: '已处理', value: 1, color: '#67c23a' }
    ],
    // 维修/寄修单状态
    maintenanceBillStatus: [
        { label: '待确认', value: 0, color: '#55b1f2' },
        { label: '已确认', value: 1, color: '#67c23a' }
    ],
    maintenanceBillStatus2: [
        { label: '维修中', value: 0, color: '#55b1f2' },
        { label: '已完成', value: 1, color: '#67c23a' }
    ],
    // 替换类型
    replaceType: [
        { label: '全新设备', value: 1 },
        { label: '旧设备', value: 2 },
        { label: '备用设备', value: 3 }
    ],
    // 处理方式
    handlingWay: [
        { label: '寄修', value: 0 },
        { label: '回收', value: 1 },
        { label: '挂起', value: 2 },
        { label: '报废', value: 3 }
    ],
    // 寄修类型
    sendRevisedType: [
        { label: '正常维修', value: 0 },
        { label: '过保翻新', value: 1 },
        { label: '其他', value: 2 },
        { label: '旧设备维修/备用设备维修', value: 3 }
    ],
    // 寄修单状态
    sendRevisedStatus: [
        { label: '寄修待反馈', value: 0 },
        { label: '分配核验', value: 1 },
        { label: '核验确认', value: 2 },
        { label: '已完成', value: 3 }
    ],
    // 寄修设备维修状态
    sendRevisedRepairStatus: [
        { label: '寄修中', value: 0 },
        { label: '已完成', value: 1 }
    ],
    // 是否有换卡
    isReplaceSim: [
        { label: '否', value: 0 },
        { label: '是', value: 1 }
    ],
    // 是否查看全部
    isReadAll: [
        { label: '有维修费用结算', value: 0 },
        { label: '全部', value: 1 }
    ],
    // 寄修核验结果
    verifiableResult: [
        { label: '未修好', value: 0 },
        { label: '已修好', value: 1 },
        { label: '人为损坏未修', value: 2 },
        { label: '人为损坏已修', value: 3 },
        { label: '永久损坏', value: 4 },
        { label: '退回', value: 5 },
        { label: '过保', value: 6 }
    ],
    // 寄修处理方式
    sendRevisedDisposalWay: [
        { label: '收回备用库', value: 1 },
        { label: '挂起', value: 2 },
        { label: '报废', value: 3 },
        { label: '二次返修', value: 4 },
        { label: '退回', value: 5 },
        { label: '过保', value: 6 }
    ],
    // 仓位类型枚举-智能设备
    warehousesSpaceTypeSmart: [
        { label: '全新', guidId: 'cf9460c5-9f2c-11eb-bbfa-000c29bb1337', type: 1 },
        { label: '旧设备', guidId: 'cf9469fd-9f2c-11eb-bbfa-000c29bb1337', type: 2 },
        { label: '备用', guidId: 'cf946b83-9f2c-11eb-bbfa-000c29bb1337', type: 3 },
        { label: '在运营', guidId: 'cf946c33-9f2c-11eb-bbfa-000c29bb1337', type: 4 },
        { label: '寄存', guidId: '3ad17249-a0dd-11eb-8666-000c29bb1337', type: 5 },
        { label: '报损', guidId: 'cf946d66-9f2c-11eb-bbfa-000c29bb1337', type: 6 }
    ],
    // 仓位类型枚举-其他产品
    warehousesSpaceTypeOther: [
        { label: '全新', guidId: 'cf946df8-9f2c-11eb-bbfa-000c29bb1337', type: 1 },
        { label: '已出库', guidId: 'cf946ebb-9f2c-11eb-bbfa-000c29bb1337', type: 2 }
    ],
    // 仓位类型枚举-SIM卡
    warehousesSpaceTypeSim: [
        { label: '全新', guidId: 'cf946f5c-9f2c-11eb-bbfa-000c29bb1337', type: 1 },
        { label: '已出库', guidId: 'cf946fe5-9f2c-11eb-bbfa-000c29bb1337', type: 2 },
        { label: '已报废', guidId: 'cf947068-9f2c-11eb-bbfa-000c29bb1337', type: 3 },
        { label: '备用', guidId: 'ae8c416f-b6b6-11eb-8666-000c29bb1337', type: 4 }
    ],
    // 退库-清点结果
    storageReturnResultType: [
        { label: '正常', value: 0 },
        { label: '人为损坏', value: 1 },
        { label: '丢失', value: 2 },
        { label: '过保', value: 3 },
        { label: '故障', value: 4 }
    ],
    // 退库-处理方式
    storageReturnHandleType: [
        { label: '收回旧设备库', value: 0 },
        { label: '报废', value: 1 }
    ],
    // 库存盘点状态
    stocktakingStatus: [
        { label: '未盘点', value: 0, color: '#aaa', border: true, borderColor: '#d7d7d7' },
        { label: '在库', value: 1, color: '#0ba1e4' },
        { label: '盘盈', value: 2, color: '#f86767' },
        { label: '盘亏', value: 3, color: '#67c23a' }
    ],
    // 设备充电状态
    deviceChargeState: [
        { label: '开启', value: 1 },
        { label: '关闭', value: 0 }
    ],
    // 设备GPS状态
    deviceGpsState: [
        { label: '正常', value: 1 },
        { label: '异常', value: 0 }
    ],
    // 设备告警扩展
    deviceWarnExt: [
        { label: '正常', value: 0 },
        { label: '正常', value: 1 },
        { label: '断电报警', value: 2 },
        { label: '震动报警', value: 3 },
        { label: '进围栏报警', value: 4 },
        { label: '进围栏报警', value: 5 },
        { label: '超速报警', value: 6 },
        { label: '位移报警', value: 9 },
        { label: '进GPS 盲区报警', value: 10 },
        { label: '出GPS 盲区报警', value: 11 },
        { label: '开机报警', value: 12 },
        { label: 'GPS 第一次定位报警', value: 13 },
        { label: '低电压报警', value: 14 },
        { label: '低电压保护报警', value: 15 },
        { label: '换卡报警', value: 16 },
        { label: '低电压关机报警', value: 17 },
        { label: '低电压保护飞行模式报警', value: 18 },
        { label: '拆卸报警', value: 19 },
        { label: '门报警', value: 20 },
        { label: '关机报警', value: 21 },
        { label: '低电报警', value: 130 },
        { label: '拆除报警', value: 131 },
        { label: '碰撞报警', value: 132 }
    ],
    // 设备报警状态
    deviceWarnState: [
        { label: '正常', value: 0 },
        { label: 'SOS 求救', value: 1 },
        { label: '疲劳驾驶', value: 2 },
        { label: '超速报警', value: 4 },
        { label: '低电报警', value: 3 },
        { label: '断电报警', value: 5 },
        { label: '震动报警', value: 6 }
    ],
    // 设备运动状态
    deviceWarnExtInfoChild: [
        { label: '静止', value: 0 },
        { label: '运动', value: 1 }
    ],
    // 上传方式
    deviceUpType: [
        { label: '实时上传', value: 0 },
        { label: '补传', value: 1 }
    ],
    // 标段范围内
    deviceIsInSection: [
        { label: '是', value: 1 },
        { label: '否', value: 0 }
    ],
    // 设备安装任务状态
    deviceInstallTaskStatus: [
        { label: '安装中', value: 0, color: '#409eff' },
        { label: '已结束', value: 9, color: '#aaa' }
    ],
    // 设备安装费状态
    deviceInstallChargeStatus: [
        { label: '待确认', value: 0, color: '#409eff' },
        { label: '已确认', value: 9, color: '#67c23a' }
    ],
    // 审批对象类型
    receiveType: [
        { label: '用户', value: 100601 },
        { label: '角色', value: 100602 },
        { label: '部门', value: 100603 },
        { label: '其它', value: 100604 }
    ],
    // 收款状态
    amountCompleteFlag: [
        { label: '已完成收款', value: 0 },
        { label: '未收完款', value: 1 }
    ],
    // 是否过保翻新
    isRenovation: [
        { label: '否', value: 0 },
        { label: '是', value: 1 }
    ]
}

