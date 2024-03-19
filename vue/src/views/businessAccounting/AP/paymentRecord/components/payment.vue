<!--
* @description  付款记录 - 列表
* @author 望浩然
!-->
<template>
    <div class="section-container" style="height: 100%">
        <layout-filter
            :table-columns.sync="tableData.columns"
            :filter-model.sync="searchParam"
            :filter-button="checkFeature(['ty.iot.paymentRecord.payment.search'])"
            @search="handleSearch"
        >
            <template slot="button">
                <el-button
                    v-waves
                    v-prereclick
                    v-if="checkFeature(['ty.iot.paymentRecord.payment.export'])"
                    type="warning"
                    size="mini"
                    class="filter-item"
                    icon="el-icon-download"
                    @click="handleExport"
                >导出</el-button>
                <el-button
                    v-waves
                    v-prereclick
                    v-if="checkFeature(['ty.iot.paymentRecord.payment.create'])"
                    type="success"
                    size="mini"
                    class="filter-item"
                    icon="el-icon-plus"
                    @click="handleCreate"
                >登记</el-button>
                <ImportButton
                    v-if="checkFeature(['ty.iot.paymentRecord.payment.import'])"
                    :download-method="handleDownloadTemplate"
                    class="filter-item"
                    type="primary"
                    action="/bill-pay-record/import"
                    title="付款记录导入"
                    template-name="付款记录模板.xlsx"
                    @success="handleImportConfirm"
                />
            </template>
            <template slot="filter">
                <el-input
                    v-model="searchParam.code"
                    clearable
                    class="filter-item"
                    size="mini"
                    placeholder="付款流水"/>
            </template>
            <template slot="filter-popup">
                <layout-filter-item label="付款对象">
                    <el-input
                        v-model="searchParam.objectName"
                        clearable
                        class="filter-item"
                        size="mini"
                        placeholder="付款对象名称"/>
                </layout-filter-item>
                <layout-filter-item label="客户/供应商">
                    <el-input
                        v-model="searchParam.payObjectName"
                        clearable
                        class="filter-item"
                        size="mini"
                        placeholder="客户/供应商名称"/>
                </layout-filter-item>
              <layout-filter-item label="付款类型">
                <DictSelect
                  v-model="searchParam.payType"
                  type="paymentRecordType"
                  placeholder="选择付款类型"
                  clearable
                  filterable
                  size="mini"/>
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
                <layout-filter-item label="生成日期">
                    <el-date-picker
                        v-model="searchParam.createDate"
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
                    :page-index.sync="searchParam.pageIndex"
                    :page-size.sync="searchParam.pageSize"
                    @refreshList="handleSearch"
                >
                    <template slot="操作" slot-scope="scope">
                        <el-dropdown
                            v-if="includeFeature(['ty.iot.paymentRecord.payment.claim', 'ty.iot.paymentRecord.payment.update', 'ty.iot.paymentRecord.payment.delete'])"
                            trigger="click"
                            size="small">
                            <el-button
                                size="mini"
                                icon="el-icon-more"
                                title="操作"
                            />
                            <el-dropdown-menu slot="dropdown">
                                <div v-if="scope.row.status === 0 && checkFeature(['ty.iot.paymentRecord.payment.claim'])" class="layout-dropdown-item" @click="handleClaim(scope.row)">
                                    <el-dropdown-item icon="el-icon-circle-check" divided>认领</el-dropdown-item>
                                </div>
                                <div v-if="scope.row.status >= 1 && checkFeature(['ty.iot.paymentRecord.payment.claim'])" class="layout-dropdown-item" @click="handleReclaim(scope.row)">
                                    <el-dropdown-item icon="el-icon-circle-check" divided>重置认领</el-dropdown-item>
                                </div>
                                <div v-if="scope.row.status === 0 && checkFeature(['ty.iot.paymentRecord.payment.update'])" class="layout-dropdown-item" @click="handleEdit(scope.row)">
                                    <el-dropdown-item icon="el-icon-edit" divided>编辑</el-dropdown-item>
                                </div>
                                <div v-if="scope.row.status === 0 && checkFeature(['ty.iot.paymentRecord.payment.delete'])" class="layout-dropdown-item" @click="handleDelete(scope.row)">
                                    <el-dropdown-item icon="el-icon-delete" divided>删除</el-dropdown-item>
                                </div>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </template>
                </TableComponent>
            </template>
        </layout-filter>
        <CreateDialog
            v-if="createPaymentDialog.visible"
            :visible.sync="createPaymentDialog.visible"
            :data-id="createPaymentDialog.dataId"
            @close="createPaymentDialog.visible = false"
            @confirm="getList"
        />
        <ClaimDialog
            v-if="claimDialog.visible"
            :visible.sync="claimDialog.visible"
            :data-id="claimDialog.dataId"
            @close="claimDialog.visible = false"
            @confirm="getList" />
    </div>
