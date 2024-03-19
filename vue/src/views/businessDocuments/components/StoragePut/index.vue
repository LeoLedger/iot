<!--
* @description  入库申请单
* @fileName index.vue
* @author 易超
!-->
<template>
    <layout-box>
        <layout-filter
            :table-columns.sync="tableData.columns"
            :filter-model.sync="searchParam"
            :filter-button="checkFeature(['ty.iot.approval.storagePut.search'])"
            @search="handleFilter"
        >
            <template slot="button">
                <el-button
                    v-waves
                    v-if="checkFeature(['ty.iot.approval.storagePut.export'])"
                    size="mini"
                    class="filter-button"
                    type="warning"
                    icon="el-icon-download"
                    @click="handleExport"
                >导出</el-button>
                <template v-if="isEdit">
                    <el-button
                        v-waves
                        v-if="checkFeature(['ty.iot.approval.storagePut.create'])"
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
                    placeholder="入库单号"
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
                <layout-filter-item label="供应商">
                    <RemoteSelect
                        v-model="searchParam.supplierId"
                        :method="supplierRemoteMethod"
                        label-key="name"
                        value-key="guidId"
                        filter-label-key="name"
                        placeholder="选择供应商"
                        clearable
                    />
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
                <layout-filter-item label="预计到货日期">
                    <el-date-picker
                        v-model="searchParam.deliveryTime"
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
    import supplierApi from '@/api/purchase/supplier'
    import storagePutApi from '@/api/businessDocuments/storagePut'
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
                    supplierId: '',
                    contractCode: '',
                    contractName: '',
                    applyUserName: '',
                    signedDate: [],
                    deliveryTime: []
                },
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'code',
                            label: '入库单号',
                            minWidth: 155,
                            disabled: true,
                            isClick: true,
                            onClick: (row) => {
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
                            dialogType: 'purchaseContract'
                        },
                        {
                            prop: 'contractName',
                            label: '合同名称',
                            minWidth: 200,
                            disabled: true
                        },
                        {
                            prop: 'supplierName',
                            label: '供应商',
                            minWidth: 200
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
                            type: 'date',
                            prop: 'deliveryTime',
                            label: '预计到货日期',
                            width: 120,
                            dbProp: 'c_delivery_time',
                            sortable: 'custom'
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
                            dbProp: 'c_apply_date',
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
                requestApi: storagePutApi,
                approvalType: 1,
                supplierRemoteMethod: supplierApi.getList
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
