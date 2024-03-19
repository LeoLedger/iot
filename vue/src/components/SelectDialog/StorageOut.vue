<!--
* @description 选择出库申请单
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
                size="mini"
                placeholder="单号"
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
    import storageOutApi from '@/api/businessDocuments/storageOut'

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
                            label: '出库单号',
                            minWidth: 155,
                            disabled: true,
                            isClick: true,
                            dialogType: 'storageOutApproval'
                        },
                        {
                            prop: 'contractCode',
                            label: '合同编号',
                            minWidth: 155,
                            disabled: true,
                            idKey: 'contractId',
                            isClick: true,
                            dialogType: 'salesContract'
                        },
                        {
                            prop: 'contractName',
                            label: '合同名称',
                            minWidth: 200,
                            disabled: true
                        },
                        {
                            type: 'dict',
                            dictType: 'contractType',
                            prop: 'contractType',
                            label: '合同类型',
                            width: 100
                        },
                        {
                            prop: 'projectName',
                            label: '项目',
                            minWidth: 160,
                            idKey: 'projectId',
                            isClick: true,
                            dialogType: 'project'
                        },
                        {
                            prop: 'customerName',
                            label: '企业',
                            minWidth: 180
                        },
                        {
                            prop: 'sectionName',
                            label: '标段',
                            minWidth: 160,
                            idKey: 'sectionId',
                            isClick: true,
                            dialogType: 'sections'
                        },
                        {
                            prop: 'applyUserName',
                            label: '提交人',
                            width: 100
                        },
                        {
                            type: 'date',
                            prop: 'applyDate',
                            label: '提交时间',
                            width: 100
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
                    code: '',
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
                        res = await storageOutApi.getList(this.publicParam)
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
