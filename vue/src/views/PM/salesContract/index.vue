<!--
* @description  项目
* @fileName index.vue
* @author 易超
!-->
<template>
    <layout-template
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        :filter-button="checkFeature(['ty.iot.salesContract.search'])"
        class="project"
        @search="handleFilter"
    >
        <template slot="button">
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.salesContract.export'])"
                size="mini"
                class="filter-button"
                type="warning"
                icon="el-icon-download"
                @click="handleExport"
            >导出</el-button>
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.salesContract.create'])"
                size="mini"
                class="filter-button"
                type="success"
                icon="el-icon-upload2"
                @click="handleUpdate('',true)"
            >导入</el-button>
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.salesContract.create'])"
                size="mini"
                class="filter-button"
                type="success"
                icon="el-icon-plus"
                @click="handleUpdate()"
            >新增</el-button>
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.salesContract.create.history.renew'])"
                size="mini"
                class="filter-button"
                type="success"
                icon="el-icon-plus"
                @click="handleCreateHistory()"
            >历史续费合同</el-button>
        </template>
        <template slot="filter">
            <el-input
                v-model="searchParam.customerName"
                size="mini"
                placeholder="客户名称"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.sectionName"
                size="mini"
                placeholder="标段名称"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.projectName"
                size="mini"
                placeholder="项目名称"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.name"
                size="mini"
                placeholder="合同名称"
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
        </template>
        <template slot="filter-popup">
            <layout-filter-item label="合同类型">
                <DictSelect
                    v-model="searchParam.type"
                    type="contractType"
                    placeholder="合同类型"
                    clearable
                    filterable
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="合同状态">
                <DictSelect
                    v-model="searchParam.status"
                    type="contractStatus"
                    placeholder="合同状态"
                    clearable
                    filterable
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="合同金额">
                <div class="flex-align-center">
                    <el-input
                        v-model="searchParam.amountList[0]"
                        size="mini"
                        type="number"
                        class="flex"
                        placeholder="最小金额"
                        clearable
                    />
                    <span class="separator">至</span>
                    <el-input
                        v-model="searchParam.amountList[1]"
                        size="mini"
                        type="number"
                        class="flex"
                        placeholder="最大金额"
                        clearable
                    />
                </div>
            </layout-filter-item>
            <layout-filter-item label="收款进度">
                <el-slider
                    v-model="searchParam.amountReceivedRate"
                    :max="100"
                    :format-tooltip="value => value + '%'"
                    range
                    style="margin: 0 10px"
                />
            </layout-filter-item>
            <layout-filter-item label="合同期限">
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
                />
            </layout-filter-item>
            <layout-filter-item label="签订日期">
                <el-date-picker
                    v-model="searchParam.signedDateRange"
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
            <layout-filter-item label="最新出库时间">
                <el-date-picker
                    v-model="searchParam.outWarehouseTime"
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
            <layout-filter-item label="最新审批通过时间">
                <el-date-picker
                    v-model="searchParam.approvalYesTime"
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
            <layout-filter-item label="有无盖章">
                <DictSelect
                    v-model="searchParam.isStamp"
                    type="contractSeal"
                    placeholder="有无盖章"
                    clearable
                    filterable
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="创建人">
                <el-input
                    v-model="searchParam.userName"
                    size="mini"
                    placeholder="创建人"
                    clearable
                />
            </layout-filter-item>
        </template>
        <template slot="table">
            <TableComponent
                v-bind="tableData"
                :page-index.sync="searchParam.pageIndex"
                :page-size.sync="searchParam.pageSize"
                :selected-list="selectedList"
                @refreshList="handleRefreshList"
                @handleSelectionChange="handleSelect"
            >
                <template slot="操作" slot-scope="{row}">
                    <!-- 已撤回、已驳回才能编辑 -->
                    <el-dropdown
                        v-if="includeFeature(['ty.iot.salesContract.update'])"
                        trigger="click"
                        size="small"
                    >
                        <el-button
                            size="mini"
                            icon="el-icon-more"
                            title="操作"
                        />
                        <el-dropdown-menu slot="dropdown">
                            <div v-if="checkFeature(['ty.iot.salesContract.update'])" class="layout-dropdown-item" @click="handleUpdate(row)">
                                <el-dropdown-item icon="el-icon-edit" divided>添加附件</el-dropdown-item>
                            </div>
                        </el-dropdown-menu>
                    </el-dropdown>
                </template>
            </TableComponent>
        </template>
        <div>
            <!-- 编辑数据 -->
            <UpdateDialog
                v-if="updateDialog.visible"
                v-bind="updateDialog"
                :visible.sync="updateDialog.visible"
                @update="getList"
            />
        </div>
    </layout-template>
