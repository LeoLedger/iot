<!--
* @description  应付账款
* @fileName index.vue
* @author 易超
!-->
<template>
    <layout-template
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        @search="handleFilter"
    >
        <template slot="button">
            <el-button
                v-waves
                size="mini"
                class="filter-button"
                type="warning"
                icon="el-icon-download"
                @click="handleExport"
            >导出</el-button>
        </template>
        <template slot="filter">
            <el-input
                v-model="searchParam.projectName"
                placeholder="项目名称"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.customerName"
                placeholder="客户名称"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.sectionName"
                placeholder="标段名称"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <DictSelect
                v-model="searchParam.costType"
                type="costType"
                placeholder="业务类型"
                clearable
                filterable
                size="mini"
                class="filter-item"
                style="width: 200px"
                @change="handleFilter"
            />
            <el-date-picker
                v-model="searchParam.dateList"
                :default-time="['00:00:00', '23:59:59']"
                type="daterange"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd HH:mm:ss"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                clearable
                class="filter-item"
                style="width: 260px"
                @change="handleFilter"
            />
        </template>
        <template slot="table">
            <TableComponent
                v-bind="tableData"
                :page-index.sync="searchParam.pageIndex"
                :page-size.sync="searchParam.pageSize"
                @refreshList="handleRefreshList"
            />
        </template>
        <div>
            <SelectDialog
                v-if="selectDialog.visible"
                v-bind="selectDialog"
                :visible.sync="selectDialog.visible"
            />
        </div>
    </layout-template>
</template>
<script>
    // 工具
    // API
    import accountReceivableApi from '@/api/statisticsReport/accountReceivable'
    // 组件

    export default {
        components: {
        },
        data() {
            return {
                dataList: [],
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'projectName',
                            label: '项目名称',
                            minWidth: 120,
                            idKey: 'projectId',
                            isClick: true,
                            dialogType: 'product'
                        },
                        {
                            prop: 'customerName',
                            label: '客户名称',
                            minWidth: 200,
                            isClick: true,
                            idKey: 'customerId',
                            dialogType: 'customer'
                        },
                        {
                            prop: 'sectionName',
                            label: '标段名称',
                            minWidth: 200,
                            idKey: 'sectionId',
                            isClick: true,
                            dialogType: 'sections'
                        },
                        {
                            type: 'dict',
                            dictType: 'costType',
                            prop: 'costType',
                            label: '业务类型',
                            minWidth: 130
                        },
                        {
                            type: 'money',
                            prop: 'lastRemain',
                            label: '期初余额',
                            minWidth: 100
                        },
                        {
                            label: '本期发生额（元）',
                            align: 'center',
                            children: [
                                {
                                    type: 'money',
                                    prop: 'thisTotal',
                                    label: '应收金额',
                                    minWidth: 100
                                },
                                {
                                    type: 'money',
                                    prop: 'thisCost',
                                    label: '实收金额',
                                    minWidth: 100
                                }
                            ]
                        },
                        {
                            type: 'money',
                            prop: 'balance',
                            label: '余额',
                            minWidth: 100
                        },
                        {
                            prop: '_status',
                            label: '核销情况',
                            minWidth: 100
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    }
                },
                searchParam: {
                    pageSize: 15,
                    pageIndex: 1
                },
                selectDialog: {
                    visible: false
                }
            }
        },
        computed: {
        },
        watch: {
            'searchParam.pageSize'() {
                this.getList()
            },
            'searchParam.pageIndex'() {
                this.getList()
            }
        },
        mounted() {
            this.getList()
        },
        methods: {
            // 请求列表数据
            async getList() {
                this.tableData.options.loading = true
                var res = await accountReceivableApi.getList({
                    ...this.searchParam
                })
                this.tableData.list = res.data.records.map(item => {
                    item._status = item.thisCost > 0 ? '是' : '否'
                    return item
                })
                this.tableData.total = res.data.total
                this.tableData.options.loading = false
            },
            // 筛选列表
            handleFilter() {
                if (this.searchParam.pageIndex !== 1) {
                    this.searchParam.pageIndex = 1
                } else {
                    this.getList()
                }
            },
            // 点击导出按钮时触发
            handleExport() {
                var data = { ...this.searchParam }
                data.pageSize = this.tableData.total
                accountReceivableApi.export(data)
            },
            // 点击排序时触发
            handleRefreshList(obj) {
                this.searchParam = Object.assign({}, this.searchParam, obj)
                this.getList()
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
