<!--
* @description  认领信息 - 列表
* @author 望浩然
!-->
<template>
    <div class="section-container" style="height: 100%">
        <layout-filter
            :table-columns.sync="tableData.columns"
            :filter-model.sync="searchParam"
            :filter-button="checkFeature(['ty.iot.paymentRecord.claim.search'])"
            @search="handleSearch"
        >
            <template slot="button">
                <el-button
                    v-waves
                    v-prereclick
                    v-if="checkFeature(['ty.iot.paymentRecord.claim.export'])"
                    type="warning"
                    size="mini"
                    class="filter-item"
                    icon="el-icon-download"
                    @click="handleExport"
                >导出</el-button>
            </template>
            <template slot="filter">
                <el-input
                    v-model="searchParam.recordCode"
                    clearable
                    class="filter-item"
                    size="mini"
                    placeholder="付款流水"
                    @change="handleSearch"/>
            </template>
            <template slot="filter-popup">
                <layout-filter-item label="账单编号">
                    <el-input
                        v-model="searchParam.billPayCode"
                        clearable
                        class="filter-item"
                        size="mini"
                        placeholder="账单编号"/>
                </layout-filter-item>
                <layout-filter-item label="关联单据">
                    <el-input
                        v-model="searchParam.approvalCode"
                        clearable
                        class="filter-item"
                        size="mini"
                        placeholder="关联单据"/>
                </layout-filter-item>
                <layout-filter-item label="供应商/客户">
                    <el-input
                        v-model="searchParam.payObjectName"
                        clearable
                        class="filter-item"
                        size="mini"
                        placeholder="供应商/客户名称"/>
                </layout-filter-item>
                <layout-filter-item label="费用类型">
                    <DictSelect
                        v-model="searchParam.payType"
                        type="payType"
                        placeholder="费用类型"
                        clearable
                        filterable
                        class="filter-item"
                        size="mini"
                    />
                </layout-filter-item>
                <layout-filter-item label="认领金额">
                    <el-input
                        v-model="searchParam.amount"
                        placeholder="认领金额"
                        type="number"
                        class="filter-item"
                    />
                </layout-filter-item>
                <layout-filter-item label="认领人">
                    <el-input
                        v-model="searchParam.userName"
                        placeholder="认领人名称"
                        type="number"
                        class="filter-item"
                    />
                    <!--                    <RemoteSelect-->
                    <!--                        v-model="searchParam.userId"-->
                    <!--                        :method="userRemoteMethod"-->
                    <!--                        label-key="userName"-->
                    <!--                        value-key="userId"-->
                    <!--                        filter-label-key="userName"-->
                    <!--                        placeholder="选择认领人"-->
                    <!--                        clearable-->
                    <!--                        class="filter-item"-->
                    <!--                    />-->
                </layout-filter-item>
                <layout-filter-item label="认领时间">
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
            </template>
            <template slot="table">
                <TableComponent
                    v-bind="tableData"
                    :page-index.sync="searchParam.pageIndex"
                    :page-size.sync="searchParam.pageSize"
                    @refreshList="handleSearch"
                />
            </template>
        </layout-filter>
        <!-- 详情弹窗 -->
        <PublicDetailDialog
            v-if="dialogVisible"
            v-bind="dialogData"
            :visible.sync="dialogVisible"
        />
        <InvoiceDialog
            v-if="invoiceDialog.visible"
            :visible.sync="invoiceDialog.visible"
            :row-data="invoiceDialog.rowData"
            :cost-type="invoiceDialog.costType"
        />
    </div>
</template>
<script>
    // 工具
    import enums from '@/utils/enum'
    // API
    import claimApi from '@/api/businessDocuments/billPayRecord'
    import customerApi from '@/api/PM/customer'
    import resApi from '@/api/resource'
    // 组件
    import InvoiceDialog from '@/views/public/InvoiceDialog/Detail'
    export default {
        components: {
            InvoiceDialog
        },
        props: {},
        data() {
            return {
                // 详情窗口
                dialogData: {},
                dialogVisible: false,
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
                        fixed: 'right',
                        show: false
                    },
                    columns: [
                        {
                            label: '账单编号',
                            prop: 'billPayCode',
                            minWidth: 150
                        },
                        {
                            label: '付款流水号',
                            prop: 'recordCode',
                            width: 150,
                            isClick: true,
                            dialogType: 'paymentRecord',
                            idKey: 'billPayRecordId',
                            dbProp: 'tbpr.c_bill_pay_record_code',
                            sortable: 'custom'
                        },
                        {
                            label: '关联单据',
                            prop: 'approvalCode',
                            width: 150,
                            isClick: true,
                            onClick: ($event) => { this.showDetail($event) }
                        },
                        {
                            label: '供应商/客户',
                            prop: 'payObjectName',
                            width: 150
                        },
                        {
                            label: '费用类型',
                            prop: 'payType',
                            width: 100,
                            type: 'dict',
                            dictType: 'payType'
                        },
                        {
                            label: '认领金额(元)',
                            prop: 'amount',
                            width: 100,
                            align: 'right',
                            type: 'money',
                            dbProp: 'tbprrpt.c_amount',
                            sortable: 'custom'
                        },
                        {
                            label: '认领人',
                            prop: 'userName',
                            width: 120
                        },
                        {
                            label: '操作日期',
                            prop: 'createTime',
                            width: 150,
                            type: 'date',
                            dbProp: 'tbprrpt.c_create_time',
                            sortable: 'custom'
                        },
                        {
                            label: '备注',
                            prop: 'remark',
                            width: 300
                        }
                    ]
                },
                searchParam: {
                    pageIndex: 1,
                    pageSize: 15
                },
                // 发票窗口
                invoiceDialog: {
                    visible: false,
                    rowData: null,
                    costType: null
                },
                customerRemoteMethod: customerApi.getList,
                userRemoteMethod: resApi.getUserList
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
                const res = await claimApi.getClaimList(params)
                if (res.success) {
                    this.tableData.list = res.data.records
                    this.tableData.total = res.data.total
                }
                this.tableData.options.loading = false
            },
            /** 事件处理 */
            // 详情
            showDetail(row) {
                const dialogType = enums.payType.find(v => v.value === row.payType).dialogType
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
                claimApi.export(this.searchParam)
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