</template>
<script>
    // 工具
    import enums from '@/utils/enum'
    // API
    import sectionApi from '@/api/PM/section'
    import projectApi from '@/api/PM/project'
    import contractApi from '@/api/PM/contract'
    import customerApi from '@/api/PM/customer'
    // 组件
    import UpdateDialog from './components/UpdateDialog'

    export default {
        components: {
            UpdateDialog
        },
        props: {},
        data() {
            return {
                searchParam: {
                    amountList: [],
                    amountReceivedRate: [0, 100],
                    pageSize: 15,
                    pageIndex: 1
                },
                selectedList: [], // 选中的数据
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'code',
                            label: '合同编号',
                            minWidth: 155,
                            disabled: true,
                            isClick: true,
                            dialogType: 'salesContract'
                        },
                        {
                            prop: 'name',
                            label: '合同名称',
                            minWidth: 160,
                            disabled: true
                        },
                        {
                            type: 'dict',
                            dictType: 'contractType',
                            prop: 'type',
                            label: '合同类型',
                            width: 100
                        },
                        {
                            label: '状态',
                            prop: 'status',
                            type: 'status',
                            style: 'dot',
                            enums: enums.contractStatus,
                            width: 100
                        },
                        {
                            prop: 'customerName',
                            label: '客户',
                            minWidth: 200
                        },
                        {
                            prop: 'projectName',
                            label: '项目',
                            minWidth: 200,
                            idKey: 'projectId',
                            isClick: true,
                            dialogType: 'project'
                        },
                        {
                            prop: 'sectionName',
                            label: '标段',
                            minWidth: 200,
                            idKey: 'sectionId',
                            isClick: true,
                            dialogType: 'sections'
                        },
                        {
                            type: 'money',
                            prop: 'amount',
                            label: '合同总金额（元）',
                            width: 150,
                            dbProp: 'c_amount',
                            sortable: 'custom'
                        },
                        {
                            prop: 'amountReceivedRate',
                            label: '收款进度',
                            width: 100,
                            dbProp: 'arr',
                            sortable: 'custom'
                        },
                        {
                            type: 'money',
                            prop: 'totalDeposit',
                            label: '押金（元）',
                            width: 120,
                            dbProp: 'c_total_deposit',
                            sortable: 'custom'
                        },
                        {
                            type: 'dateRange',
                            endKey: 'endDate',
                            startKey: 'startDate',
                            prop: 'startDate',
                            label: '合同期限',
                            width: 180,
                            dbProp: 'c_end_date',
                            sortable: 'custom'
                        },
                        {
                            type: 'date',
                            prop: 'signedDate',
                            label: '签订日期',
                            width: 120,
                            dbProp: 'c_signed_date',
                            sortable: 'custom'
                        },
                        {
                            type: 'dict',
                            dictType: 'contractSeal',
                            prop: 'isStamp',
                            label: '有无盖章',
                            width: 120
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        mutiSelect: true // 是否多选
                    },
                    // 列操作按钮
                    operates: {
                        width: 55,
                        fixed: 'right',
                        show: true
                    }
                },
                updateDialog: {
                    visible: false
                },
                sectionRemoteMethod: sectionApi.getList,
                projectRemoteMethod: projectApi.getList,
                customerRemoteMethod: customerApi.getList
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
                var res = await contractApi.getList({
                    ...this.searchParam,
                    amountList: this.searchParam.amountList.filter(v => v !== '')
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
                this.selectedList = []
                if (this.searchParam.pageIndex !== 1) {
                    this.searchParam.pageIndex = 1
                } else {
                    this.getList()
                }
            },
            // 点击新增or编辑按钮时触发
            handleUpdate(data, isImport) {
                let dataId
                let permissionProps
                if (data) {
                    dataId = data.guidId
                    permissionProps = this.checkFeature(['ty.iot.salesContract.operates']) ? null : ['fileList', 'signedDate', 'contractSeal', 'isProject', 'remark']
                }
                this.updateDialog = {
                    isEdit: true,
                    dataId,
                    visible: true,
                    permissionProps,
                    isImport: isImport
                }
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
                if (this.selectedList.length > 0) {
                    data.ids = this.selectedList.map(item => item.id)
                }
                // contractApi.export(data)
                contractApi.exportByPost(data)
            },
            // 创建历史续费合同
            handleCreateHistory() {
                this.updateDialog = {
                    isEdit: true,
                    visible: true,
                    historyRenew: true
                }
            },
            // 点击排序时触发
            handleRefreshList(obj) {
                this.searchParam = Object.assign({}, this.searchParam, obj)
                this.getList()
            },
            handleSelect(row) {
                this.selectedList = row
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
