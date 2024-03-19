<!--
* @description  设备调拨申请单
* @fileName index.vue
* @author 易超
!-->
<template>
    <layout-box>
        <layout-filter
            :table-columns.sync="tableData.columns"
            :filter-model.sync="searchParam"
            :filter-button="checkFeature(['ty.iot.approval.deviceAllocate.search'])"
            class="project"
            @search="handleFilter"
        >
            <template slot="button">
                <el-button
                    v-waves
                    v-if="checkFeature(['ty.iot.approval.deviceAllocate.export'])"
                    size="mini"
                    class="filter-button"
                    type="warning"
                    icon="el-icon-download"
                    @click="handleExport"
                >导出</el-button>
                <template v-if="isEdit">
                    <el-button
                        v-waves
                        v-if="checkFeature(['ty.iot.approval.deviceAllocate.create'])"
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
                <layout-filter-item label="项目名称">
                    <el-input
                        v-model="searchParam.xxx"
                        size="mini"
                        placeholder="项目名称"
                        clearable
                    />
                </layout-filter-item>
                <layout-filter-item label="企业名称">
                    <el-input
                        v-model="searchParam.xxx"
                        size="mini"
                        placeholder="企业名称"
                        clearable
                    />
                </layout-filter-item>
                <layout-filter-item label="标段名称">
                    <el-input
                        v-model="searchParam.xxx"
                        size="mini"
                        placeholder="标段名称"
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
                <layout-filter-item label="调出仓库">
                    <WarehouseCascader
                        :form-data="searchParam"
                        :can-select-stock="[
                            '38f6b174-b297-438f-aa1a-ba72e24f2b58',
                            '27f5247f-a1ec-47a7-91cc-28402a56f60c',
                            '92bac0e7-eadd-493a-b6bd-17a5a45d0bbb',
                            '09509d7b-5be3-4a89-a472-58c14b35cc2c',
                            '0d6146ff-ab3d-4dde-8584-803e2fc03730'
                        ]"
                        type="B16C3151-11D2-4364-8F45-63EFFFFCF424"
                        stock-key="warehousesOutId"
                        place-key="shippingSpaceOutId"
                        placeholder="调出仓库"
                        clearable
                    />
                </layout-filter-item>
                <layout-filter-item label="调入仓库">
                    <WarehouseCascader
                        :form-data="searchParam"
                        :can-select-stock="[
                            '38f6b174-b297-438f-aa1a-ba72e24f2b58',
                            '27f5247f-a1ec-47a7-91cc-28402a56f60c',
                            '09509d7b-5be3-4a89-a472-58c14b35cc2c',
                        ]"
                        type="B16C3151-11D2-4364-8F45-63EFFFFCF424"
                        stock-key="warehousesInId"
                        place-key="shippingSpaceInId"
                        placeholder="调入仓库"
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
                <!-- 新增弹窗 -->
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
    import deviceAllocateApi from '@/api/businessDocuments/deviceAllocate'
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
                            prop: 'warehousesOutName',
                            label: '调出仓库',
                            minWidth: 200,
                            formatter: (row) => {
                                return `${row.warehousesOutName || '- -'} | ${row.shippingSpaceOutName || '- -'}`
                            }
                        },
                        {
                            prop: 'warehousesInName',
                            label: '调入仓库',
                            minWidth: 200,
                            formatter: (row) => {
                                return `${row.warehousesInName || '- -'} | ${row.shippingSpaceInName || '- -'}`
                            }
                        },
                        {
                            prop: 'count',
                            label: '调拨数量',
                            width: 100,
                            dbProp: 'c_count',
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
                selectList: [],
                requestApi: deviceAllocateApi,
                deleteIdKey: 'guidId',
                approvalType: 9
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
