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
            label: '批次',
            prop: 'batchCode',
            minWidth: 180
        },
        {
            label: '库存数量',
            prop: 'num',
            minWidth: 100
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
            label: '库存总价',
            prop: 'totalPrice',
            width: 120,
            dbProp: 'c_total_price',
            sortable: 'custom',
            align: 'right',
            type: 'money'
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
