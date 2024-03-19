<!--
* @description  出库申请单
* @fileName index.vue
* @author 易超
!-->
<template>
    <layout-box>
        <layout-filter
            :table-columns.sync="tableData.columns"
            :filter-model.sync="searchParam"
            :filter-button="checkFeature(['ty.iot.approval.storageOut.search'])"
            @search="handleFilter"
        >
            <template slot="button">
                <el-button
                    v-waves
                    v-if="checkFeature(['ty.iot.approval.storageOut.export'])"
                    size="mini"
                    class="filter-button"
                    type="warning"
                    icon="el-icon-download"
                    @click="handleExport"
                >导出</el-button>
                <template v-if="isEdit">
                    <el-button
                        v-waves
                        v-if="checkFeature(['ty.iot.approval.storageOut.create'])"
                        size="mini"
                        class="filter-button"
                        type="success"
                        icon="el-icon-plus"
                        @click="handleUpdate()"
                    >新增</el-button>
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
                    placeholder="出库单号"
                    size="mini"
                    clearable
                    class="filter-item"
                    @change="handleFilter"
                />
            </template>
            <template slot="filter-popup">
                <layout-filter-item label="合同编号">
                    <el-input
                        v-model="searchParam.contractCode"
                        size="mini"
                        placeholder="合同编号"
                        clearable
                    />
                </layout-filter-item>
                <layout-filter-item label="合同名称">
                    <el-input
                        v-model="searchParam.contractName"
                        size="mini"
                        placeholder="合同名称"
                        clearable
                    />
                </layout-filter-item>
                <layout-filter-item label="合同类型">
                    <DictSelect
                        v-model="searchParam.contractType"
                        type="contractType"
                        placeholder="合同类型"
                        clearable
                        filterable
                        size="mini"
                    />
                </layout-filter-item>
                <layout-filter-item label="出库类型">
                    <DictSelect
                        v-model="searchParam.outType"
                        type="storageOutType"
                        placeholder="出库类型"
                        clearable
                        filterable
                        size="mini"
                    />
                </layout-filter-item>
                <layout-filter-item label="产品编号">
                    <el-input
                        v-model="searchParam.productCode"
                        size="mini"
                        placeholder="产品编号"
                        clearable
                    />
                </layout-filter-item>
                <layout-filter-item label="项目">
                    <el-input
                        v-model="searchParam.projectName"
                        size="mini"
                        placeholder="项目"
                        clearable
                    />
                </layout-filter-item>
                <layout-filter-item label="企业">
                    <el-input
                        v-model="searchParam.customerName"
                        size="mini"
                        placeholder="企业"
                        clearable
                    />
                </layout-filter-item>
                <layout-filter-item label="标段">
                    <el-input
                        v-model="searchParam.sectionName"
                        size="mini"
                        placeholder="标段"
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
                <layout-filter-item label="单据状态">
                    <DictSelect
                        v-model="searchParam.approvalStatus"
                        :exclude="[4]"
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
                    @refreshList="handleRefreshList"
                >
                    <template slot="操作" slot-scope="{row}">
                        <el-dropdown v-if="![3].includes(row.approvalStatus) && hasSelf(row)" trigger="click" size="small">
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
                <!-- 添加申请单 -->
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
    import storageOutApi from '@/api/businessDocuments/storageOut'
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
                    contractCode: '',
                    contractName: '',
                    contractType: '',
                    projectName: '',
                    customerName: '',
                    sectionName: '',
                    applyUserName: ''
                },
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'code',
                            label: '出库单号',
                            minWidth: 165,
                            disabled: true,
                            isClick: true,
                            onClick: row => {
                                this.handleApproval(row)
                            }
                        },
                        {
                            prop: 'contractCode',
                            label: '合同编号',
                            minWidth: 155,
                            disabled: true,
                            idKey: 'contractId',
                            isClick: true,
                            dialogType: 'salesContract'
                        },
                        {
                            prop: 'contractName',
                            label: '合同名称',
                            minWidth: 155,
                            disabled: true
                        },
                        {
                            type: 'dict',
                            dictType: 'contractType',
                            prop: 'contractType',
                            label: '合同类型',
                            width: 100
                        },
                        {
                            prop: 'outNum',
                            label: '出库数量',
                            minWidth: 100,
                            dbProp: 'ado.c_out_num',
                            sortable: 'custom'
                        },
                        {
                            prop: 'projectName',
                            label: '项目',
                            minWidth: 180,
                            idKey: 'projectId',
                            isClick: true,
                            dialogType: 'project'
                        },
                        {
                            prop: 'customerName',
                            label: '企业',
                            minWidth: 180
                        },
                        {
                            prop: 'sectionName',
                            label: '标段',
                            minWidth: 160,
                            idKey: 'sectionId',
                            isClick: true,
                            dialogType: 'sections'
                        },
                        {
                            prop: 'applyUserName',
                            label: '提交人',
                            width: 100
                        },
                        {
                            type: 'date',
                            prop: 'applyDate',
                            label: '提交时间',
                            width: 100,
                            dbProp: 'ado.c_apply_date',
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
                        showIndex: true
                    }
                },
                requestApi: storageOutApi,
                deleteIdKey: 'guidId',
                approvalType: 2
            }
        },
        computed: {
        },
        methods: {
        }
    }
</script>

<style lang='scss' scoped>
</style>
