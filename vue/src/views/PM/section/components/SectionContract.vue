<!--
* @description 标段合同列表
* @author yc
!-->
<template>
    <TableComponent
        v-if="!tableData.options.loading"
        v-bind="tableData"
        :list="tableData.list"
        empty-hide-table
    />
</template>

<script>
  // API
  // 方法
  // 组件

    import { getPriceFormat } from '@/utils'
    import moment from 'moment'
    import contractApi from '@/api/PM/contract'

    export default {
        components: {
        },
        props: {
            // 标段guid
            dataId: { type: String, default: null },
            isEdit: { type: Boolean, default: true }
        },
        data() {
            const that = this
            return {
                searchParam: {
                    pageSize: 50,
                    pageIndex: 1
                },
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'code',
                            label: '合同编号',
                            fixed: 'left',
                            disabled: true,
                            width: 120,
                            isClick: true,
                            dialogType: 'salesContract',
                            idKey: 'guidId'
                        },
                        {
                            prop: 'type',
                            label: '合同类型',
                            disabled: true,
                            width: 100,
                            formatter: (params, formData) => {
                                return (that.getDict('contractType').find(v => v.value === params[formData.prop]) || {}).label || '- -'
                            }
                        },
                        {
                            prop: 'amount',
                            label: '合同总金额（元）',
                            width: 150,
                            dbProp: 'c_amount',
                            align: 'right',
                            type: 'money'
                        },
                        {
                            prop: 'amountReceived',
                            label: '已收款(元)',
                            width: 100,
                            align: 'right',
                            type: 'money'
                        },
                        {
                            prop: 'amountReceivedRate',
                            label: '收款进度',
                            width: 100,
                            align: 'right'
                        },
                        {
                            prop: '_period',
                            label: '合同期限',
                            width: 180,
                            dbProp: 'c_end_date',
                            sortable: 'custom',
                            formatter: (params, formData) => {
                                if (params.startDate && params.endDate) {
                                    return `${moment(params.startDate).format('yyyy-MM-DD')} 至 ${moment(params.endDate).format('yyyy-MM-DD')}`
                                }
                                return '- -'
                            }
                        },
                        {
                            prop: 'signedDate',
                            label: '签订日期',
                            width: 120,
                            dbProp: 'signed_date',
                            sortable: 'custom',
                            formatter: (params, formData) => {
                                if (params[formData.prop]) {
                                    return moment(params[formData.prop]).format('YYYY-MM-DD')
                                }
                                return '- -'
                            }
                        }
                    ],
                    options: {
                        height: null,
                        maxHeight: null,
                        showPagination: false,
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        showSummary: true,
                        summaryMethod: this.handleSummary
                    }
                },
                summary: {
                    denominator: 0,
                    molecule: 0
                }
            }
        },
        computed: {
        },
        watch: {
            dataId: {
                immediate: true,
                handler(value) {
                    this.getList()
                }
            }
        },
        methods: {
            async getList() {
                if (this.dataId) {
                    this.tableData.list = []
                    this.tableData.options.loading = true
                    this.searchParam.sectionId = this.dataId
                    this.searchParam.approvalStatus = 3
                    var res = await contractApi.getList({ ...this.searchParam })
                    if (res.success) {
                        this.tableData.list = res.data.records
                        this.tableData.total = res.data.total
                    }
                    this.tableData.options.loading = false
                }
            },
            handleSummary({ columns, data }) {
                const sums = []
                columns.forEach((column, index) => {
                    if (index === 0) {
                        sums[index] = '合计'
                        return
                    }
                    if (index === 3 || index === 4) {
                        const values = data.map(item => Number(item[column.property]))
                        if (!values.every(value => isNaN(value))) {
                            sums[index] = values.reduce((prev, curr) => {
                                const value = Number(curr)
                                if (!isNaN(value)) {
                                    return prev + curr
                                } else {
                                    return prev
                                }
                            }, 0)
                            if (index === 3) this.summary.denominator = sums[index]
                            if (index === 4) this.summary.molecule = sums[index]
                            sums[index] = getPriceFormat(sums[index]) + ' 元'
                        } else {
                            sums[index] = '--'
                        }
                    }
                    if (index === 5) {
                        // 分母 - 总金额
                        const denominator = this.summary.denominator
                        // 分子 - 已收款
                        const molecule = this.summary.molecule
                        if (denominator) {
                            if (molecule) {
                                sums[index] = Math.round(molecule / denominator * 10000) / 100 + '%'
                            } else sums[index] = '0.00%'
                        } else sums[index] = '0.00%'
                    }
                })
                return sums
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
