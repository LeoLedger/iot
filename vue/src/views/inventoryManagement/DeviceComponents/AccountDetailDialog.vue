<template>
    <el-dialog
        v-if="visible"
        :visible.sync="visible"
        :before-close="handleCancel"
        :close-on-click-modal="false"
        title="设备运营收入&成本结转记录"
        class=""
        width="1080px"
        append-to-body>
        <div class="layout-detail-container">
            <layout-filter
                :table-columns.sync="tableData.columns"
                :filter-model.sync="searchParam"
                @search="handleSearch"
            >
                <template slot="button">
                    <el-button
                        v-waves
                        v-prereclick
                        type="warning"
                        size="mini"
                        class="filter-item"
                        icon="el-icon-download"
                        @click="handleExport"
                    >导出</el-button>
                </template>
                <template slot="filter">
                    <el-date-picker
                        v-model="searchParam.carryOverTime"
                        :default-time="['00:00:00', '23:59:59']"
                        type="daterange"
                        format="yyyy-MM-dd"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        range-separator="至"
                        start-placeholder="结转开始日期"
                        end-placeholder="结转结束日期"
                        clearable
                        @change="handleSearch"
                    />
                </template>
                <template slot="filter-popup">
                    <layout-filter-item label="项目/成本中心">
                        <el-input
                            v-model="searchParam.projectName"
                            size="mini"
                            placeholder="项目/成本中心名称"
                            clearable
                            class="filter-item"
                        />
                    </layout-filter-item>
                    <layout-filter-item label="企业">
                        <el-input
                            v-model="searchParam.customerName"
                            size="mini"
                            placeholder="企业名称"
                            clearable
                            class="filter-item"
                        />
                    </layout-filter-item>
                    <layout-filter-item label="标段">
                        <el-input
                            v-model="searchParam.sectionName"
                            size="mini"
                            placeholder="标段名称"
                            clearable
                            class="filter-item"
                        />
                    </layout-filter-item>
                    <layout-filter-item label="结转类型">
                        <DictSelect
                            v-model="searchParam.accountDetailType"
                            type="accountDetailType"
                            placeholder="结转类型"
                            clearable
                            filterable
                            style="width: 100%"
                            size="mini"
                        />
                    </layout-filter-item>
                    <layout-filter-item label="费用类型">
                        <DictSelect
                            v-model="searchParam.feeType"
                            :exclude="[0]"
                            type="accountCostType"
                            placeholder="费用类型"
                            clearable
                            filterable
                            style="width: 100%"
                            size="mini"
                        />
                    </layout-filter-item>
                </template>
                <template slot="table">
                    <TableComponent
                        ref="TableComponentContacts"
                        v-bind="tableData"
                        :page-index.sync="searchParam.pageIndex"
                        :page-size.sync="searchParam.pageSize"
                        :list="tableData.list"
                        @refreshList="handleSearch"
                    />
                </template>
            </layout-filter>
        </div>
        <span slot="footer">
            <el-button size="mini" @click="$emit('update:visible', false)">取 消</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import mainApi from '@/api/businessAccounting/accountingDetail'
    import { getDayOfTheMonth } from '@/utils'

    export default {
        name: 'ReceiveDialog',
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            dataId: {
                type: String,
                default: null
            },
            extendParams: {
                type: Object,
                default: () => {}
            }
        },
        data() {
            return {
                tableData: {
                    list: [],
                    total: 0,
                    columns: [
                        {
                            label: '结转日期',
                            prop: 'carryOverTime',
                            width: 150,
                            type: 'date'
                        },
                        {
                            label: '结转类型',
                            prop: 'type',
                            width: 100,
                            type: 'dict',
                            dictType: 'accountDetailType'
                        },
                        {
                            label: '费用类型',
                            prop: 'feeType',
                            width: 100,
                            type: 'dict',
                            dictType: 'accountCostType'
                        },
                        {
                            label: '结转金额',
                            prop: 'amount',
                            digit: 4,
                            width: 100,
                            type: 'money'
                        },
                        {
                            label: '合同编号',
                            prop: 'contractCode',
                            minWidth: 100,
                            sortable: false
                        },
                        {
                            label: '项目/成本中心',
                            prop: 'projectName',
                            width: 200
                        },
                        {
                            label: '企业',
                            prop: 'customerName',
                            width: 200
                        },
                        {
                            label: '标段',
                            prop: 'sectionName',
                            width: 200
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    },
                    // 列操作按钮
                    operates: {
                        width: 120,
                        fixed: 'right',
                        show: false
                    }
                },
                searchParam: {
                    pageIndex: 1,
                    pageSize: 15,
                    carryOverTime: []
                }
            }
        },
        watch: {
            dataId() {
                this.getList()
            },
            'searchParam.pageSize'() {
                this.getList()
            },
            'searchParam.pageIndex'() {
                this.getList()
            }
        },
        mounted() {
            this.init()
        },
        methods: {
            /** 初始化 */
            init() {
                // 自动填充结转日期区间为近一个月
                this.searchParam.carryOverTime = [
                    getDayOfTheMonth('s', 0) + ' 00:00:00',
                    getDayOfTheMonth('e', 0) + ' 23:59:59'
                ]
                this.searchParam = { ...this.searchParam, ...this.extendParams }
                this.getList()
            },
            handleSearch(obj) {
                if (typeof obj === 'object') {
                    this.searchParam = Object.assign({}, this.searchParam, obj)
                    this.getList()
                } else {
                    if (this.searchParam.pageIndex !== 1) {
                        this.searchParam.pageIndex = 1
                    } else {
                        this.getList()
                    }
                }
            },
            handleExport() {
                const data = { ...this.searchParam }
                data.pageSize = this.tableData.total
                data.deviceId = this.dataId
                mainApi.export(data)
            },
            handleCancel() {
                this.$emit('close', false)
                this.$emit('update:visible', false)
            },
            async getList() {
                if (this.dataId) {
                    this.tableData.options.loading = true
                    // 设置筛选
                    const params = Object.assign({}, this.searchParam)
                    params.deviceId = this.dataId
                    const res = await mainApi.getList(params)
                    if (res.success) {
                        this.tableData.list = res.data.records
                        this.tableData.total = res.data.total
                    }
                    setTimeout(() => {
                        this.tableData.options.loading = false
                    }, 500)
                }
            }
        }
    }
</script>

<style scoped>

</style>
