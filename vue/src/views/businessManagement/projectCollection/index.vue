<!--
* @description  项目收款
* @fileName index.vue
* @author 望浩然
!-->
<template>
    <layout-template
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        :filter-button="checkFeature(['ty.iot.incomeAccounting.search'])"
        class="project"
        @search="handleFilter"
    >
        <template slot="button">
            <!-- <el-button
                v-waves
                v-if="checkFeature(['ty.iot.incomeAccounting.export'])"
                size="mini"
                class="filter-button"
                type="warning"
                icon="el-icon-download"
                @click="handleExport"
            >导出</el-button> -->
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
                v-model="searchParam.sectionName"
                placeholder="标段名称"
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
        </template>
        <template slot="filter-popup"/>
        <template slot="table">
            <TableComponent
                v-bind="tableData"
                :page-index.sync="searchParam.pageIndex"
                :page-size.sync="searchParam.pageSize"
                @refreshList="handleRefreshList"
            />
        </template>
    </layout-template>
</template>
<script>
  // 工具
    // API
    import projectCollectionApi from '@/api/businessManagement/projectCollection'
    // 组件
    export default {
        name: 'ProjectCollection',
        components: {

        },
        data() {
            return {
                searchParam: {
                    pageSize: 15,
                    pageIndex: 1
                },
                // accountDetailDialog
                // 核算详情窗口
                accountDetailDialog: {
                    visible: false,
                    dataId: null,
                    extendParams: {}
                },
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'projectName',
                            label: '项目名称',
                            minWidth: 155
                        },
                        {
                            label: '成本中心',
                            prop: 'costCenterName',
                            minWidth: 170
                        },
                        {
                            label: '客户名称',
                            prop: 'customerName',
                            minWidth: 170
                        },
                        {
                            label: '标段名称',
                            prop: 'sectionName',
                            minWidth: 170
                        },
                        {
                            prop: 'createTime',
                            label: '创建时间',
                            width: 120
                        },
                        {
                            prop: 'code',
                            label: '账单编号',
                            width: 100
                        },
                        {
                            type: 'dict',
                            dictType: 'costType',
                            label: '费用类型',
                            prop: 'costType',
                            width: 120
                        },
                        {
                            prop: 'approvalCode',
                            label: '关联单据',
                            minWidth: 155
                        },
                        // {
                        //     prop: 'xxxx',
                        //     label: '应收时间',
                        //     minWidth: 200
                        // },
                        {
                            prop: 'amountReceivable',
                            label: '应收金额',
                            minWidth: 200
                        },
                        {
                            prop: 'collectionTime',
                            label: '收款时间',
                            minWidth: 200
                        },
                        {
                            prop: 'amountReceived',
                            label: '已收款金额',
                            minWidth: 200
                        },
                        {
                            prop: 'amount',
                            label: '收款金额',
                            minWidth: 200
                        }
                        // {
                        //     prop: 'xxxx',
                        //     label: '剩余应收',
                        //     minWidth: 200
                        // },
                        // {
                        //     prop: 'xxxx',
                        //     label: '回款率',
                        //     minWidth: 200
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
                var res = await projectCollectionApi.getList({
                    ...this.searchParam
                })
                if (res.success) {
                    this.tableData.list = res.data.records
                    this.tableData.total = res.data.total
                }
                this.tableData.options.loading = false
            },
            // 核算详情
            showAccountDetail(row) {
                this.accountDetailDialog = {
                    visible: true,
                    dataId: row.guidId
                }
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
                projectCollectionApi.export(data)
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
