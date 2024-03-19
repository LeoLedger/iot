<!--
* @description  收款记录 - 列表
* @author 望浩然
!-->
<template>
    <div class="" style="height: 100%">
        <layout-filter
            :table-columns.sync="tableData.columns"
            :filter-model.sync="searchParam"
            :filter-button="checkFeature(['ty.iot.collectionRecord.collection.search'])"
            @search="handleSearch"
        >
            <template slot="button">
                <el-button
                    v-waves
                    v-prereclick
                    v-if="checkFeature(['ty.iot.collectionRecord.collection.export'])"
                    type="warning"
                    size="mini"
                    class="filter-item"
                    icon="el-icon-download"
                    @click="handleExport"
                >导出</el-button>
                <el-button
                    v-waves
                    v-prereclick
                    v-if="checkFeature(['ty.iot.collectionRecord.collection.create'])"
                    type="success"
                    size="mini"
                    class="filter-item"
                    icon="el-icon-plus"
                    @click="handleCreate"
                >登记</el-button>
                <ImportButton
                    v-if="checkFeature(['ty.iot.collectionRecord.collection.import'])"
                    :download-method="handleDownloadTemplate"
                    class="filter-item"
                    action="bill-receivable-record/import"
                    type="primary"
                    title="收款记录导入"
                    template-name="收款记录模板.xlsx"
                    @success="handleImportConfirm"
                />
            </template>
            <template slot="filter">
                <el-input
                    v-model="searchParam.code"
                    clearable
                    class="filter-item"
                    size="mini"
                    placeholder="流水号"
                    @change="handleSearch"/>
            </template>
            <template slot="filter-popup">
                <layout-filter-item label="收款对象">
                    <el-input
                        v-model="searchParam.objectName"
                        clearable
                        class="filter-item"
                        size="mini"
                        placeholder="收款对象名称"/>
                </layout-filter-item>
                <layout-filter-item label="客户单位">
                    <RemoteSelect
                        v-model="searchParam.customerId"
                        :method="customerRemoteMethod"
                        label-key="name"
                        value-key="guidId"
                        filter-label-key="name"
                        placeholder="选择客户单位"
                        clearable
                        class="filter-item"
                    />
                </layout-filter-item>
                <layout-filter-item label="收款类型">
                    <DictSelect
                        v-model="searchParam.receivableType"
                        type="paymentRecordType"
                        placeholder="选择收款类型"
                        clearable
                        filterable
                        size="mini"/>
                </layout-filter-item>
                <layout-filter-item label="到账时间">
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
                <layout-filter-item label="认领状态">
                    <DictSelect
                        v-model="searchParam.status"
                        type="claimStatus"
                        placeholder="认领状态"
                        clearable
                        filterable
                        class="filter-item"
                        size="mini"
                    />
                </layout-filter-item>
                <layout-filter-item label="登记日期">
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
                <layout-filter-item label="登记人">
                    <RemoteSelect
                        v-model="searchParam.userId"
                        :method="userRemoteMethod"
                        label-key="userName"
                        value-key="userId"
                        filter-label-key="userName"
                        placeholder="选择登记人"
                        clearable
                        class="filter-item"
                    />
                </layout-filter-item>
            </template>
            <template slot="table">
                <TableComponent
                    v-bind="tableData"
                    :cur_row="currentRow"
                    :page-index.sync="searchParam.pageIndex"
                    :page-size.sync="searchParam.pageSize"
                    @refreshList="handleSearch"
                >
                    <template slot="操作" slot-scope="scope">
                        <el-dropdown
                            v-if="includeFeature(['ty.iot.collectionRecord.collection.claim', 'ty.iot.collectionRecord.collection.update', 'ty.iot.collectionRecord.collection.delete'])"
                            trigger="click"
                            size="small"
                        >
                            <el-button
                                size="mini"
                                icon="el-icon-more"
                                title="操作"
                            />
                            <el-dropdown-menu slot="dropdown">
                                <div v-if="scope.row.status === 0 && checkFeature(['ty.iot.collectionRecord.collection.claim'])" class="layout-dropdown-item" @click="handleClaim(scope.row)">
                                    <el-dropdown-item icon="el-icon-circle-check" divided>认领</el-dropdown-item>
                                </div>
                                <div v-if="scope.row.status >= 1 && checkFeature(['ty.iot.collectionRecord.collection.claim'])" class="layout-dropdown-item" @click="handleReclaim(scope.row)">
                                    <el-dropdown-item icon="el-icon-circle-check" divided>重置认领</el-dropdown-item>
                                </div>
                                <div v-if="scope.row.status === 0 && checkFeature(['ty.iot.collectionRecord.collection.update'])" class="layout-dropdown-item" @click="handleEdit(scope.row)">
                                    <el-dropdown-item icon="el-icon-edit" divided>编辑</el-dropdown-item>
                                </div>
                                <div v-if="scope.row.status === 0 && checkFeature(['ty.iot.collectionRecord.collection.delete'])" class="layout-dropdown-item" @click="handleDelete(scope.row)">
                                    <el-dropdown-item icon="el-icon-delete" divided>删除</el-dropdown-item>
                                </div>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </template>
                </TableComponent>
            </template>
        </layout-filter>
        <CreateDialog
            v-if="createDialog.visible"
            :visible="createDialog.visible"
            :data-id="createDialog.dataId"
            @close="createDialog.visible = false"
            @confirm="handleConfirm"
        />
        <ClaimDialog
            v-if="claimDialog.visible"
            :visible="claimDialog.visible"
            :data-id="claimDialog.dataId"
            @close="claimDialog.visible = false"
            @confirm="handleClaimConfirm" />
    </div>
