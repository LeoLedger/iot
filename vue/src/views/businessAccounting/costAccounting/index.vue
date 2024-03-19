<!--
* @description  成本核算
* @fileName index.vue
* @author 望浩然
!-->
<template>
    <layout-template
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        :filter-button="checkFeature(['ty.iot.costAccounting.export'])"
        class="project"
        @search="handleFilter"
    >
        <template slot="button">
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.costAccounting.search'])"
                size="mini"
                class="filter-button"
                type="warning"
                icon="el-icon-download"
                @click="handleExport"
            >导出</el-button>
        </template>
        <template slot="filter">
            <el-input
                v-model="searchParam.code"
                placeholder="编号"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
        </template>
        <template slot="filter-popup">
            <layout-filter-item label="成本中心">
                <el-input
                    v-model="searchParam.projectName"
                    clearable
                    class="filter-item"
                    size="mini"
                    placeholder="成本中心"/>
            </layout-filter-item>
            <layout-filter-item label="标段">
                <RemoteSelect
                    v-model="searchParam.sectionId"
                    :method="sectionRemoteMethod"
                    label-key="name"
                    value-key="guidId"
                    filter-label-key="sectionName"
                    placeholder="选择标段"
                    clearable
                    class="filter-item"
                />
            </layout-filter-item>
            <layout-filter-item label="企业">
                <RemoteSelect
                    v-model="searchParam.customerId"
                    :method="customerRemoteMethod"
                    label-key="name"
                    value-key="guidId"
                    filter-label-key="name"
                    placeholder="选择企业"
                    clearable
                    class="filter-item"
                />
            </layout-filter-item>
            <layout-filter-item label="费用类型">
                <DictSelect
                    v-model="searchParam.costType"
                    :exclude="[1,2,3,5,10]"
                    type="accountCostType"
                    placeholder="费用类型"
                    clearable
                    filterable
                    class="filter-item"
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="结转时间">
                <el-date-picker
                    v-model="searchParam.carryOverTime"
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
            <layout-filter-item label="关联单据">
                <el-input
                    v-model="searchParam.billCode"
                    clearable
                    class="filter-item"
                    size="mini"
                    placeholder="关联单据"/>
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
        <!-- 详情弹窗 -->
        <PublicDetailDialog
            v-if="dialogVisible"
            v-bind="dialogData"
            :visible.sync="dialogVisible"
        />
        <!-- 详情弹窗 -->
        <AccountDetailDialog
            v-if="accountDetailDialog.visible"
            :data-id="accountDetailDialog.dataId"
            :extend-params="accountDetailDialog.extendParams"
            :visible.sync="accountDetailDialog.visible"
        />
    </layout-template>
</template>
<script>
  // 工具
    // API
    import accountingCostApi from '@/api/businessAccounting/accountingCost'
    import customerApi from '@/api/PM/customer'
    import sectionApi from '@/api/PM/section'
    import enums from '@/utils/enum'
    // 组件
    import AccountDetailDialog from '@/views/businessAccounting/costAccounting/components/AccountDetailDialog'
    export default {
        components: {
            AccountDetailDialog
        },
        data() {
            return {
                customerRemoteMethod: customerApi.getList,
                sectionRemoteMethod: sectionApi.getList,
                searchParam: {
                    productCode: '',
                    pageSize: 15,
                    pageIndex: 1
                },
                // 详情窗口
                dialogData: {},
                dialogVisible: false,
                // 核算详情窗口
                accountDetailDialog: {
                    visible: false,
                    dataId: null
                },
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'code',
                            label: '编号',
                            width: 140
                        },
                        {
                            label: '成本中心',
                            prop: 'projectName',
                            minWidth: 170
                        },
                        {
                            label: '企业',
                            prop: 'customerName',
                            minWidth: 170
                        },
                        {
                            label: '标段',
                            prop: 'sectionName',
                            minWidth: 170,
                            isClick: true,
                            dialogType: 'sections',
                            idKey: 'sectionId'
                        },
                        {
                            type: 'dict',
                            dictType: 'accountCostType',
                            prop: 'costType',
                            label: '费用类型',
                            width: 120,
                            disabled: true
                        },
                        {
                            prop: 'amount',
                            label: '核算金额',
                            width: 100,
                            type: 'money',
                            digit: 4,
                            sortable: 'custom',
                            dbProp: 'tac.c_amount',
                            isClick: true,
                            onClick: ($event) => this.showAccountDetail($event)
                        },
                        {
                            type: 'date',
                            prop: 'carryOverTime',
                            label: '结转时间',
                            width: 150,
                            format: 'YYYY-MM-DD HH:mm:ss',
                            sortable: 'custom',
                            dbProp: 'tac.c_carry_over_time'
                        },
                        {
                            prop: 'billCode',
                            label: '关联单据',
                            minWidth: 155,
                            disabled: true,
                            idKey: 'billId',
                            isClick: ({ row }) => enums.accountBillType.findIndex(v => v.value === row.billType) > -1,
                            dialogType: ({ row }) => enums.accountBillType.find(v => v.value === row.billType).dialogType
                        },
                        {
                            prop: 'description',
                            label: '结转说明',
                            minWidth: 200
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
                var res = await accountingCostApi.getList({
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
                accountingCostApi.export(data)
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
