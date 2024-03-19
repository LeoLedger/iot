import mixin from '../../mixin'
import store from '@/store'
export default {
    columns: [
        {
            label: '产品编号',
            prop: 'productCode',
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
            label: '包装箱编号',
            prop: 'packageCode',
            width: 150,
            dbProp: 'c_package_code',
            sortable: 'custom'
        },
        {
            label: 'SIM卡号',
            prop: 'sim',
            minWidth: 120,
            dbProp: 'c_sim',
            sortable: 'custom'
        },
        {
            label: '产品名称',
            prop: 'productName',
            minWidth: 200,
            sortable: false
        },
        {
            label: '产品类型',
            prop: 'productType',
            minWidth: 120,
            formatter: (params, formData) => {
                return (store.getters.getDict('productType').find(v => v.value === params[formData.prop]) || {}).label || '- -'
            }
        },
        {
            label: 'PSN',
            prop: 'psn',
            width: 120
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
            label: '供应商',
            prop: 'supplierName',
            minWidth: 200,
            sortable: false,
            isClick: true,
            dialogType: 'supplier',
            idKey: 'supplierId'
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
            label: '入库单号',
            prop: 'enterWarehouseCode',
            width: 140,
            isClick: true,
            dialogType: 'storagePutApproval',
            idKey: 'enterWarehouseId'
        },
        {
            label: '入库日期',
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
            label: '质保开始日期',
            prop: 'warrantyStartDate',
            width: 140,
            dbProp: 'c_warranty_start_date',
            sortable: 'custom',
            type: 'date'
        },
        {
            label: '质保截止日期',
            prop: 'warrantyEndDate',
            width: 140,
            dbProp: 'c_warranty_end_date',
            sortable: 'custom',
            type: 'date'
        },
        {
            label: '剩余保修期(天)',
            prop: 'warrantyPeriodDay',
            width: 120,
            dbProp: 'c_warranty_period_day',
            sortable: 'custom',
            align: 'right',
            formatter: (params, formData) => {
                return params[formData.prop] + '天'
            }
        },
        {
            label: '软件版本号',
            prop: 'appVersion',
            width: 140,
            sortable: false
        }
    ]
}
