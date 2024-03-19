import mixin from '../../mixin'
import store from '@/store'
import enums from '@/utils/enum'
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
            label: '所在项目',
            prop: 'projectName',
            minWidth: 200,
            sortable: false
        },
        {
            label: '所在标段',
            prop: 'sectionName',
            minWidth: 200,
            sortable: false
        },
        {
            label: '所在企业',
            prop: 'customerName',
            minWidth: 200,
            sortable: false
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
            label: '入库人',
            prop: 'enterWarehouseUserName',
            width: 140,
            sortable: false
        },
        {
            label: '出库时间',
            prop: 'outWarehouseTime',
            width: 140,
            dbProp: 'c_out_warehouse_time',
            sortable: 'custom',
            type: 'date'
        },
        {
            label: '出库单号',
            prop: 'outWarehouseCode',
            width: 140,
            dbProp: 'c_out_warehouse_code',
            sortable: 'custom',
            isClick: true,
            idKey: 'outWarehouseId',
            dialogType: ({ row }) => {
                switch (row.warehouseOutType) {
                case 2: return 'carTroubleBill'
                case 3: return 'troubleTicket'
                default: return 'storageOutApproval'
                }
            },
            extendParams: ({ row }) => {
                switch (row.warehouseOutType) {
                case 2:
                    return {}
                default:
                    return {
                        onlyShow: true
                    }
                }
            }
        },
        {
            label: '关联产品编号',
            prop: 'deviceProductCode',
            minWidth: 100,
            sortable: false
        },
        {
            label: 'IMEI',
            prop: 'imei',
            minWidth: 150,
            dbProp: 'c_imei',
            sortable: 'custom',
            isClick: true,
            dialogType: 'device',
            idKey: 'imei'
        },
        {
            label: '设备状态',
            prop: 'deviceUnitStatus',
            minWidth: 120,
            sortable: false,
            type: 'status',
            enums: enums.deviceStatus
        }
    ]
}
