<!--
* @description 选择寄修单
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
                placeholder="寄修单号"
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
    // API
    import sendRevisedApi from '@/api/operationsManagement/sendRevised'

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
                            label: '寄修单号',
                            fixed: 'left',
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
                            type: 'money',
                            prop: 'cost',
                            label: '快递费（元）',
                            width: 100,
                            dbProp: 'c_cost',
                            sortable: 'custom'
                        },
                        {
                            type: 'dict',
                            dictType: 'sendRevisedType',
                            prop: 'type',
                            label: '寄修类型',
                            width: 100
                        },
                        {
                            type: 'dict',
                            dictType: 'sendRevisedStatus',
                            prop: 'status',
                            label: '单据状态',
                            width: 180
                        },
                        {
                            prop: 'supplierName',
                            label: '供应商',
                            width: 220
                        },
                        {
                            prop: 'count',
                            label: '设备数量',
                            width: 100,
                            dbProp: 'c_count',
                            sortable: 'custom'
                        },
                        {
                            prop: 'createUserName',
                            label: '创建人',
                            width: 100
                        },
                        {
                            type: 'date',
                            prop: 'createTime',
                            label: '创建日期',
                            width: 140,
                            dbProp: 'c_create_time',
                            sortable: 'custom'
                        },
                        {
                            prop: 'remark',
                            label: '备注',
                            width: 300
                        }
                    ]
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
                        res = await sendRevisedApi.getList(this.publicParam)
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
