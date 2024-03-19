<!--
* @description  认领信息 - 列表
* @author 望浩然
!-->
<template>
    <div class="section-container" style="height: 100%">
        <layout-filter
            :table-columns.sync="tableData.columns"
            :filter-model.sync="searchParam"
            :filter-button="checkFeature(['ty.iot.collectionRecord.claim.search'])"
            @search="handleSearch"
        >
            <template slot="button">
                <el-button
                    v-waves
                    v-prereclick
                    v-if="checkFeature(['ty.iot.collectionRecord.claim.export'])"
                    type="warning"
                    size="mini"
                    class="filter-item"
                    icon="el-icon-download"
                    @click="handleExport"
                >导出</el-button>
            </template>
            <template slot="filter">
                <el-input
                    v-model="searchParam.receivableCode"
                    clearable
                    class="filter-item"
                    size="mini"
                    placeholder="账单编号"
                    @change="handleSearch"/>
            </template>
            <template slot="filter-popup">
                <layout-filter-item label="收款流水号">
                    <el-input
                        v-model="searchParam.receivableRecordCode"
                        clearable
                        class="filter-item"
                        size="mini"
                        placeholder="收款流水号"/>
                </layout-filter-item>
                <layout-filter-item label="关联单据">
                    <el-input
                        v-model="searchParam.approvaInvoiceCode"
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
                <!--                <layout-filter-item label="开票状态">-->
                <!--                    <DictSelect-->
                <!--                        v-model="searchParam.invoiceType"-->
                <!--                        type="invoiceStatus"-->
                <!--                        placeholder="开票状态"-->
                <!--                        clearable-->
                <!--                        filterable-->
                <!--                        class="filter-item"-->
                <!--                        size="mini"-->
                <!--                    />-->
                <!--                </layout-filter-item>-->
                <layout-filter-item label="认领人">
                    <RemoteSelect
                        v-model="searchParam.userId"
                        :method="userRemoteMethod"
                        label-key="userName"
                        value-key="userId"
                        filter-label-key="userName"
                        placeholder="选择认领人"
                        clearable
                        class="filter-item"
                    />
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
                <layout-filter-item label="付款时间">
                    <el-date-picker
                        v-model="searchParam.payDate"
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
    import claimApi from '@/api/businessDocuments/billReceivableRecordClaim'
    import projectApi from '@/api/PM/project'
    import customerApi from '@/api/PM/customer'
    import sectionApi from '@/api/PM/section'
    import resApi from '@/api/resource'
    import invoiceApi from '@/api/businessDocuments/invoice'
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
                            prop: 'receivableCode',
                            minWidth: 150
                        },
                        {
                            label: '收款流水号',
                            prop: 'receivableRecordCode',
                            width: 150,
                            isClick: true,
                            dialogType: 'collectionRecord',
                            idKey: 'receivableRecordId'
                        },
                        {
                            label: '关联单据',
                            prop: 'approvalCode',
                            width: 150,
                            isClick: true,
                            onClick: ($event) => { this.showDetail($event) }
                        },
                        {
                            label: '项目',
                            prop: 'projectName',
                            width: 150
                        },
                        {
                            label: '客户',
                            prop: 'customerName',
                            width: 150
                        },
                        {
                            label: '标段',
                            prop: 'sectionName',
                            width: 150,
                            isClick: true,
                            dialogType: 'sections',
                            idKey: 'sectionGuid'
                        },
                        {
                            label: '费用类型',
                            prop: 'costType',
                            width: 100,
                            type: 'dict',
                            dictType: 'costType'
                        },
                        {
                            label: '认领金额(元)',
                            prop: 'amount',
                            width: 100,
                            align: 'right',
                            type: 'money'
                        },
                        // {
                        //     label: '状态',
                        //     prop: 'invoiceType',
                        //     type: 'status',
                        //     style: 'dot',
                        //     enums: enums.invoiceStatus,
                        //     width: 100,
                        //     isClick: true,
                        //     sortable: 'custom'
                        // },
                        {
                            label: '认领人',
                            prop: 'userName',
                            width: 120
                        },
                        // {
                        //     label: '开票申请单编号',
                        //     prop: 'approvaInvoiceCode',
                        //     width: 120,
                        //     dialogType: 'invoiceApproval',
                        //     idKey: 'approvaInvoiceId',
                        //     isClick: true
                        // },
                        // {
                        //     label: '发票编号',
                        //     prop: 'invoiceCode',
                        //     width: 80,
                        //     isClick: true,
                        //     onClick: (row) => this.showInvoiceDialog(row)
                        // },
                        {
                            label: '付款日期',
                            prop: 'payDate',
                            width: 150,
                            type: 'date'
                        },
                        {
                            label: '操作日期',
                            prop: 'createTime',
                            width: 150,
                            type: 'date'
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
                    pageSize: 15,
                    payDate: [],
                    createTime: []
                },
                // 发票窗口
                invoiceDialog: {
                    visible: false,
                    rowData: null,
                    costType: null
                },
                projectRemoteMethod: projectApi.getList,
                customerRemoteMethod: customerApi.getList,
                sectionRemoteMethod: sectionApi.getList,
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
                const res = await claimApi.getList(params)
                if (res.success) {
                    this.tableData.list = res.data.records
                    this.tableData.total = res.data.total
                }
                this.tableData.options.loading = false
            },
            /** 事件处理 */
            // 查看发票列表
            showInvoiceDialog(row) {
                if (row.invoiceId) {
                    invoiceApi.invoiceDetail(row.invoiceId).then(res => {
                        if (res.success) {
                            this.invoiceDialog.rowData = res.data
                            this.invoiceDialog.visible = true
                            this.invoiceDialog.costType = row.costType
                        } else this.$message.error('未找到相关数据')
                    })
                } else this.$message.warning('缺少必要参数')
            },
            // 详情
            showDetail(row) {
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
                claimApi.export(this.searchParam)
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
