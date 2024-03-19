import {contractSignStatusEnum, contractTypeEnum} from '@/utils/enum'

// 基础信息
export const basicForms = [
    {
        prop: 'code',
        label: '合同编号',
        isEdit: false
    },
    {
        prop: 'contractType',
        label: '合同类型',
        itemType: 'select',
        options: contractTypeEnum,
        isEdit: false
    }, {
        prop: 'customer',
        label: '客户',
        isEdit: false
    }, {
        prop: 'dateRange',
        label: '合同服务周期',
        itemType: 'daterange',
        startKey: 'startDate',
        endKey: 'endDate',
        isEdit: false
    }, {
        prop: 'amount',
        label: '合同总额（元）',
        isEdit: false
    }, {
        prop: 'salesName',
        label: '销售负责人',
        isEdit: false
    }, {
        prop: 'signStatus',
        label: '合同签订',
        itemType: 'radio',
        options: contractSignStatusEnum,
        isEdit: false,
        span: 24,
    }, {
        prop: 'contractContent',
        label: '合同内容',
        itemType: 'textarea',
        span: 24,
        isEdit: false,
    }, {
        prop: 'files',
        itemType: 'upload',
        label: '营业执照',
        span: 24,
        isEdit: false,
    }
]

export const receivedColumns = [
    {
        prop: 'gatheringDate',
        label: '收款日期',
    }, {
        prop: 'gatheringName',
        label: '收款人',
    }, {
        prop: 'gatheringAmount',
        label: '实收金额（元）',
    }, {
        prop: 'remarks',
        label: '备注说明',
        minWidth: 100,
    }
]
