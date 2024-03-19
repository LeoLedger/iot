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
        label: '产品类型',
        prop: 'productType',
        minWidth: 120,
        type: 'dict',
        dictType: 'productType'
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
        label: '批次',
        prop: 'batchCode',
        minWidth: 180
    },
    {
        label: '出库数量',
        prop: 'num',
        minWidth: 120,
        align: 'right'
    },
    {
        label: '库存总价',
        prop: 'totalPrice',
        width: 120,
        dbProp: 'c_total_price',
        sortable: 'custom',
        align: 'right',
        type: 'money'
    }
]
