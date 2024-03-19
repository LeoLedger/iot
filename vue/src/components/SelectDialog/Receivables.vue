<!--
* @description 选择收款认领信息
* @author yc
!-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="publicParam"
        @search="handleFilter"
    >
        <template slot="filter">
            <el-input
                v-model="publicParam.code"
                :disabled="lockedProps.includes('code')"
                clearable
                class="filter-item"
                size="mini"
                placeholder="账单编号"
                @change="handleFilter"
            />
            <el-input
                v-model="publicParam.approvalCode"
                :disabled="lockedProps.includes('approvalCode')"
                clearable
                class="filter-item"
                size="mini"
                placeholder="关联单据"
                @change="handleFilter"
            />
        </template>
        <template slot="table">
            <TableComponent
                ref="TableComponent"
                v-bind="tableData"
                :options="tableOptions"
                :selected-list="selectList"
                :page-index.sync="publicParam.pageIndex"
                :page-size.sync="publicParam.pageSize"
                @refreshList="handleRefreshList"
                @handleCurrentChange="handleCurrentChange"
                @handleSelectionChange="handleSelectionChange"
                @not-selected-click="handleNotSelectedClick"
            />
        </template>
    </layout-filter>
</template>

<script>
    import mixin from './mixin'
    // 方法
    import enums from '@/utils/enum'
    // API
    import billReceivableApi from '@/api/businessDocuments/billReceivable'

    export default {
        name: 'Receivables',
        components: {
        },
        mixins: [mixin],
        data() {
            return {
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            label: '账单编号',
                            prop: 'code',
                            minWidth: 120
                        },
                        {
                            label: '关联单据',
                            prop: 'approvalCode',
                            width: 200,
                            idKey: ({ row }) => row.costType === 5 ? 'approvalIds' : 'approvalId',
                            isClick: true,
                            dialogType: ({ row }) => {
                                return (enums.costType.find(v => v.value === row.costType) || {}).dialogType
                            }
                        },
                        {
                            label: '项目',
                            prop: 'projectName',
                            minWidth: 200
                        },
                        {
                            label: '标段',
                            prop: 'sectionName',
                            minWidth: 200,
                            isClick: true,
                            dialogType: 'sections',
                            idKey: 'sectionId'
                        },
                        {
                            type: 'dict',
                            dictType: 'costType',
                            label: '费用类型',
                            prop: 'costType',
                            width: 120
                        },
                        {
                            label: '应收金额(元)',
                            prop: 'amountReceivable',
                            dbProp: 'c_amount_receivable',
                            width: 150,
                            sortable: 'custom',
                            align: 'right',
                            type: 'money'
                        },
                        {
                            type: 'money',
                            label: '已开票',
                            prop: 'amountInvoiced',
                            dbProp: 'c_amount_invoiced',
                            width: 120,
                            sortable: 'custom'
                        },
                        {
                            type: 'money',
                            label: '可开票',
                            prop: 'amountUninvoice',
                            dbProp: 'c_amount_uninvoice',
                            width: 120,
                            sortable: 'custom'
                        },
                        {
                            label: '生成日期',
                            prop: 'createTime',
                            dbProp: 'c_create_time',
                            width: 150,
                            type: 'date'
                        }
                    ],
                    // 列操作按钮
                    operates: {
                        width: 100,
                        fixed: 'right'
                    }
                },
                defaultParam: {
                    pageSize: 15,
                    pageIndex: 1
                }
            }
        },
        computed: {
        },
        methods: {
            // 请求列表数据
            async getList() {
                this.loading = true
                try {
                    var res
                    if (this.customRequest) {
                        res = await this.customRequest(this.publicParam)
                    } else {
                        res = await billReceivableApi.getList(this.publicParam)
                    }
                    this.tableData.list = res.data.records
                    this.tableData.total = res.data.total
                    this.updateSelect()
                } catch (err) {}
                this.loading = false
            }
        }
    }
</script>

<style lang='scss' scoped>

</style>
