<!--
* @description  SIM卡续费申请单
* @fileName index.vue
* @author 易超
!-->
<template>
    <layout-box>
        <layout-filter
            :table-columns.sync="tableData.columns"
            :filter-model.sync="searchParam"
            :filter-button="checkFeature(['ty.iot.approval.renewSIM.search'])"
            class="project"
            @search="handleFilter"
        >
            <template slot="button">
                <el-button
                    v-waves
                    v-if="checkFeature(['ty.iot.approval.renewSIM.export'])"
                    size="mini"
                    class="filter-button"
                    type="warning"
                    icon="el-icon-download"
                    @click="handleExport"
                >导出</el-button>
                <template v-if="isEdit">
                    <el-button
                        v-waves
                        v-if="checkFeature(['ty.iot.approval.renewSIM.create'])"
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
                />
                <el-input
                    v-model="searchParam.code"
                    placeholder="单号"
                    size="mini"
                    clearable
                    class="filter-item"
                    @change="handleFilter"
                />
            </template>
            <template slot="filter-popup">
                <layout-filter-item label="供应商">
                    <el-input
                        v-model="searchParam.purchaseSupplierName"
                        size="mini"
                        placeholder="供应商"
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
                <!-- 新增和修改弹窗 -->
                <UpdateDialog
                    v-if="updateDialogVisible"
                    :data-id="activeRowId"
                    :visible.sync="updateDialogVisible"
                    :is-update="!!activeRowId"
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
    import renewSIMApi from '@/api/businessDocuments/renewSIM'
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
                    purchaseSupplierName: '',
                    applyDate: [],
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
                            minWidth: 155,
                            disabled: true,
                            isClick: true,
                            onClick: (row) => {
                                this.handleApproval(row)
                            }
                        },
                        {
                            prop: 'purchaseSupplierName',
                            label: '供应商',
                            minWidth: 200
                        },
                        {
                            prop: 'count',
                            label: '续期SIM卡数量',
                            minWidth: 200,
                            align: 'right',
                            dbProp: 'p.c_count',
                            sortable: 'custom'
                        },
                        {
                            prop: 'amount',
                            label: '续期费用(元)',
                            minWidth: 200,
                            type: 'money',
                            dbProp: 'p.c_amount',
                            sortable: 'custom'
                        },
                        {
                            prop: 'remark',
                            label: '备注',
                            minWidth: 200
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
                        showIndex: true
                    }
                },
                selectList: [],
                requestApi: renewSIMApi,
                deleteIdKey: 'guidId',
                approvalType: 8
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
