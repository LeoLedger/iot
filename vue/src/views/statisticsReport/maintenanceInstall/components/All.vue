<!--
* @description  汇总
* @fileName index.vue
* @author 易超
!-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        @search="handleFilter"
    >
        <template slot="button">
            <!-- <el-button
                v-waves
                v-if="checkFeature(['ty.iot.xxx.export'])"
                size="mini"
                class="filter-button"
                type="warning"
                icon="el-icon-download"
                @click="handleExport"
            >导出</el-button> -->
        </template>
        <template slot="filter">
            <el-date-picker
                v-model="searchParam.monthStr"
                type="monthrange"
                format="yyyy-MM"
                value-format="yyyy-MM"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                clearable
                style="width: 300px"
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.supplierName"
                placeholder="供应商名称"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <DictSelect
                v-model="searchParam.productType"
                type="productType"
                placeholder="产品类型"
                clearable
                filterable
                size="mini"
                class="filter-item"
                style="width: 200px"
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
    </layout-filter>
</template>
<script>
    // 工具
    // API
    import maintenanceInstallApi from '@/api/statisticsReport/maintenanceInstall'
    // 组件

    export default {
        components: {
        },
        data() {
            return {
                searchParam: {
                    pageSize: 15,
                    pageIndex: 1
                },
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            label: '供应商',
                            prop: 'supplierName',
                            minWidth: 200,
                            isClick: true,
                            dialogType: 'supplier',
                            idKey: 'supplierId'
                        },
                        {
                            prop: 'monthStr',
                            label: '月份',
                            minWidth: 140
                        },
                        {
                            prop: 'count',
                            label: '数量',
                            minWidth: 100,
                            dbProp: 'c_count',
                            sortable: 'custom'
                        },
                        {
                            type: 'money',
                            prop: 'totalAmount',
                            label: '费用',
                            minWidth: 100,
                            dbProp: 'c_total_amount',
                            sortable: 'custom'
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    }
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
                var { data } = await maintenanceInstallApi.getCostSummary(this.searchParam)
                this.tableData.list = data.records
                this.tableData.total = data.total
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
                newStockApi.export(data)
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
