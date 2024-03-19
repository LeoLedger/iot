<!--
* @description  需求申请单
* @fileName index.vue
* @author 易超
!-->
<template>
    <layout-box>
        <layout-filter
            :table-columns.sync="tableData.columns"
            :filter-model.sync="searchParam"
            :filter-button="checkFeature(['ty.iot.approval.demand.search'])"
            @search="handleFilter"
        >
            <template slot="button">
                <el-button
                    v-waves
                    v-if="checkFeature(['ty.iot.approval.demand.export'])"
                    size="mini"
                    class="filter-button"
                    type="warning"
                    icon="el-icon-download"
                    @click="handleExport"
                >导出</el-button>
                <template v-if="isEdit">
                    <el-button
                        v-waves
                        v-if="checkFeature(['ty.iot.approval.demand.create'])"
                        size="mini"
                        class="filter-button"
                        type="success"
                        icon="el-icon-plus"
                        @click="handleUpdate()"
                    >新增</el-button>
                    <el-button
                        v-waves
                        v-if="checkFeature(['ty.iot.approval.demand.verifiable'])"
                        size="mini"
                        class="filter-button"
                        type="primary"
                        @click="handleBatchVerifiable"
                    >核销单据</el-button>
                </template>
            </template>
            <template slot="filter">
                <el-date-picker
                    v-model="searchParam.applyDate"
                    :default-time="['00:00:00', '23:59:59']"
                    type="daterange"
                    format="yyyy-MM-dd"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    range-separator="至"
                    start-placeholder="提交开始日期"
                    end-placeholder="提交结束日期"
                    clearable
                    style="width: 300px"
                    class="filter-item"
                    @change="handleFilter"
                />
                <el-input
                    v-model="searchParam.code"
                    placeholder="申请单号"
                    size="mini"
                    clearable
                    class="filter-item"
                    @change="handleFilter"
                />
            </template>
            <template slot="filter-popup">
                <layout-filter-item label="项目名称">
                    <el-input
                        v-model="searchParam.projectName"
                        size="mini"
                        placeholder="项目名称"
                        clearable
                    />
                </layout-filter-item>
                <layout-filter-item label="产品名称">
                    <el-input
                        v-model="searchParam.productName"
                        size="mini"
                        placeholder="产品名称"
                        clearable
                    />
                </layout-filter-item>
                <layout-filter-item label="提交人">
                    <el-input
                        v-model="searchParam.applyUserName"
                        size="mini"
                        placeholder="提交人"
                        clearable
                    />
                </layout-filter-item>
                <layout-filter-item label="需求日期">
                    <el-date-picker
                        v-model="searchParam.purchaseDate"
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
                <layout-filter-item label="单据状态">
                    <DictSelect
                        v-model="searchParam.approvalStatus"
                        :disabled="canHandle"
                        type="documentStatus"
                        placeholder="单据状态"
                        clearable
                        filterable
                        size="mini"
                    />
                </layout-filter-item>
            </template>
            <template slot="table">
                <TableComponent
                    v-bind="tableData"
                    :operates="tableOperates"
                    :page-index.sync="searchParam.pageIndex"
                    :page-size.sync="searchParam.pageSize"
                    :selected-list="selectList"
                    @refreshList="handleRefreshList"
                    @handleSelectionChange="handleSelectionChange"
                >
                    <template slot="操作" slot-scope="{row}">
                        <el-dropdown v-if="![4].includes(row.approvalStatus) && hasSelf(row)" trigger="click" size="small">
                            <el-button
                                size="mini"
                                icon="el-icon-more"
                                title="操作"
                            />
                            <el-dropdown-menu slot="dropdown">
                                <div v-if="[1,2].includes(row.approvalStatus)" class="layout-dropdown-item" @click="handleUpdate(row)">
                                    <el-dropdown-item icon="el-icon-edit" divided>编辑</el-dropdown-item>
                                </div>
                                <div v-if="[0].includes(row.approvalStatus)" class="layout-dropdown-item" @click="handleWithdraw(row)">
                                    <el-dropdown-item icon="el-icon-refresh" divided>撤回</el-dropdown-item>
                                </div>
                                <div v-if="[3].includes(row.approvalStatus)" class="layout-dropdown-item" @click="handleVerifiable(row)">
                                    <el-dropdown-item icon="el-icon-setting" divided>核销</el-dropdown-item>
                                </div>
                                <div v-if="[null,1,2].includes(row.approvalStatus)" class="layout-dropdown-item" @click="handleDelete(row)">
                                    <el-dropdown-item icon="el-icon-setting" divided>删除</el-dropdown-item>
                                </div>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </template>
                </TableComponent>
            </template>
            <div>
                <!-- 审批 -->
                <Approval
                    v-if="approvalDialogVisible"
                    :data-id="activeRowId"
                    :row-data="activeRowData"
                    :visible.sync="approvalDialogVisible"
                    :only-show="!canHandle"
                    @update="getList"
                />
                <!-- 添加需求申请单 -->
                <UpdateDialog
                    v-if="updateDialogVisible"
                    :data-id="activeRowId"
                    :visible.sync="updateDialogVisible"
                    is-edit
                    @update="getList"
                />
                <!-- 输入弹窗 -->
                <InputDialog
                    v-bind="inputDialog"
                    :visible.sync="inputDialog.visible"
                    @confirm="handleInputDialogConfirm"
                />
            </div>
        </layout-filter>
    </layout-box>
