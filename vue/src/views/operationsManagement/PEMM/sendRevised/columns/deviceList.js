
import sendRevisedApi from '@/api/operationsManagement/sendRevised'

export default {
    get: function(isEdit = false) {
        return [
            {
                prop: 'imei',
                label: 'IMEI',
                dbProp: 'c_imei',
                sortable: 'custom',
                width: 155,
                isClick: ({ row }) => row.imeiUnidentified !== 0,
                dialogType: 'device',
                idKey: 'deviceId'
            },
            {
                prop: 'productCode',
                label: '产品编号',
                width: 100
            },
            {
                type: 'dict',
                dictType: 'sendRevisedRepairStatus',
                prop: 'status',
                label: '维修状态',
                width: 120
            },
            {
                prop: 'code',
                label: '寄修单号',
                minWidth: 155,
                isClick: true,
                dialogType: 'sendRevised'
            },
            {
                prop: 'expressCode',
                label: '快递单号',
                minWidth: 155
            },
            {
                type: 'dict',
                dictType: 'expressCompany',
                prop: 'expressId',
                label: '快递公司',
                width: 100
            },
            {
                type: 'dict',
                dictType: 'sendRevisedType',
                prop: 'type',
                label: '寄修类型',
                width: 100
            },
            {
                prop: 'isRenovation',
                type: 'dict',
                dictType: 'isRenovation',
                label: '是否过保翻新',
                width: 100
            },
            {
                type: 'date',
                prop: 'renovationTime',
                label: '翻新完成时间',
                dbProp: 'c_renovation_time',
                sortable: 'custom',
                width: 120
            },
            {
                prop: 'faultCode',
                label: '故障单号',
                width: 140
            },
            {
                type: 'date',
                prop: 'createTime',
                label: '创建时间',
                dbProp: 'c_create_time',
                sortable: 'custom',
                width: 120
            },
            {
                prop: 'createUserName',
                label: '创建人',
                width: 80
            },
            {
                prop: 'projectName',
                label: '所属项目',
                width: 220,
                isClick: true,
                dialogType: 'project',
                idKey: 'projectId'
            },
            {
                prop: 'sectionName',
                label: '所属标段',
                width: 130,
                isClick: true,
                dialogType: 'sections',
                idKey: 'sectionId'
            },
            {
                prop: 'customerName',
                label: '所属企业',
                width: 180
            },
            {
                prop: 'ownerName',
                label: '持有人',
                width: 100
            },
            {
                prop: 'expressNo',
                label: '企业运单号',
                width: 120
            },
            {
                type: 'date',
                prop: 'arrivalDate',
                label: '收到日期',
                dbProp: 'c_arrival_date',
                sortable: 'custom',
                width: 100
            },
            {
                prop: 'enterpriseFeedback',
                label: '企业反馈异常',
                width: 160
            },
            {
                type: 'date',
                prop: 'lastRepairTime',
                label: '上次寄修时间',
                dbProp: 'c_last_repair_time',
                sortable: 'custom',
                width: 120
            },
            {
                type: 'dict',
                dictType: 'isSecondRepair',
                prop: 'secondRepair',
                label: '二次返修',
                width: 80
            },
            {
                prop: 'clientFeedback',
                label: '客服诊断结果',
                width: 160
            },
            {
                prop: 'replaceImei',
                label: '替换设备编号',
                dbProp: 'c_replace_imei',
                sortable: 'custom',
                width: 140
            },
            {
                type: 'dict',
                dictType: 'troubleReplaceType',
                prop: 'replaceType',
                label: '替换类型',
                width: 100
            },
            {
                type: 'date',
                prop: 'completeTime',
                label: '检测完成时间',
                dbProp: 'c_complete_time',
                sortable: 'custom',
                width: 120
            },
            {
                type: 'date',
                prop: 'repairTime',
                label: '寄修日期',
                dbProp: 'c_repair_time',
                sortable: 'custom',
                width: 120
            },
            {
                type: 'date',
                prop: 'maintainFeedbackTime',
                label: '维修反馈时间',
                dbProp: 'c_maintain_feedback_time',
                sortable: 'custom',
                width: 120
            },
            {
                prop: 'factoryFeedback',
                label: '厂家诊断结果',
                width: 120
            },
            {
                prop: 'factoryHandlingWay',
                label: '厂家处理方式',
                width: 200
            },
            {
                type: 'money',
                prop: 'totalCost',
                label: '维修费用（元）',
                dbProp: 'c_total_cost',
                sortable: 'custom',
                width: 130
            },
            {
                type: 'dict',
                dictType: 'isReplaceSim',
                prop: 'isReplaceCard',
                label: '是否有换卡',
                width: 100
            },
            {
                prop: 'replaceCardNumber',
                label: '更换SIM卡号',
                width: 120
            },
            {
                prop: 'verificationUserName',
                label: '核验人',
                width: 100
            },
            {
                type: 'date',
                prop: 'verificationTime',
                label: '核验时间',
                dbProp: 'c_verification_time',
                sortable: 'custom',
                width: 130
            },
            {
                type: 'dict',
                dictType: 'verifiableResult',
                prop: 'verificationResult',
                label: '核验结果',
                width: 120
            },
            {
                type: 'dict',
                dictType: 'sendRevisedDisposalWay',
                prop: 'verificationHandlingWay',
                label: '核验处理方式',
                width: 120
            },
            {
                type: 'money',
                prop: 'companyBearCost',
                label: '公司承担费用',
                dbProp: 'c_company_bear_cost',
                sortable: 'custom',
                width: 120
            },
            {
                type: 'money',
                prop: 'enterpriseBearCost',
                label: '企业承担费用',
                dbProp: 'c_enterprise_bearCost',
                sortable: 'custom',
                width: 120
            },
            {
                type: 'viewer',
                prop: 'fileNum',
                minWidth: 60,
                label: '附件',
                align: 'center',
                method: async({ row }) => {
                    this.tableData.options.loading = true
                    let res = await sendRevisedApi.getDeviceFiles({
                        guid: row.originGuidId
                    })
                    row.files = res.data
                    this.tableData.options.loading = false
                }
            }
        ]
    }
}
