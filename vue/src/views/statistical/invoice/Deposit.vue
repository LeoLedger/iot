<!--
* @description  发票
* @fileName index.vue
* @author 易超
!-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        :filter-button="checkFeature(['ty.iot.statistical.invoice.search'])"
        class="project"
        @search="handleFilter"
    >
        <template slot="button">
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.statistical.invoice.export'])"
                size="mini"
                class="filter-button"
                type="warning"
                icon="el-icon-download"
                @click="handleExport"
            >导出</el-button>
        </template>
        <template slot="filter">
            <el-input
                v-model="searchParam.customerName"
                placeholder="客户名称"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.number"
                placeholder="押金条编号"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
        </template>
        <template slot="filter-popup">
            <layout-filter-item label="开票日期">
                <el-date-picker
                    v-model="searchParam.invoiceDate"
                    :default-time="['00:00:00', '23:59:59']"
                    type="daterange"
                    format="yyyy-MM-dd"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    clearable
                />
            </layout-filter-item>
        </template>
        <template slot="table">
            <TableComponent
                v-bind="tableData"
                :page-index.sync="searchParam.pageIndex"
                :page-size.sync="searchParam.pageSize"
                @refreshList="handleRefreshList"
            />
        </template>
    </layout-filter>
</template>
<script>
    // 工具
    // API
    import invoiceApi from '@/api/statistical/invoice'
    // 组件

    export default {
        components: {
        },
        data() {
            return {
                searchParam: {
                    type: 'deposit',
                    pageSize: 15,
                    pageIndex: 1
                },
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'code',
                            label: '押金条编号',
                            width: 140,
                            isClick: true,
                            disabled: true,
                            dialogType: 'invoice',
                            extendParams: (data) => {
                                return {
                                    type: data.type
                                }
                            }
                        },
                        {
                            type: 'dict',
                            dictType: 'invoiceType',
                            prop: 'type',
                            label: '票据类型',
                            width: 140
                        },
                        {
                            prop: 'customerName',
                            label: '客户名称',
                            minWidth: 200
                        },
                        {
                            type: 'date',
                            prop: 'invoiceDate',
                            label: '开票日期',
                            width: 120
                        },
                        {
                            type: 'money',
                            prop: 'amount',
                            label: '合计金额',
                            width: 160,
                            dbProp: 'c_amount',
                            sortable: 'custom'
                        },
                        {
                            prop: 'remark',
                            label: '备注',
                            minWidth: 300
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    }
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
                var res = await invoiceApi.getList({
                    ...this.searchParam
                })
                this.tableData.list = res.data.records
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
                invoiceApi.export(data)
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
