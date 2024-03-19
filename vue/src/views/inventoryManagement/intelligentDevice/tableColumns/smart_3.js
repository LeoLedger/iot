import mixin from '../../mixin'
import store from '@/store'
import enums from '@/utils/enum'
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
            label: '备用项目',
            prop: 'standbyProjectName',
            minWidth: 200,
            isClick: true,
            dialogType: 'project',
            idKey: 'standbyProjectId',
            sortable: false
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
            label: '出库日期',
            prop: 'outWarehouseTime',
            width: 140,
            dbProp: 'c_out_warehouse_time',
            sortable: 'custom',
            type: 'date'
        },
        {
            label: '所在项目(回收前)',
            prop: 'projectName',
            minWidth: 200,
            isClick: true,
            dialogType: 'project',
            idKey: 'projectId',
            sortable: false
        },
        {
            label: '所在标段(回收前)',
            prop: 'sectionName',
            minWidth: 200,
            sortable: false,
            isClick: true,
            dialogType: 'sections',
            idKey: 'sectionId'
        },
        {
            label: '所在企业(回收前)',
            prop: 'customerName',
            minWidth: 200,
            sortable: false
        },
        {
            label: '使用时长(天)',
            prop: 'durationDay',
            minWidth: 200,
            sortable: false,
            align: 'right',
            formatter: (params, formData) => {
                return params[formData.prop] + '天'
            }
        },
        {
            label: '设备残值(元)',
            prop: 'unitResidual',
            minWidth: 200,
            sortable: false,
            align: 'right',
            type: 'money'
        },
        {
            label: '状态确认日期',
            prop: 'statusTime',
            minWidth: 200,
            sortable: false,
            type: 'date'
        },
        {
            label: '最后通信时间',
            prop: 'lastCommunTime',
            minWidth: 200,
            sortable: false,
            type: 'date',
            format: 'YYYY-MM-DD HH:mm:ss'
        },
        {
            label: '软件版本号',
            prop: 'appVersion',
            width: 140,
            sortable: false
        }
    ]
}
