<!--
* @description  应收账款 - 列表
* @author 望浩然
!-->
<template>
    <div class="section-container">
        <layout-template
            :table-columns.sync="tableData.columns"
            :filter-model.sync="searchParam"
            :filter-button="checkFeature(['ty.iot.receivables.search'])"
            @search="handleSearch"
        >
            <template slot="button">
                <el-button
                    v-waves
                    v-prereclick
                    v-if="checkFeature(['ty.iot.receivables.export'])"
                    type="warning"
                    size="mini"
                    class="filter-item"
                    icon="el-icon-download"
                    @click="handleExport"
                >导出</el-button>
            </template>
            <template slot="filter">
                <DictSelect
                    v-model="searchParam.completeFlag"
                    type="amountCompleteFlag"
                    placeholder="收款状态"
                    width="150px"
                    clearable
                    filterable
                    class="filter-item"
                    size="mini"
                    @change="handleSearch"
                />
                <el-input
                    v-model="searchParam.code"
                    clearable
                    class="filter-item"
                    size="mini"
                    placeholder="账单编号"
                    @change="handleSearch"/>
            </template>
            <template slot="filter-popup">
                <layout-filter-item label="关联单据">
                    <el-input
                        v-model="searchParam.approvalCode"
                        clearable
                        class="filter-item"
                        size="mini"
                        placeholder="关联单据"/>
                </layout-filter-item>
                <layout-filter-item label="项目">
                    <RemoteSelect
                        v-model="searchParam.projectId"
                        :method="projectRemoteMethod"
                        :extend-params="{status: 1}"
                        label-key="projectName"
                        value-key="guidId"
                        filter-label-key="projectName"
                        placeholder="选择项目"
                        clearable
                        class="filter-item"
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
                        class="filter-item"
                    />
                </layout-filter-item>
                <layout-filter-item label="客户">
                    <RemoteSelect
                        v-model="searchParam.customerId"
                        :method="customerRemoteMethod"
                        label-key="name"
                        value-key="guidId"
                        filter-label-key="name"
                        placeholder="选择企业"
                        clearable
                        class="filter-item"
                    />
                </layout-filter-item>
                <layout-filter-item label="费用类型">
                    <DictSelect
                        v-model="searchParam.costType"
                        type="costType"
                        placeholder="费用类型"
                        clearable
                        filterable
                        class="filter-item"
                        size="mini"
                    />
                </layout-filter-item>
                <layout-filter-item label="生成日期">
                    <el-date-picker
                        v-model="searchParam.createTime"
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
                <layout-filter-item label="已收款">
                    <div class="flex-align-center">
                        <el-input
                            v-model="searchParam.amountReceived[0]"
                            size="mini"
                            type="number"
                            class="flex"
                            placeholder="最小金额"
                            clearable
                        />
                        <span class="separator">至</span>
                        <el-input
                            v-model="searchParam.amountReceived[1]"
                            size="mini"
                            type="number"
                            class="flex"
                            placeholder="最大金额"
                            clearable
                        />
                    </div>
                </layout-filter-item>
            </template>
            <template slot="table">
                <TableComponent
                    v-bind="tableData"
                    :page-index.sync="searchParam.pageIndex"
                    :page-size.sync="searchParam.pageSize"
                    @refreshList="handleSearch"
                />
            </template>
        </layout-template>
        <!-- 详情弹窗 -->
        <PublicDetailDialog
            v-if="dialogVisible"
            v-bind="dialogData"
            :visible.sync="dialogVisible"
        />
        <!-- 收款认领列表弹窗 -->
        <ClaimListDialog
            v-if="claimDialog.visible"
            :visible.sync="claimDialog.visible"
            :data-id="claimDialog.dataId"
            :extend-params="claimDialog.extendParams"
        />
        <MaintainListDialog
            v-if="listDialogVisible"
            :visible.sync="listDialogVisible"
            :data-id="listDialogData.dataId"
            :extend-params="listDialogData"
        />
    </div>
