<!--
* @description 安装费结算
* @author yc
!-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        :filter-button="checkFeature(['ty.iot.installChargeBill.search'])"
        class="container"
        @search="handleFilter"
    >
        <template slot="button">
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.installChargeBill.export'])"
                size="mini"
                class="filter-button"
                type="warning"
                icon="el-icon-download"
                @click="handleExport"
            >导出</el-button>
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.installChargeBill.create'])"
                size="mini"
                class="filter-button"
                type="success"
                icon="el-icon-plus"
                @click="handleUpdate()"
            >新增</el-button>
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
            <DictSelect
                v-model="searchParam.feeStatus"
                type="deviceInstallChargeStatus"
                placeholder="状态"
                clearable
                filterable
                size="mini"
                style="width: 200px"
                class="filter-item"
                @change="handleFilter"
            />
        </template>
        <template slot="filter-popup">
            <layout-filter-item label="确认人">
                <el-input
                    v-model="searchParam.feeConfirmUserName"
                    placeholder="确认人"
                    size="mini"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="确认时间">
                <el-date-picker
                    v-model="searchParam.feeConfirmTime"
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
        <div>
            <ConfirmDialog
                v-if="confirmDialog.visible"
                v-bind="confirmDialog"
                :visible.sync="confirmDialog.visible"
                @update="handleFilter"
            />
        </div>
    </layout-filter>
</template>

<script>
    // 方法
    import enums from '@/utils/enum'
    // API
    import installChargeBillApi from '@/api/operationsManagement/installChargeBill'
    // 组件
    import ConfirmDialog from './components/ConfirmDialog'

    export default {
        components: {
            ConfirmDialog
        },
        props: {
        },
        data() {
            return {
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'code',
                            label: '编号',
                            minWidth: 150,
                            isClick: true,
                            onClick: (data) => {
                                this.handleUpdate(data)
                            }
                        },
                        {
                            type: 'status',
                            enums: enums.deviceInstallChargeStatus,
                            prop: 'feeStatus',
                            label: '状态',
                            minWidth: 100
                        },
                        {
                            type: 'money',
                            prop: 'feeAmount',
                            label: '安装费（元）',
                            minWidth: 130,
                            dbProp: 'c_fee_amount',
                            sortable: 'custom'
                        },
                        {
                            prop: 'feeConfirmUserName',
                            label: '确认人',
                            minWidth: 100
                        },
                        {
                            type: 'date',
                            prop: 'feeConfirmTime',
                            label: '确认时间',
                            minWidth: 140,
                            format: 'YYYY-MM-DD HH:mm',
                            dbProp: 'c_fee_confirm_time',
                            sortable: 'custom'
                        },
                        {
                            prop: 'remark',
                            label: '备注',
                            minWidth: 260
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
                confirmDialog: {
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
                let res = await installChargeBillApi.getList({
                    ...this.searchParam
                })
                this.tableData.list = res.data.records.map(item => {
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
            // 点击新增or编辑按钮时触发
            handleUpdate(data) {
                if (data) {
                    this.confirmDialog = {
                        dataId: data.guidId,
                        isEdit: data.feeStatus === 0,
                        rowData: data,
                        visible: true
                    }
                } else {
                    this.confirmDialog = {
                        isEdit: true,
                        visible: true
                    }
                }
            },
            // 点击导出按钮时触发
            handleExport() {
                var data = { ...this.searchParam }
                data.pageSize = this.tableData.total
                installChargeBillApi.export(data)
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
