<!--
* @description 选择发票
* @author yc
!-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="publicParam"
        @search="handleFilter"
    >
        <template slot="filter">
            <el-date-picker
                v-model="publicParam.applyDate"
                :default-time="['00:00:00', '23:59:59']"
                type="daterange"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd HH:mm:ss"
                range-separator="至"
                start-placeholder="提交开始日期"
                end-placeholder="提交结束日期"
                clearable
                style="width: 300px"
                class="filter-item"
            />
            <el-input
                v-model="publicParam.code"
                placeholder="单号"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
        </template>
        <template slot="filter-popup">
            <layout-filter-item label="客户名称">
                <el-input
                    v-model="publicParam.customerName"
                    size="mini"
                    placeholder="客户名称"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="发票类型">
                <DictSelect
                    v-model="publicParam.invoiceType"
                    type="invoiceType"
                    placeholder="发票类型"
                    clearable
                    filterable
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="合并开票">
                <DictSelect
                    v-model="publicParam.isMerge"
                    type="isMergeInvoice"
                    placeholder="合并开票"
                    clearable
                    filterable
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="提交人">
                <el-input
                    v-model="publicParam.applyUserName"
                    size="mini"
                    placeholder="提交人"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="单据状态">
                <DictSelect
                    v-model="publicParam.approvalStatus"
                    :exclude="[4]"
                    type="documentStatus"
                    placeholder="单据状态"
                    clearable
                    filterable
                    size="mini"
                />
            </layout-filter-item>
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
    // API
    import invoiceApi from '@/api/businessDocuments/invoice'
    import enums from '@/utils/enum'

    export default {
        name: 'People',
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
                            prop: 'code',
                            label: '申请单号',
                            minWidth: 155,
                            disabled: true,
                            isClick: true,
                            dialogType: 'invoiceApproval',
                            idKey: 'guidId'
                        },
                        {
                            prop: 'customerName',
                            label: '客户',
                            minWidth: 200
                        },
                        {
                            type: 'dict',
                            dictType: 'invoiceType',
                            prop: 'invoiceType',
                            label: '申请发票类型',
                            width: 150
                        },
                        {
                            type: 'dict',
                            dictType: 'isMergeInvoice',
                            prop: 'isMerge',
                            label: '合并开票',
                            width: 100
                        },
                        {
                            type: 'money',
                            prop: 'invoiceAmount',
                            label: '申请开票金额',
                            width: 140,
                            dbProp: 'c_invoice_amount',
                            sortable: 'custom'
                        },
                        {
                            prop: 'applyUserName',
                            label: '提交人',
                            width: 110
                        },
                        {
                            type: 'date',
                            prop: 'applyDate',
                            label: '提交时间',
                            width: 110,
                            dbProp: 'c_apply_date',
                            sortable: 'custom'
                        },
                        {
                            fixed: 'right',
                            prop: 'approvalStatus',
                            type: 'status',
                            enums: enums.documentStatus,
                            label: '状态',
                            width: 85
                        }
                    ]
                },
                defaultParam: {
                    pageSize: 15,
                    pageIndex: 1,
                    code: '',
                    isMerge: '',
                    invoiceType: '',
                    customerName: '',
                    applyDate: [],
                    applyUserName: ''
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
                        res = await invoiceApi.getList(this.publicParam)
                    }
                    this.tableData.list = res.data.records
                    this.tableData.total = res.data.total
                    this.updateSelect()
                } catch (err) {
                    console.log(err)
                }
                this.loading = false
            }
        }
    }
</script>

<style lang='scss' scoped>

</style>