</template>
<script>
    // API
    import billPayRecordApi from '@/api/businessDocuments/billPayRecord'
    import projectApi from '@/api/PM/project'
    import customerApi from '@/api/PM/customer'
    import sectionApi from '@/api/PM/section'
    import resourceApi from '@/api/resource'
    import recordApi from '@/api/businessDocuments/billPayRecord'
    // 组件
    import CreateDialog from './CreateDialog'
    import ClaimDialog from './ClaimDialog'
    import ImportButton from '@/components/customizeFormItem/ImportButton'
    import enums from '@/utils/enum'
    export default {
        components: {
            CreateDialog, ImportButton, ClaimDialog
        },
        props: {},
        data() {
            return {
                projectRemoteMethod: projectApi.getList,
                customerRemoteMethod: customerApi.getList,
                sectionRemoteMethod: sectionApi.getList,
                userRemoteMethod: resourceApi.getUserList,
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
                            label: '付款流水',
                            prop: 'code',
                            minWidth: 120,
                            isClick: true,
                            dialogType: 'paymentRecord',
                            idKey: 'guidId'
                        },
                        {
                            label: '付款对象',
                            prop: 'objectName',
                            width: 200
                        },
                        {
                            label: '客户/供应商',
                            prop: 'payObjectName',
                            width: 200
                        },
                        {
                            label: '付款金额(元)',
                            prop: 'amountPay',
                            dbProp: 'c_amount_pay',
                            width: 150,
                            sortable: 'custom',
                            align: 'right',
                            type: 'money'
                        },
                        {
                            label: '付款时间',
                            prop: 'payDate',
                            dbProp: 'c_pay_date',
                            width: 150,
                            sortable: 'custom',
                            type: 'date'
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
                            prop: 'payType',
                            label: '付款类型',
                            type: 'dict',
                            dictType: 'paymentRecordType'
                        },
                        {
                            label: '登记日期',
                            prop: 'createTime',
                            dbProp: 'c_create_time',
                            width: 150,
                            type: 'date',
                            sortable: 'custom'
                        },
                        {
                            label: '登记人',
                            prop: 'userName',
                            width: 150
                        },
                        {
                            label: '备注',
                            prop: 'remark',
                            width: 150
                        }
                    ]
                },
                searchParam: {
                    pageIndex: 1,
                    pageSize: 15
                },
                createPaymentDialog: {
                    visible: false,
                    dataId: null
                },
                claimDialog: {
                    visible: false,
                    dataId: null,
                    isReclaim: false
                },
                importDialog: {
                    visible: false
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
                const res = await billPayRecordApi.getList(params)
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
            // 认领
            handleClaim(row) {
                this.claimDialog.dataId = row.guidId
                this.claimDialog.visible = true
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
                    recordApi.adopted(row).then(res => {
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
            // 编辑
            handleEdit(row) {
                this.createPaymentDialog.dataId = row.guidId
                this.createPaymentDialog.visible = true
            },
            // 删除
            handleDelete(row) {
                const _this = this
                this.$confirm('是否确认删除该付款记录?', '警告', {
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
            // 导出
            handleExport() {
                const data = { ...this.searchParam }
                data.pageSize = this.tableData.total
                billPayRecordApi.export(this.searchParam)
            },
            // 登记
            handleCreate() {
                this.createPaymentDialog.visible = true
                this.createPaymentDialog.dataId = null
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