</template>
<script>
    // 工具
    import enums from '@/utils/enum'
    import { getPriceFormat } from '@/utils'
    // API
    import billReceivableApi from '@/api/businessDocuments/billReceivable'
    import projectApi from '@/api/PM/project'
    import customerApi from '@/api/PM/customer'
    import sectionApi from '@/api/PM/section'
    // 组件
    import ClaimListDialog from './ClaimListDialog'
    import MaintainListDialog from './../../AP/accountsPayable/MaintainListDialog'
    export default {
        components: {
            ClaimListDialog,
            MaintainListDialog
        },
        props: {},
        data() {
            const that = this
            return {
                listDialogVisible: false,
                listDialogData: {
                    dataId: null,
                    approvalIds: null
                },
                projectRemoteMethod: projectApi.getList,
                customerRemoteMethod: customerApi.getList,
                sectionRemoteMethod: sectionApi.getList,
                // 详情窗口
                dialogData: {},
                dialogVisible: false,
                // 认领信息窗口
                claimDialog: {
                    visible: false,
                    extendParams: {},
                    dataId: null
                },
                tableData: {
                    list: [],
                    total: 0,
                    options: {
                        showSummary: true,
                        summaryMethod: this.handleSummary,
                        stripe: true,
                        fit: true,
                        loading: false,
                        curRowKey: 'id' // 高亮当前判断的 key
                    },
                    // 列操作按钮
                    operates: {
                        width: 60,
                        fixed: 'right',
                        show: false
                    },
                    columns: [
                        {
                            label: '账单编号',
                            prop: 'code',
                            minWidth: 120
                        },
                        {
                            label: '关联单据',
                            prop: 'approvalCode',
                            width: 200,
                            isClick: true,
                            onClick: ($event) => { this.showDetail($event) }
                        },
                        {
                            label: '项目',
                            prop: 'projectName',
                            width: 200,
                            isClick: true,
                            dialogType: 'project',
                            idKey: 'projectId'
                        },
                        {
                            label: '标段',
                            prop: 'sectionName',
                            width: 200,
                            isClick: true,
                            dialogType: 'sections',
                            idKey: 'sectionId'
                        },
                        {
                            label: '客户',
                            prop: 'customerName',
                            width: 200,
                            isClick: true,
                            dialogType: 'customer',
                            idKey: 'customerId'
                        },
                        {
                            label: '费用类型',
                            prop: 'costType',
                            width: 120,
                            formatter: (params, formData) => {
                                return (that.getDict('costType').find(v => v.value === params[formData.prop]) || {}).label || '- -'
                            }
                        },
                        {
                            label: '应收金额(元)',
                            prop: 'amountReceivable',
                            dbProp: 'c_amount_receivable',
                            width: 150,
                            sortable: 'custom',
                            align: 'right',
                            type: 'money'
                        },
                        {
                            label: '出库应收金额(元)',
                            prop: 'outAmountReceivable',
                            dbProp: 'c_out_amount_receivable',
                            width: 150,
                            sortable: 'custom',
                            align: 'right',
                            type: 'money'
                        },
                        {
                            label: '已收款(元)',
                            prop: 'amountReceived',
                            dbProp: 'c_amount_received',
                            width: 150,
                            sortable: 'custom',
                            align: 'right',
                            type: 'money',
                            render: (h, { row, column }) => {
                                return <div class='link-text' onClick={() => { this.showNormalClaimList(row) }}>{getPriceFormat(row.amountReceived)}</div>
                            }
                        },
                        {
                            label: '核减应收(元)',
                            prop: 'subtractAmount',
                            width: 150,
                            sortable: 'custom',
                            align: 'right',
                            type: 'money',
                            render: (h, { row, column }) => {
                                return <div class='link-text' onClick={() => { this.showSubtractClaimList(row) }}>{getPriceFormat(row.subtractAmount)}</div>
                            }
                        },
                        {
                            label: '剩余应收(元)',
                            prop: 'amountRemain',
                            dbProp: 'c_amount_remain',
                            width: 150,
                            align: 'right',
                            sortable: 'custom',
                            type: 'money'
                        },
                        {
                            label: '生成日期',
                            prop: 'createTime',
                            dbProp: 'c_create_time',
                            width: 150,
                            type: 'date'
                        }
                    ]
                },
                searchParam: {
                    pageIndex: 1,
                    pageSize: 15,
                    amountReceived: []
                },
                summaryData: {
                    amountReceivable: 0,
                    outAmountReceivable: 0,
                    amountReceived: 0,
                    subtractAmount: 0,
                    amountRemain: 0
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
            this.init()
        },
        methods: {
            /** 初始化 */
            init() {
                this.getList()
            },
            /** 加载数据 */
            // 获取客户列表数据
            async getList() {
                this.tableData.options.loading = true
                const params = {
                    ...this.searchParam
                }
                const res = await billReceivableApi.getList(params)
                if (res.success) {
                    this.tableData.list = res.data.records
                    this.tableData.total = res.data.total
                    const summaryParams = Object.assign({}, this.searchParam)
                    delete summaryParams.pageIndex
                    delete summaryParams.pageSize
                    const summaryRes = await billReceivableApi.getSummary(summaryParams)
                    if (summaryRes.success) {
                        this.summaryData = summaryRes.data
                    }
                }
                this.tableData.options.loading = false
            },
            /** 事件处理 */
            /** 显示正常  receivableType 收款类型,0正常;1冲抵单*/
            showNormalClaimList(row) {
                this.claimDialog.extendParams = {
                    billReceivableId: row.guidId,
                    receivableType: 0
                }
                this.claimDialog.dataId = row.guidId
                this.claimDialog.visible = true
            },
            /** 显示核减  receivableType 收款类型,0正常;1冲抵单*/
            showSubtractClaimList(row) {
                this.claimDialog.extendParams = {
                    billReceivableId: row.guidId,
                    receivableType: 1
                }
                this.claimDialog.dataId = row.guidId
                this.claimDialog.visible = true
            },
            // 详情
            showDetail(row) {
                if (row.approvalCode && row.approvalIds) {
                    this.listDialogData.dataId = row.guidId
                    this.listDialogData.approvalIds = row.approvalIds
                    this.listDialogVisible = true
                    return
                }
                const dialogType = enums.costType.find(v => v.value === row.costType).dialogType
                if (!dialogType) {
                    this.$message({ type: 'warning', message: '暂不支持查看本单据详情' })
                }
                this.dialogData = {
                    type: dialogType,
                    dataId: row.approvalId,
                    rowData: row,
                    extendParams: {}
                }
                this.dialogVisible = true
            },
            // 搜索
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
            // 导出
            handleExport() {
                const data = { ...this.searchParam }
                data.pageSize = this.tableData.total
                billReceivableApi.export(this.searchParam)
            },
            // 合计
            handleSummary({ columns, data }) {
                const sums = []
                columns.forEach((column, index) => {
                    if (index === 0) {
                        sums[index] = '合计'
                        return
                    }
                    if (index === 7) {
                        sums[index] = getPriceFormat(this.summaryData.amountReceivable) + ' 元'
                    }
                    if (index === 8) {
                        sums[index] = getPriceFormat(this.summaryData.outAmountReceivable) + ' 元'
                    }
                    if (index === 9) {
                        sums[index] = getPriceFormat(this.summaryData.amountReceived) + ' 元'
                    }
                    if (index === 10) {
                        sums[index] = getPriceFormat(this.summaryData.subtractAmount) + ' 元'
                    }
                    if (index === 11) {
                        sums[index] = getPriceFormat(this.summaryData.amountRemain) + ' 元'
                    }
                })
                return sums
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
