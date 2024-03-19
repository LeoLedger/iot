<!--
* @description  销售合同
* @fileName index.vue
* @author 易超
!-->
<template>
    <layout-box>
        <layout-filter
            :table-columns.sync="tableData.columns"
            :filter-model.sync="searchParam"
            :filter-button="checkFeature(['ty.iot.approval.salesContract.search'])"
            class="project"
            @search="handleFilter"
        >
            <template slot="button">
                <el-button
                    v-waves
                    v-if="checkFeature(['ty.iot.approval.salesContract.export'])"
                    size="mini"
                    class="filter-button"
                    type="warning"
                    icon="el-icon-download"
                    @click="handleExport"
                >导出</el-button>
                <template v-if="isEdit">
                    <el-button
                        v-waves
                        v-if="checkFeature(['ty.iot.approval.salesContract.create'])"
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
                    v-model="searchParam.contractCode"
                    placeholder="合同编号"
                    size="mini"
                    clearable
                    class="filter-item"
                    @change="handleFilter"
                />
            </template>
            <template slot="filter-popup">
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
                <layout-filter-item label="客户">
                    <RemoteSelect
                        v-model="searchParam.customerId"
                        :method="customerRemoteMethod"
                        label-key="name"
                        value-key="guidId"
                        filter-label-key="name"
                        placeholder="选择客户"
                        clearable
                    />
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
                <layout-filter-item label="合同状态">
                    <DictSelect
                        v-model="searchParam.approvalStatus"
                        :exclude="[4]"
                        :disabled="canHandle"
                        type="documentStatus"
                        placeholder="合同状态"
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
                        <el-dropdown
                            v-if="hasSelf(row) && (row._buttonConfig.update || row._buttonConfig.delete || row._buttonConfig.withdraw)"
                            trigger="click"
                            size="small"
                        >
                            <el-button
                                size="mini"
                                icon="el-icon-more"
                                title="操作"
                            />
                            <el-dropdown-menu slot="dropdown">
                                <div v-if="row._buttonConfig.update" class="layout-dropdown-item" @click="handleUpdate(row)">
                                    <el-dropdown-item icon="el-icon-edit" divided>编辑</el-dropdown-item>
                                </div>
                                <div v-if="row._buttonConfig.withdraw" class="layout-dropdown-item" @click="handleWithdraw(row)">
                                    <el-dropdown-item icon="el-icon-refresh" divided>撤回</el-dropdown-item>
                                </div>
                                <div v-if="row._buttonConfig.delete" class="layout-dropdown-item" @click="handleDelete(row)">
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
    import sectionApi from '@/api/PM/section'
    import customerApi from '@/api/PM/customer'
    import salesContractApi from '@/api/businessDocuments/salesContract'
    // 组件
    import Approval from './components/Approval'
    import UpdateDialog from '@/views/PM/salesContract/components/UpdateDialog'

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
                    sectionId: '',
                    customerId: '',
                    contractName: '',
                    contractType: '',
                    applyUserName: ''
                },
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'contractCode',
                            label: '合同编号',
                            minWidth: 155,
                            disabled: true,
                            isClick: true,
                            onClick: (row) => {
                                this.handleApproval(row)
                            }
                        },
                        {
                            prop: 'contractName',
                            label: '合同名称',
                            minWidth: 160,
                            disabled: true
                        },
                        {
                            type: 'dict',
                            dictType: 'contractType',
                            prop: 'contractType',
                            label: '合同类型',
                            width: 100,
                            disabled: true
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
                            width: 145,
                            dbProp: 'p.amount',
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
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    }
                },
                guidIdKey: 'contractId',
                deleteIdKey: 'contractId',
                requestApi: salesContractApi,
                approvalType: 12,
                updateDialogVisible: false,
                sectionRemoteMethod: sectionApi.getList,
                customerRemoteMethod: customerApi.getList
            }
        },
        computed: {
        },
        methods: {
            dataFilter(dataList) {
                return dataList.map(item => {
                    item._buttonConfig = {
                        update: [1, 2].includes(item.approvalStatus),
                        delete: this.checkFeature(['ty.iot.approval.salesContract.delete']) &&
                            (
                            [null, 1, 2].includes(item.approvalStatus) ||
                            (item.approvalStatus !== 0 && item.canDelete === 0 && item.contractType !== 3)
                            ),
                        withdraw: [0].includes(item.approvalStatus)
                    }
                    return item
                })
            }
        }
    }
</script>

<style lang='scss' scoped>

</style>
