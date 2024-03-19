<!--
* @description 合同列表
* @author yc
!-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        :filter-button="checkFeature(['ty.iot.purchaseContract.search'])"
        @search="handleFilter"
    >
        <template slot="button">
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.purchaseContract.export'])"
                size="mini"
                class="filter-button"
                type="warning"
                icon="el-icon-download"
                @click="handleExport"
            >导出</el-button>
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.purchaseContract.create'])"
                size="mini"
                class="filter-button"
                type="success"
                icon="el-icon-plus"
                @click="handleUpdate()"
            >新增</el-button>
        </template>
        <template slot="filter">
            <RemoteSelect
                v-model="searchParam.partyB"
                :method="supplierRemoteMethod"
                width="200px"
                label-key="name"
                value-key="guidId"
                filter-label-key="name"
                placeholder="选择合同乙方"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.name"
                size="mini"
                placeholder="合同名称"
                maxlength="11"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.code"
                placeholder="合同编号"
                size="mini"
                clearable
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
            <el-input
                v-model="searchParam.createUserName"
                placeholder="申请人"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
        </template>
        <template slot="filter-popup">
            <layout-filter-item label="合同甲方">
                <RemoteSelect
                    v-model="searchParam.partyA"
                    :method="deptListRemoteMethod"
                    label-key="deptName"
                    value-key="deptId"
                    filter-label-key="deptName"
                    filter-value-key="deptId"
                    placeholder="选择合同甲方"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="合同金额">
                <div class="flex-align-center">
                    <el-input
                        v-model="searchParam.amount[0]"
                        size="mini"
                        type="number"
                        class="flex"
                        placeholder="最小金额"
                        clearable
                    />
                    <span class="separator">至</span>
                    <el-input
                        v-model="searchParam.amount[1]"
                        size="mini"
                        type="number"
                        class="flex"
                        placeholder="最大金额"
                        clearable
                    />
                </div>
            </layout-filter-item>
            <layout-filter-item label="签订日期">
                <el-date-picker
                    v-model="searchParam.signedDate"
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
            <layout-filter-item label="合同有效期">
                <el-date-picker
                    v-model="searchParam.contractValidDate"
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
            >
                <template slot="操作" slot-scope="{row}">
                    <el-dropdown v-if="includeFeature(['ty.iot.purchaseContract.update', 'ty.iot.purchaseContract.delete'])" trigger="click" size="small">
                        <el-button
                            size="mini"
                            icon="el-icon-more"
                            title="操作"
                        />
                        <el-dropdown-menu slot="dropdown">
                            <div v-if="checkFeature(['ty.iot.purchaseContract.update'])" class="layout-dropdown-item" @click="handleUpdate(row)">
                                <el-dropdown-item icon="el-icon-edit" divided>编辑</el-dropdown-item>
                            </div>
                            <div v-if="checkFeature(['ty.iot.purchaseContract.delete'])" class="layout-dropdown-item" @click="handleDelete(row)">
                                <el-dropdown-item icon="el-icon-delete" divided>删除</el-dropdown-item>
                            </div>
                        </el-dropdown-menu>
                    </el-dropdown>
                </template>
            </TableComponent>
        </template>
        <div>
            <!-- 更新合同信息 -->
            <UpdateDialog
                v-if="updateDialogVisible"
                :data-id="activeRowId"
                :visible.sync="updateDialogVisible"
                is-edit
                @update="getList"
            />
        </div>
    </layout-filter>
</template>

<script>
    // 方法
    import moment from 'moment'
    import { getPriceFormat } from '@/utils'
    // API
    import resourceApi from '@/api/resource'
    import supplierApi from '@/api/purchase/supplier'
    import contractApi from '@/api/purchase/contract'
    // 组件
    import UpdateDialog from './components/UpdateDialog'

    export default {
        components: {
            UpdateDialog
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
                            label: '合同编号',
                            minWidth: 130,
                            isClick: true,
                            dialogType: 'purchaseContract'
                        },
                        {
                            prop: 'name',
                            label: '合同名称',
                            minWidth: 210
                        },
                        {
                            prop: 'partyAName',
                            label: '合同甲方',
                            minWidth: 210
                        },
                        {
                            prop: 'partyBName',
                            label: '合同乙方',
                            minWidth: 210
                        },
                        {
                            type: 'money',
                            prop: 'amount',
                            label: '合同金额',
                            dbProp: 'pc.c_amount',
                            sortable: 'custom',
                            width: 120
                        },
                        {
                            type: 'date',
                            prop: 'signedDate',
                            label: '签订日期',
                            dbProp: 'pc.c_signed_date',
                            sortable: 'custom',
                            width: 140
                        },
                        {
                            type: 'dateRange',
                            endKey: 'endDate',
                            startKey: 'beginDate',
                            prop: 'beginDate',
                            label: '合同有效期',
                            dbProp: 'pc.c_begin_date',
                            sortable: 'custom',
                            minWidth: 200
                        },
                        {
                            prop: 'createUserName',
                            label: '申请人',
                            width: 100
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    },
                    // 列操作按钮
                    operates: {
                        width: 67,
                        fixed: 'right',
                        show: true
                    }
                },
                searchParam: {
                    partyA: '',
                    partyB: '',
                    amount: [],
                    signedDate: [],
                    contractValidDate: [],
                    pageSize: 15,
                    pageIndex: 1
                },
                activeRowId: null,
                updateDialogVisible: false,
                supplierRemoteMethod: supplierApi.getList,
                deptListRemoteMethod: resourceApi.getDeptList
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
                var [beginDate, endDate] = this.searchParam._period || []
                var res = await contractApi.getList({
                    ...this.searchParam,
                    beginDate,
                    endDate,
                    amount: this.searchParam.amount.filter(v => v !== '')
                })
                if (res.success) {
                    this.tableData.list = res.data.records.map(item => {
                        return item
                    })
                    this.tableData.total = res.data.total
                }
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
            handleUpdate(data = {}) {
                this.activeRowId = data.guidId
                this.updateDialogVisible = true
            },
            // 点击删除按钮时触发
            async handleDelete(data) {
                await this.$confirm('此操作将删除此合同信息, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                })
                this.tableData.options.loading = true
                try {
                    var res = await contractApi.delete(data.guidId)
                    if (res.success) {
                        await this.getList()
                        this.$notify({
                            title: '成功',
                            message: '删除成功',
                            type: 'success',
                            duration: 2000
                        })
                    }
                } catch (e) {}
                this.tableData.options.loading = false
            },
            // 点击导出按钮时触发
            handleExport() {
                var data = { ...this.searchParam }
                data.pageSize = this.tableData.total
                contractApi.export(data)
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
.flex-align-center {
    display: flex;
    align-items: center;
    .flex {
        flex: 1;
    }
    .separator {
        margin: 0 8px;
        font-size: 12px;
    }
    /deep/ {
        .el-input__inner {
            text-align: center;
        }
    }
}
</style>
