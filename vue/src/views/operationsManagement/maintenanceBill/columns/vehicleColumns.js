export default {
    get: function() {
        var inputRender = (h, { row, column }) => {
            return (
                <el-input-number
                    value={row[column.prop]}
                    onInput={res => {
                        row[column.prop] = res
                        this.handleCostChange(column.prop)
                    }}
                    placeholder={column.label}
                    size='mini'
                    min={0}
                    controls-position='right'
                    style='width:100%;'
                />
            )
        }
        return [
            {
                prop: 'imei',
                label: 'IMEI',
                minWidth: 155
            },
            {
                prop: 'productCode',
                label: '产品编号',
                width: 100
            },
            {
                prop: 'projectName',
                label: '项目',
                minWidth: 220,
                idKey: 'projectId',
                isClick: true,
                dialogType: 'project'
            },
            {
                prop: 'customerName',
                label: '企业',
                minWidth: 190
            },
            {
                prop: 'sectionName',
                label: '标段',
                minWidth: 220,
                idKey: 'sectionId',
                isClick: true,
                dialogType: 'sections'
            },
            {
                type: 'money',
                prop: 'labourCost',
                label: '人工费（元）',
                width: 140
            },
            {
                type: 'money',
                prop: 'cost',
                label: '维修费用（元）',
                width: 140
            },
            {
                prop: 'companyBearCost',
                label: '公司承担费用',
                width: 140,
                render: this.isEdit && inputRender
            },
            {
                prop: 'enterpriseBearCost',
                label: '企业承担费用',
                width: 140,
                render: this.isEdit && inputRender
            }
        ]
    }
}
