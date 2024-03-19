<!--
* @description 选择维修单
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
                placeholder="维修单号"
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
    import troubleTicketApi from '@/api/operationsManagement/troubleTicket'
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
                            label: '故障单号',
                            fixed: 'left',
                            minWidth: 155,
                            isClick: true,
                            dialogType: 'troubleTicket'
                        },
                        {
                            fixed: 'right',
                            prop: 'status',
                            type: 'status',
                            enums: enums.troubleBillsStatus,
                            label: '状态',
                            width: 85
                        },
                        {
                            prop: 'projectName',
                            label: '所属项目',
                            minWidth: 240
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
                            prop: 'customerName',
                            label: '企业',
                            minWidth: 180
                        },
                        {
                            prop: 'count',
                            label: '报修数量',
                            width: 100,
                            dbProp: 'c_count',
                            sortable: 'custom'
                        },
                        {
                            prop: 'handleCount',
                            label: '已处理',
                            width: 100,
                            dbProp: 'c_handle_count',
                            sortable: 'custom'
                        },
                        {
                            prop: 'replaceCount',
                            label: '替换数量',
                            width: 100,
                            dbProp: 'c_replace_count',
                            sortable: 'custom'
                        },
                        {
                            prop: 'regisUserName',
                            label: '登记人',
                            width: 80
                        },
                        {
                            type: 'date',
                            prop: 'regisTime',
                            label: '登记时间',
                            width: 140,
                            dbProp: 'c_regis_time',
                            sortable: 'custom'
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
                    this.publicParam.type = 1
                    if (this.customRequest) {
                        res = await this.customRequest(this.publicParam)
                    } else {
                        res = await troubleTicketApi.getList(this.publicParam)
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