</template>
<script>
    // 工具
    import enums from '@/utils/enum'
    // API
    import recordApi from '@/api/businessDocuments/billReceivableRecord'
    import resApi from '@/api/resource'
    import customerApi from '@/api/PM/customer'
    // 组件
    import CreateDialog from './CreateCollection'
    import ClaimDialog from './ClaimDialog'
    import ImportButton from '@/components/customizeFormItem/ImportButton'
    import claimApi from '@/api/businessDocuments/billReceivableRecordClaim'
    export default {
        components: {
            ImportButton,
            CreateDialog,
            ClaimDialog
        },
        props: {},
        data() {
            return {
                currentRow: null,
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
                        show: true
                    },
                    columns: [
                        {
                            label: '流水号',
                            prop: 'code',
                            minWidth: 120,
                            isClick: true,
                            dialogType: 'collectionRecord',
                            idKey: 'guidId'
                        },
                        {
                            label: '客户',
                            prop: 'customerName',
                            minWidth: 250
                        },
                        {
                            label: '收款对象',
                            prop: 'objectName',
                            minWidth: 250
                        },
                        {
                            label: '收款金额(元)',
                            prop: 'amountReceived',
                            dbProp: 'c_amount_received',
                            width: 150,
                            sortable: 'custom',
                            align: 'right',
                            type: 'money'
                        },
                        {
                          label: '收款银行名称',
                          prop: 'bankName',
                          dbProp: 'c_bank_name',
                          width: 200
                        },
                        {
                            label: '到账时间',
                            prop: 'payDate',
                            dbProp: 'c_pay_date',
                            width: 150,
                            type: 'date',
                            sortable: 'custom'
                        },
                        {
                            label: '认领状态',
                            prop: 'status',
                            width: 100,
                            align: 'center',
                            style: 'dot',
                            type: 'status',
                            enums: enums.claimStatus
                        },
                        {
                            prop: 'receivableType',
                            label: '收款类型',
                            type: 'dict',
                            dictType: 'paymentRecordType'
                        },
                        {
                            label: '登记日期',
                            prop: 'createTime',
                            dbProp: 'c_create_time',
                            width: 120,
                            sortable: 'custom',
                            type: 'date'
                        },
                        {
                            label: '登记人',
                            prop: 'createName',
                            width: 150,
                            dialogType: 'people',
                            idKey: 'createId'
                        },
                        {
                            label: '备注',
                            prop: 'remark',
                            width: 350
                        }
                    ]
                },
                searchParam: {
                    pageIndex: 1,
                    pageSize: 15
                },
                createDialog: {
                    visible: false
                },
                claimDialog: {
                    visible: false,
                    dataId: null,
                    isReclaim: false
                },
                importDialog: {
                    visible: false
                },
                userRemoteMethod: resApi.getUserList,
                customerRemoteMethod: customerApi.getList
            }
        },
        computed: {},
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
                const res = await recordApi.getList(params)
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
                recordApi.export(this.searchParam)
            },
            // 导入
            handleImport() {
                this.importDialog.visible = true
            },
            // 登记
            handleCreate() {
                this.createDialog.visible = true
                this.createDialog.dataId = null
            },
            // 认领
            handleClaim(row) {
                this.claimDialog.visible = true
                this.claimDialog.dataId = row.guidId
                this.claimDialog.isReclaim = false
            },
            handleReclaim(row) {
                const _this = this
                this.$confirm('是否确认重置该认领记录?', '警告', {
                    confirmButtonText: '删除',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                }).then(() => {
                    claimApi.adopted(row).then(res => {
                        if (res.success) {
                            _this.getList()
                            _this.$notify({
                                title: '成功',
                                message: '重置成功',
                                type: 'success',
                                duration: 2000
                            })
                        }
                    })
                }).catch(() => {})
            },
            handleEdit(row) {
                this.createDialog.visible = true
                this.createDialog.dataId = row.guidId
            },
            handleDelete(row) {
                const _this = this
                this.$confirm('是否确认删除该记录?', '警告', {
                    confirmButtonText: '删除',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                }).then(() => {
                    recordApi.delete(row.guidId).then(res => {
                        if (res.success) {
                            _this.getList()
                            _this.$notify({
                                title: '成功',
                                message: '删除成功',
                                type: 'success',
                                duration: 2000
                            })
                        }
                    })
                }).catch(() => {})
            },
            // 登记提交成功
            handleConfirm() {
                this.createDialog.visible = false
                this.getList()
            },
            handleClaimConfirm() {
                this.claimDialog.visible = false
                this.getList()
            },
            handleImportConfirm(data) {
                this.importDialog.visible = false
                this.getList()
                // 判断导入
                if (data) {
                    this.$message({ type: 'success', message: data })
                }
            },
            handleDownloadTemplate() {
                recordApi.export({ tem: 1 }).then(res => {
                    this.$message({ type: 'success', message: '已获取导入模板, 请按模板填写数据后导入' })
                })
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
