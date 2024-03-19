import mixin from '../../mixin'
import store from '@/store'
export default {
    columns: [
        {
            label: 'SIM卡号',
            prop: 'sim',
            minWidth: 155,
            dbProp: 'c_sim',
            sortable: 'custom',
            isClick: true,
            dialogType: 'deviceSim',
            idKey: 'guidId',
            isCopy: true
        },
        {
            label: 'IMEI',
            prop: 'imei',
            minWidth: 120,
            dbProp: 'c_imei',
            sortable: 'custom',
            isClick: true,
            dialogType: 'device',
            idKey: 'imei'
        },
        {
            label: 'ICCID',
            prop: 'iccid',
            width: 200,
            dbProp: 'c_iccid',
            sortable: 'custom'
        },
        {
            label: '供应商',
            prop: 'supplierName',
            minWidth: 200,
            sortable: false,
            isClick: true,
            dialogType: 'supplier',
            idKey: 'supplierId'
        },
        {
            label: '产品编号',
            prop: 'productCode',
            minWidth: 100,
            sortable: false
        },
        {
            label: '产品名称',
            prop: 'productName',
            minWidth: 200,
            sortable: false
        },
        {
            label: '采购合同编号',
            prop: 'purchaseContractCode',
            minWidth: 120,
            sortable: false,
            isClick: true,
            dialogType: 'purchaseContract',
            idKey: 'purchaseContractId'
        },
        {
            label: '采购日期',
            prop: 'purchaseDate',
            width: 100,
            dbProp: 'c_purchase_date',
            sortable: 'custom',
            type: 'date'
        },
        {
            label: '采购成本(元)',
            prop: 'purchaseUnitPrice',
            width: 120,
            dbProp: 'c_purchase_unit_price',
            sortable: 'custom',
            align: 'right',
            type: 'money'
        },
        {
            label: '激活时间',
            prop: 'activate_time',
            width: 140,
            dbProp: 'c_activationary_time',
            sortable: 'custom',
            type: 'date'
        },
        {
            label: '到期时间',
            prop: 'dueDate',
            width: 140,
            dbProp: 'c_due_date',
            sortable: 'custom',
            type: 'date'
        },
        {
            label: '入库时间',
            prop: 'enterWarehouseTime',
            width: 140,
            dbProp: 'c_enter_warehouse_time',
            sortable: 'custom',
            type: 'date'
        },
        {
            label: '入库单号',
            prop: 'enterWarehouseCode',
            width: 140,
            sortable: false,
            isClick: true,
            dialogType: 'storagePutApproval',
            idKey: 'enterWarehouseId'
        },
        {
            label: '入库人',
            prop: 'enterWarehouseUserName',
            width: 140,
            sortable: false
        }
    ]
}