</template>
<script>
    // 工具
    import mixin from '../mixin'
    import enums from '@/utils/enum'
    // API
    import demandApplyApi from '@/api/businessDocuments/demand'
    // 组件
    import Approval from './components/Approval'
    import UpdateDialog from './components/UpdateDialog'

    export default {
        components: {
            Approval,
            UpdateDialog
        },
        mixins: [mixin],
        data() {
            return {
                searchParam: {
                    code: '',
                    applyDate: [],
                    purchaseDate: [],
                    projectName: '',
                    productName: '',
                    applyUserName: ''
                },
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'code',
                            label: '申请单号',
                            minWidth: 130,
                            disabled: true,
                            isClick: true,
                            onClick: (row) => {
                                this.handleApproval(row)
                            }
                        },
                        {
                            prop: 'projectName',
                            label: '项目',
                            minWidth: 220,
                            disabled: true
                        },
                        {
                            prop: 'productName',
                            label: '产品',
                            minWidth: 155,
                            disabled: true,
                            idKey: 'productId',
                            isClick: true,
                            dialogType: 'product'
                        },
                        {
                            prop: 'purchaseCount',
                            label: '需求数量',
                            width: 110,
                            dbProp: 'p.c_purchase_count',
                            sortable: 'custom'
                        },
                        {
                            type: 'date',
                            prop: 'purchaseDate',
                            label: '需求日期',
                            minWidth: 110,
                            dbProp: 'p.c_purchase_date',
                            sortable: 'custom'
                        },
                        {
                            prop: 'applyUserName',
                            label: '提交人',
                            width: 110
                        },
                        {
                            type: 'date',
                            prop: 'applyDate',
                            label: '提交时间',
                            width: 110,
                            dbProp: 'p.c_apply_date',
                            sortable: 'custom'
                        },
                        {
                            fixed: 'right',
                            prop: 'approvalStatus',
                            type: 'status',
                            enums: enums.documentStatus,
                            label: '状态',
                            width: 85
                        }
                    ],
                    options: {
                        stripe: true,
                        loading: false,
                        showIndex: true,
                        mutiSelect: this.isEdit,
                        mutiSelectedKey: 'guidId',
                        selectable: (row) => row.approvalStatus === 3
                    }
                },
                selectList: [],
                requestApi: demandApplyApi,
                approvalType: 0
            }
        },
        computed: {
        },
        methods: {
            // 核销单据
            async queryVerifiable(value) {
                try {
                    var guid = this.activeRowData ? [this.activeRowData.guidId] : this.selectList.map(v => v.guidId)
                    var res = await demandApplyApi.verifiable({
                        guid,
                        content: value
                    })
                    this.$notify({
                        title: '核销成功',
                        message: res.msg,
                        type: 'success',
                        duration: 2000
                    })
                    this.selectList = []
                    this.getList()
                } catch (e) {
                    console.log(e)
                }
                this.inputDialog.loading = false
                this.inputDialog.visible = false
            },
            // 点击核销按钮时触发
            handleVerifiable(data) {
                this.inputDialog = {
                    type: 2,
                    value: '',
                    title: '核销单据',
                    visible: true,
                    loading: false,
                    buttonText: '确定核销',
                    placeholder: '请填写核销说明'
                }
                this.inputDialogCallback = this.queryVerifiable
                this.activeRowData = data
            },
            // 多选-选中表格行时触发
            handleSelectionChange(val) {
                this.selectList = val
            },
            // 点击批量核销按钮时触发
            handleBatchVerifiable() {
                if (this.selectList.length) {
                    this.handleVerifiable()
                } else {
                    this.$message.warning('请至少选择一项')
                }
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
