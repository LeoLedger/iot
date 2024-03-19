<!--
* @description  故障登记
* @fileName index.vue
* @author 望浩然
!-->
<template>
    <layout-filter
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
            <DictSelect
                v-model="searchParam.isReadAll"
                type="isReadAll"
                placeholder="是否查看全部"
                filterable
                size="mini"
                style="width: 150px"
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.productCode"
                placeholder="产品编号"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-date-picker
                v-model="searchParam.queryTime"
                :default-time="['00:00:00', '23:59:59']"
                type="monthrange"
                format="yyyy-MM"
                value-format="yyyy-MM-dd HH:mm:ss"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                clearable
                style="width: 300px"
                class="filter-item"
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
        <ListConfigDialog
            v-if="listConfigDialog.visible"
            v-bind="listConfigDialog"
            :visible.sync="listConfigDialog.visible"
        />
    </layout-filter>
</template>
<script>
  // 工具
  // API
    import mainApi from '@/api/statisticsReport/afterSaleFault'
    // 组件

    export default {
        components: {
        },
        data() {
            const columnClick = (row) => {
                this.listConfigDialog = {
                    title: '故障设备详情',
                    method: mainApi.getDetails,
                    table: {
                        columns: [
                            // {
                            //     prop: 'billCode',
                            //     label: '单据编号',
                            //     minWidth: 120,
                            //     idKey: 'billId',
                            //     isClick: true,
                            //     dialogType: 'carTroubleBill'
                            // },
                            // {
                            //     prop: 'imei',
                            //     label: 'IMEI',
                            //     minWidth: 130
                            // },
                            {
                                prop: 'errorCode',
                                label: '代码',
                                minWidth: 120
                            },
                            {
                                prop: 'handlingWay',
                                label: '处理方式',
                                minWidth: 130
                            },
                            {
                                prop: 'month',
                                label: '创建时间',
                                minWidth: 130
                            },
                            {
                                prop: 'num',
                                label: '数量',
                                minWidth: 130
                            },
                            {
                                prop: 'productCode',
                                label: '产品编号',
                                minWidth: 130,
                                idKey: 'productId',
                                isClick: true,
                                dialogType: 'product'
                            }
                        ]
                    },
                    params: {
                        productCode: row.productCode,
                        productId: row.productId,
                        projectId: row.projectId,
                        supplierId: row.supplierId,
                        month: row.month,
                        isReadAll: this.searchParam.isReadAll
                    },
                    visible: true
                }
            }
            return {
                listConfigDialog: {
                    visible: false
                },
                searchParam: {
                    pageSize: 15,
                    pageIndex: 1,
                    queryTime: [],
                    isReadAll: 0
                },
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            minWidth: 120,
                            idKey: 'productId',
                            isClick: true,
                            dialogType: 'product'
                        },
                        {
                            prop: 'productName',
                            label: '产品名称',
                            minWidth: 120,
                            idKey: 'productId',
                            isClick: true,
                            dialogType: 'product'
                        },
                        {
                            prop: 'num',
                            label: '数量',
                            minWidth: 60,
                            isClick: true,
                            onClick: columnClick
                        },
                        // {
                        //     prop: 'month',
                        //     label: '月份',
                        //     minWidth: 60,
                        //     align: 'right'
                        // },
                        {
                            prop: 'projectName',
                            label: '项目',
                            minWidth: 120,
                            idKey: 'projectId',
                            isClick: true,
                            dialogType: 'project'
                        },
                        {
                            prop: 'sectionName',
                            label: '标段',
                            minWidth: 120,
                            idKey: 'sectionId',
                            isClick: true,
                            dialogType: 'sections'
                        }
                        // {
                        //     prop: 'supplierName',
                        //     label: '供应商',
                        //     minWidth: 120,
                        //     idKey: 'supplierId',
                        //     isClick: true,
                        //     dialogType: 'supplier'
                        // }
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
                var res = await mainApi.getList({
                    ...this.searchParam,
                    groupBySection: true
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
                var data = { ...this.searchParam, groupBySection: true }
                data.pageSize = this.tableData.total
                mainApi.export(data)
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
