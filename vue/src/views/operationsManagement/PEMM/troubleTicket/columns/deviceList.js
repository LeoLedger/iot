export default [
    {
        prop: 'imei',
        label: 'IMEI',
        sortable: 'custom',
        width: 155,
        isClick: ({ row }) => row.deviceId,
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
        dictType: 'troubleBillsHandlingWay',
        prop: 'handlingWay',
        label: '处理方式',
        width: 100
    },
    {
        type: 'dict',
        dictType: 'troubleBillsRepairStatus',
        prop: 'status',
        label: '维修状态',
        width: 100
    },
    {
        prop: 'code',
        label: '故障单号',
        width: 155,
        isClick: true,
        dialogType: 'troubleTicket',
        idKey: 'faultId'
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
        type: 'date',
        prop: 'regisTime',
        label: '创建时间',
        dbProp: 'c_regis_time',
        sortable: 'custom',
        width: 100
    },
    {
        prop: 'regisUserName',
        label: '创建人',
        width: 80
    },
    {
        prop: 'projectName',
        label: '所属项目',
        minWidth: 180,
        isClick: true,
        idKey: 'projectId',
        dialogType: 'project'
    },
    {
        prop: 'sectionName',
        label: '所属标段',
        minWidth: 180,
        idKey: 'sectionId',
        isClick: true,
        dialogType: 'sections'
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
        prop: 'replaceUnitImei',
        label: '替换设备编号',
        width: 155,
        isClick: ({ row }) => row.replaceDeviceId,
        dialogType: 'device',
        idKey: 'replaceDeviceId'
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
        prop: 'replaceTime',
        label: '替换时间',
        width: 140,
        dbProp: 'c_replace_time',
        sortable: 'custom'
    },
    {
        type: 'date',
        prop: 'completeTime',
        label: '处理完成时间',
        width: 140,
        dbProp: 'c_complete_time',
        sortable: 'custom'
    },
    {
        prop: 'expressCode',
        label: '寄出替换设备快递单号',
        width: 160,
        isClick: ({ row }) => row.expressRepairId,
        dialogType: 'expressBill',
        idKey: 'expressRepairId'
    },
    {
        type: 'dict',
        dictType: 'expressCompany',
        prop: 'expressId',
        label: '快递公司',
        width: 120
    },
    {
        prop: 'sendUserName',
        label: '寄件人',
        width: 100
    },
    {
        type: 'date',
        prop: 'sendTime',
        label: '寄件时间',
        width: 120,
        dbProp: 'c_send_time',
        sortable: 'custom'
    }
]
