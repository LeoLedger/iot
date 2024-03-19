import enums from '@/utils/enum'

export default [
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
        label: 'SIM卡号',
        prop: 'sim',
        minWidth: 155,
        dbProp: 'c_sim',
        sortable: 'custom',
        isCopy: true
    },
    {
        label: '设备状态',
        prop: 'unitStatus',
        minWidth: 120,
        sortable: false,
        type: 'status',
        enums: enums.deviceStatus
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
    }
]
