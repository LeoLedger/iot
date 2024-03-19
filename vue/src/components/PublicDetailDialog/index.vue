<!--
* @description 详情弹窗
* @author yc
!-->
<template>
    <component
        v-if="visible"
        :is="type"
        :data-id="dataId"
        :row-data="rowData"
        :visible="interiorVisible"
        v-bind="extendParams"
        @update:visible="handleVisibleChange"
    />
</template>

<script>
    // 项目
    import Project from '@/views/PM/project/components/DetailDialog'
    // 标段
    import Sections from '@/views/PM/section/components/DetailDialog'
    // 产品
    import Product from '@/views/purchaseManagement/product/components/DetailDialog'
    // 供应商详情
    import Supplier from '@/views/purchaseManagement/supplier/components/DetailDialog'
    // 客户
    import Customer from '@/views/PM/client/components/DetailDialog'
    // 联系人
    import Contacts from '@/views/PM/contacts/components/DetailDialog'
    // 销售合同
    import SalesContract from '@/views/PM/salesContract/components/DetailDialog'
    // 发票
    import Invoice from '@/views/public/invoice/InvoiceDialog'
    // 设备-智能
    import Device from '@/views/inventoryManagement/DeviceComponents/deviceDetailDialog'
    // 设备-SIM卡
    import DeviceSim from '@/views/inventoryManagement/SIM/DeviceComponents/deviceDetailDialog'
    // 来料批次检测
    import materialTesting from '@/views/operationsManagement/materialTesting/components/DetailDialog'
    // 采购合同
    import PurchaseContract from '@/views/purchaseManagement/contract/components/DetailDialog'
    // 故障单
    import TroubleTicket from '@/views/operationsManagement/PEMM/troubleTicket/components/DetailDialog'
    // 寄修单
    import SendRevised from '@/views/operationsManagement/PEMM/sendRevised/components/DetailDialog'
    // 快递单
    import ExpressBill from '@/views/operationsManagement/expressWaybill/EditDialog'
    // 付款记录
    import PaymentRecord from '@/views/businessAccounting/AP/paymentRecord/components/ClaimDialog/Detail'
    // 收款记录
    import CollectionRecord from '@/views/businessAccounting/AR/collectionRecord/components/ClaimDialog/Detail'
    // 车辆维修单
    import CarTroubleBill from '@/views/operationsManagement/VEMM/register/confirmDialog/Detail'
    // 车辆寄修单
    import ExpressRepairCar from '@/views/operationsManagement/VEMM/expressRepairCar/editDialog/index'
    // 设备安装管理
    import DeviceInstall from '@/views/operationsManagement/deviceInstall/components/DetailDialog'
    import DeviceInstallNew from '@/views/operationsManagement/installChargeBill/components/ConfirmDialog'
    // 维修费账单
    import MaintenanceBill from '@/views/operationsManagement/maintenanceBill/components/BillDialog'
    import CloseingBill from '@/views/operationsManagement/maintenanceBill/components/ClosingDialog'
    // 安装费账单
    import InstallChargeBill from '@/views/operationsManagement/installChargeBill/components/ConfirmDialog'
    /**
     * 审批单详情
     */
    import DemandApproval from '@/views/businessDocuments/components/Demand/components/Approval' // 需求申请单
    import SalesContractApproval from '@/views/businessDocuments/components/SalesContract/components/Approval' // 销售合同审批单
    import StoragePutApproval from '@/views/businessDocuments/components/StoragePut/components/Approval' // 入库申请单
    import StorageOutApproval from '@/views/businessDocuments/components/StorageOut/components/Approval' // 出库申请单
    import StorageBackApproval from '@/views/businessDocuments/components/StorageBack/components/Approval' // 退库申请单
    import DeviceDamagedApproval from '@/views/businessDocuments/components/DeviceDamaged/components/Approval' // 报损申请单
    import DeviceExtendEarrantyApproval from '@/views/businessDocuments/components/DeviceExtendEarranty/components/Approval' // 设备延保申请单
    import DeviceAllocateApproval from '@/views/businessDocuments/components/DeviceAllocate/components/Approval' // 设备调拨申请单
    import ReturnCashApproval from '@/views/businessDocuments/components/ReturnCash/components/Approval' // 退还押金申请单
    import RenewSIMApproval from '@/views/businessDocuments/components/RenewSIM/components/Approval' // SIM卡续费申请单
    import DeviceInstallApproval from '@/views/businessDocuments/components/DeviceInstall/components/Approval' // 设备安装申请单
    import InvoiceApproval from '@/views/businessDocuments/components/Invoice/components/Approval' // 设备安装申请单
    import ServiceChargeRefundApproval from '@/views/businessDocuments/components/ServiceChargeRefund/components/Approval' // 服务费退款申请单
    export default {
        name: 'DetailDialog',
        components: {
            Device,
            Invoice,
            Project,
            Product,
            Contacts,
            Supplier,
            Sections,
            Customer,
            DeviceSim,
            SalesContract,
            materialTesting,
            PurchaseContract,
            TroubleTicket,
            SendRevised,
            CollectionRecord,
            PaymentRecord,
            ExpressBill,
            CarTroubleBill,
            DeviceInstall,
            DeviceInstallNew,
            MaintenanceBill,
            CloseingBill,
            ExpressRepairCar,
            InstallChargeBill,
            /**
             * 审批单详情
             */
            DemandApproval,
            SalesContractApproval,
            StoragePutApproval,
            StorageOutApproval,
            StorageBackApproval,
            DeviceDamagedApproval,
            ReturnCashApproval,
            RenewSIMApproval,
            DeviceAllocateApproval,
            DeviceInstallApproval,
            InvoiceApproval,
            DeviceExtendEarrantyApproval,
            ServiceChargeRefundApproval
        },
        props: {
            type: { type: String, default: '' },
            dataId: { type: [Number, String] },
            rowData: { type: Object },
            visible: { type: Boolean, default: false },
            extendParams: { type: Object, default: () => ({}) }
        },
        data() {
            return {
                interiorVisible: false
            }
        },
        watch: {
            visible: {
                immediate: true,
                handler(value) {
                    this.interiorVisible = value
                }
            }
        },
        methods: {
            handleVisibleChange(value) {
                this.$emit('update:visible', value)
            }
        }
    }
</script>

<style lang='scss' scoped>

</style>
