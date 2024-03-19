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
                v-model="publicParam.receivableCode"
                :disabled="lockedProps.includes('receivableCode')"
                size="mini"
                placeholder="账单编号"
                clearable
                class="filter-item"
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
    import claimApi from '@/api/businessDocuments/billReceivableRecordClaim'

    export default {
        name: 'MoneyClaim',
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
                            prop: 'receivableCode',
                            minWidth: 155
                        },
                        {
                            label: '收款流水号',
                            prop: 'receivableRecordCode',
                            minWidth: 150,
                            isClick: true,
                            dialogType: 'collectionRecord',
                            idKey: 'receivableRecordId'
                        },
                        {
                            label: '合同编号',
                            prop: 'approvalCode',
                            idKey: 'approvalId',
                            minWidth: 130,
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
                            label: '客户',
                            prop: 'sectionName',
                            minWidth: 200
                        },
                        {
                            label: '标段',
                            prop: 'sectionName',
                            minWidth: 180,
                            isClick: true,
                            dialogType: 'sections',
                            idKey: 'sectionGuid'
                        },
                        {
                            label: '费用类型',
                            prop: 'costType',
                            width: 120,
                            type: 'dict',
                            dictType: 'costType'
                        },
                        {
                            label: '认领金额(元)',
                            prop: 'amount',
                            width: 120,
                            align: 'right',
                            type: 'money'
                        },
                        {
                            label: '状态',
                            prop: 'invoiceType',
                            type: 'status',
                            style: 'dot',
                            enums: enums.invoiceStatus,
                            width: 100,
                            isClick: true,
                            sortable: 'custom'
                        },
                        {
                            label: '认领人',
                            prop: 'userName',
                            width: 100
                        },
                        {
                            label: '操作日期',
                            prop: 'createTime',
                            width: 120,
                            type: 'date'
                        },
                        {
                            label: '备注',
                            prop: 'remark',
                            width: 300
                        }
                    ],
                    // 列操作按钮
                    operates: {
                        width: 100,
                        fixed: 'right'
                    }
                },
                defaultParam: {
                    receivableCode: '',
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
                        res = await claimApi.getList(this.publicParam)
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
