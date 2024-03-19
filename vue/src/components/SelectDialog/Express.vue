<!--
* @description 选择快递单
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
                v-model="publicParam.expressCode"
                :disabled="lockedProps.includes('expressCode')"
                size="mini"
                placeholder="快递单号"
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
    import expressRepairApi from '@/api/operationsManagement/expressRepair'

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
                            label: '快递单号',
                            prop: 'expressCode',
                            minWidth: 155,
                            isClick: true,
                            dialogType: 'expressBill',
                            idKey: 'guidId'
                        },
                        {
                            label: '快递公司',
                            prop: 'expressId',
                            type: 'dict',
                            dictType: 'expressCompany',
                            width: 120
                        },
                        {
                            label: '快递费(元)',
                            prop: 'cost',
                            width: 120,
                            type: 'money',
                            sortable: 'custom',
                            dbProp: 'c_cost'
                        },
                        {
                            label: '业务类型',
                            type: 'dict',
                            dictType: 'expressBusinessType',
                            prop: 'businessType',
                            width: 150
                        },
                        {
                            label: '客户/供应商',
                            prop: 'objectName',
                            minWidth: 200
                        },
                        {
                            label: '创建人',
                            prop: 'userName',
                            width: 120
                        },
                        {
                            label: '创建日期',
                            prop: 'createTime',
                            type: 'date',
                            width: 120,
                            sortable: 'custom',
                            dbProp: 'c_create_time'
                        },
                        {
                            label: '备注',
                            prop: 'remark',
                            minWidth: 300
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
                        res = await expressRepairApi.getList(this.publicParam)
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
