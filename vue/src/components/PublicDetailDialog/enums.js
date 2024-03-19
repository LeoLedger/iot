import CloseingBill from '@/views/operationsManagement/maintenanceBill/components/ClosingDialog/index'

export default {
    project: {/* 默认参数，待定 */}, // 项目
    product: {/* 默认参数，待定 */ }, // 产品
    contacts: {/* 默认参数，待定 */ }, // 联系人
    salesContract: {/* 默认参数，待定 */ }, // 销售合同
    purchaseContract: {/* 默认参数，待定 */ }, // 采购合同
    materialTesting: {/* 默认参数，待定 */}, // 来料批次检测
    supplier: {}, // 供应商
    sections: {}, // 标段
    customer: {}, // 客户
    device: {}, // 智能设备
    invoice: {}, // 发票
    deviceSim: {}, // SIM卡设备
    troubleTicket: {}, // 故障单
    sendRevised: {}, // 寄修单
    paymentRecord: {}, // 付款记录
    collectionRecord: {}, // 收款记录
    expressBill: {}, // 快递单
    carTroubleBill: {}, // 车辆维修单
    deviceInstall: {}, // 设备安装管理
    deviceInstallNew: {}, // 设备安装详情___新的
    maintenanceBill: {}, // 维修费账单
    closeingBill: {}, // 维修费结算
    expressRepairCar: {}, // 车辆寄修单
    installChargeBill: {}, // 安装费账单
    /**
     * 审批单详情
     */
    demandApproval: {}, // 需求申请单
    salesContractApproval: {}, // 销售合同审批单
    storagePutApproval: {}, // 入库申请单
    storageOutApproval: {}, // 出库申请单
    storageBackApproval: {}, // 退库申请单
    deviceDamagedApproval: {}, // 报损
    returnCashApproval: {}, // 退还押金
    renewSIMApproval: {}, // SIM卡续费
    deviceInstallApproval: {}, // 设备安装申请单
    invoiceApproval: {}, // 开票申请单
    deviceAllocateApproval: {},
    deviceExtendEarrantyApproval: {}, // 设备过保翻新申请单
    serviceChargeRefundApproval: {} // 服务费退款申请单
}
