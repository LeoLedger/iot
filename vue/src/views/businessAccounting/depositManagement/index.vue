<!--
* @description  押金管理 - 列表
* @author 望浩然
!-->
<template>
    <div class="section-container">
        <layout-template
            :table-columns.sync="tableData.columns"
            :filter-model.sync="searchParam"
            @search="handleSearch"
        >
            <template slot="button">
                <el-button
                    v-waves
                    v-prereclick
                    type="warning"
                    size="mini"
                    class="filter-item"
                    icon="el-icon-download"
                    @click="handleExport"
                >导出</el-button>
            </template>
            <template slot="filter">
                <el-input
                    v-model="searchParam.contractCode"
                    clearable
                    class="filter-item"
                    size="mini"
                    placeholder="合同编号"
                    @change="handleSearch"/>
            </template>
            <template slot="filter-popup">
                <layout-filter-item label="有关项目">
                    <RemoteSelect
                        v-model="searchParam.projectId"
                        :method="projectRemoteMethod"
                        :extend-params="{ status: 1 }"
                        label-key="projectName"
                        value-key="guidId"
                        filter-label-key="projectName"
                        placeholder="选择项目"
                        clearable
                        class="filter-item"
                    />
                </layout-filter-item>
                <layout-filter-item label="有关客户">
                    <RemoteSelect
                        v-model="searchParam.customerId"
                        :method="customerRemoteMethod"
                        label-key="name"
                        value-key="guidId"
                        filter-label-key="name"
                        placeholder="选择客户"
                        clearable
                        class="filter-item"
                    />
                </layout-filter-item>
                <layout-filter-item label="有关标段">
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
        <ReceiveDialog
            v-if="receiveDialog.visible"
            :extend-params="receiveDialog.extendParams"
            :visible.sync="receiveDialog.visible"
            title="已收取费用"
        />
        <ReceiveDialog
            v-if="cashDialog.visible"
            :extend-params="cashDialog.extendParams"
            :visible.sync="cashDialog.visible"
            title="已收取押金"
        />
        <PaymentDialog
            v-if="returnCashDialog.visible"
            :extend-params="returnCashDialog.extendParams"
            :visible.sync="returnCashDialog.visible"
            title="已退还押金"
        />
    </div>
</template>
<script>
    // API
    import cashApi from '@/api/businessDocuments/cashPledge'
    import projectApi from '@/api/PM/project'
    import customerApi from '@/api/PM/customer'
    import sectionApi from '@/api/PM/section'
    import ReceiveDialog from '@/views/businessAccounting/depositManagement/components/ReceiveDialog'
    import PaymentDialog from '@/views/businessAccounting/depositManagement/components/PaymentDialog'
    // 组件
    export default {
        components: {
            PaymentDialog,
            ReceiveDialog
        },
        props: {},
        data() {
            // const that = this
            return {
                projectRemoteMethod: projectApi.getList,
                customerRemoteMethod: customerApi.getList,
                sectionRemoteMethod: sectionApi.getList,
                receiveDialog: {
                    visible: false,
                    extendParams: {}
                },
                cashDialog: {
                    visible: false,
                    extendParams: {}
                },
                returnCashDialog: {
                    visible: false,
                    extendParams: {}
                },
                tableData: {
                    list: [],
                    total: 0,
                    options: {
                        stripe: true,
                        fit: true,
                        loading: false,
                        curRowKey: 'id' // 高亮当前判断的 key
                    },
                    // 列操作按钮
                    operates: {
                        width: 60,
                        fixed: 'right'
                    },
                    columns: [
                        {
                            label: '合同编号',
                            prop: 'contractCode',
                            minWidth: 120,
                            idKey: 'contractId',
                            isClick: true,
                            dialogType: 'salesContract'
                        },
                        {
                            label: '项目',
                            prop: 'projectName',
                            width: 200
                        },
                        {
                            label: '客户',
                            prop: 'customerName',
                            width: 200
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
                            label: '合同押金(元)',
                            prop: 'amountCashPledge',
                            width: 150,
                            type: 'money',
                            align: 'right',
                            sortable: 'custom',
                            dbProp: 'c_amount_cash_pledge'
                        },
                        {
                            label: '已收取(元)',
                            prop: 'amountReceived',
                            width: 150,
                            type: 'money',
                            align: 'right',
                            isClick: true,
                            sortable: 'custom',
                            dbProp: 'c_amount_received',
                            onClick: (row) => { this.showDetail(row, 'receiveDialog') }
                        },
                        {
                            label: '剩余应收(元)',
                            prop: 'amountRemain',
                            width: 150,
                            type: 'money',
                            align: 'right',
                            sortable: 'custom',
                            dbProp: 'c_amount_remain'
                        },
                        {
                            label: '已退还(元)',
                            prop: 'amountVerify',
                            width: 150,
                            type: 'money',
                            align: 'right',
                            isClick: true,
                            sortable: 'custom',
                            dbProp: 'c_amount_verify',
                            onClick: (row) => { this.showDetail(row, 'returnCashDialog') }
                        },
                        {
                            label: '扣除押金(元)',
                            prop: 'amountDeduct',
                            width: 150,
                            type: 'money',
                            align: 'right',
                            sortable: 'custom',
                            isClick: true,
                            dbProp: 'c_amount_deduct',
                            onClick: (row) => { this.showDetail(row, 'cashDialog') }
                        },
                        {
                            label: '未核销(元)',
                            prop: 'amountUnverify',
                            width: 150,
                            type: 'money',
                            align: 'right',
                            sortable: 'custom',
                            dbProp: 'c_amount_unverify'
                        }
                    ]
                },
                searchParam: {
                    pageIndex: 1,
                    pageSize: 15
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
                const res = await cashApi.getList(params)
                if (res.success) {
                    this.tableData.list = res.data.records
                    this.tableData.total = res.data.total
                }
                this.tableData.options.loading = false
            },
            /** 事件处理 */
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
                cashApi.export(this.searchParam)
            },
            // 显示详情
            showDetail(row, prop) {
                if (prop === 'receiveDialog') {
                    this[prop].extendParams = {
                        approvalCode: row.contractCode,
                        approvalId: row.contractId,
                        costType: 0
                    }
                }
                if (prop === 'cashDialog') {
                    this[prop].extendParams = {
                        contractId: row.contractId,
                        costType: 4
                    }
                }
                if (prop === 'returnCashDialog') {
                    this[prop].extendParams = {
                        approvalId: row.contractId
                    }
                }
                this[prop].visible = true
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
