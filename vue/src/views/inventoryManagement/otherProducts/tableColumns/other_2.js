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
        },
        {
            label: '项目',
            prop: 'projectName',
            minWidth: 200,
            sortable: false
        },
        {
            label: '标段',
            prop: 'sectionName',
            minWidth: 200,
            sortable: false
        },
        {
            label: '企业',
            prop: 'customerName',
            minWidth: 200,
            sortable: false
        },
        {
            label: '出库单号',
            prop: 'outWarehouseCode',
            width: 140,
            sortable: false,
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
            label: '出库时间',
            prop: 'outWarehouseTime',
            width: 140,
            dbProp: 'c_out_warehouse_time',
            sortable: 'custom',
            type: 'date'
        },
        {
            label: '出库人',
            prop: 'applyUserName',
            minWidth: 100,
            sortable: false
        }
    ]
}
