<template>
    <el-dialog
        v-if="visible"
        :visible.sync="visible"
        :before-close="handleCancel"
        :close-on-click-modal="false"
        title="应收账款"
        width="1200px"
        append-to-body>
        <layout-filter
            :table-columns.sync="tableData.columns"
            :filter-model.sync="searchParam"
            @search="handleSearch"
        >
            <template slot="filter">
                <el-input
                    v-model="searchParam.projectName"
                    size="mini"
                    placeholder="项目名称"
                    clearable
                    class="filter-item"
                    @change="handleSearch"
                />
                <el-input
                    v-model="searchParam.approvalCode"
                    size="mini"
                    placeholder="关联单据"
                    clearable
                    class="filter-item"
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
            <template slot="table">
                <TableComponent
                    ref="TableComponent"
                    v-bind="tableData"
                    :selected-list="newSelectList"
                    :page-index.sync="searchParam.pageIndex"
                    :page-size.sync="searchParam.pageSize"
                    @refreshList="handleSearch"
                    @handleSelectionChange="handleSelectionChange"
                />
            </template>
            <!-- 详情弹窗 -->
            <PublicDetailDialog
                v-if="dialogVisible"
                v-bind="dialogData"
                :visible.sync="dialogVisible"
            />
        </layout-filter>
        <span slot="footer">
            <el-button size="mini" @click="handleCancel">关 闭</el-button>
            <el-button :loading="tableData.options.loading" size="mini" type="primary" @click="handleSubmit">确 认</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import billReceivableApi from '@/api/businessDocuments/billReceivable'
    import { getPriceFormat } from '@/utils'
    import enums from '@/utils/enum'

    export default {
        props: {
            // 客户guid
            dataId: null,
            // 窗口可视属性
            visible: {
                type: Boolean,
                default: false
            },
            // 已经选入的数据
            selectList: {
                type: Array,
                default: () => []
            }
        },
        data() {
            const that = this
            return {
                newSelectList: [],
                // 详情窗口
                dialogData: {},
                dialogVisible: false,
                searchParam: {
                    pageSize: 15,
                    pageIndex: 1,
                    amountRemainType: 1
                },
                tableData: {
                    list: [],
                    total: 0,
                    columns: [
                        {
                            label: '账单编号',
                            prop: 'code',
                            minWidth: 120
                        },
                        {
                            label: '关联单据',
                            prop: 'approvalCode',
                            minWidth: 120,
                            isClick: true,
                            onClick: ($event) => { this.showDetail($event) }
                        },
                        {
                            label: '项目',
                            prop: 'projectName',
                            minWidth: 120
                        },
                        {
                            label: '客户',
                            prop: 'customerName',
                            minWidth: 120
                        },
                        {
                            label: '标段',
                            prop: 'sectionName',
                            minWidth: 120,
                            isClick: true,
                            dialogType: 'sections',
                            idKey: 'sectionId'
                        },
                        {
                            prop: 'costType',
                            label: '费用类型',
                            formatter: (params, formData) => {
                                return (that.getDict('costType').find(v => v.value === params[formData.prop]) || {}).label || '- -'
                            }
                        },
                        {
                            prop: 'amountReceivable',
                            label: '应收金额',
                            width: 100,
                            align: 'right',
                            formatter: (params, formData) => {
                                return getPriceFormat(params[formData.prop])
                            }
                        },
                        {
                            prop: 'amountReceived',
                            label: '已收取',
                            width: 100,
                            align: 'right',
                            formatter: (params, formData) => {
                                return getPriceFormat(params[formData.prop])
                            }
                        },
                        {
                            prop: 'amountRemain',
                            label: '剩余应收',
                            width: 100,
                            align: 'right',
                            formatter: (params, formData) => {
                                return getPriceFormat(params[formData.prop])
                            }
                        }

                    ],
                    options: {
                        height: '600px',
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        curRowKey: '_idKey',
                        mutiSelect: true,
                        mutiSelectedKey: '_idKey',
                        showMutiSelectList: false,
                        selectable: (row, index) => { return row.amountRemain > 0 }
                    },
                    // 列操作按钮
                    operates: {
                        show: false
                    }
                }
            }
        },
        watch: {
            'searchParam.pageSize'() {
                this.getList()
            },
            'searchParam.pageIndex'() {
                this.getList()
            },
            dataId() {
                this.getList()
            },
            selectList: {
                deep: true,
                immediate: true,
                handler(data) {
                    this.newSelectList = [...this.newSelectList, ...data]
                }
            }
        },
        mounted() {
            this.getList()
        },
        methods: {
            /** 加载数据 */
            // 获取设备列表数据
            async getList() {
                if (this.dataId) {
                    this.tableData.options.loading = true
                    this.searchParam.customerId = this.dataId
                    const params = Object.assign({}, this.searchParam)
                    const res = await billReceivableApi.getList(params)
                    if (res.success) {
                        this.tableData.list = res.data.records.map(item => {
                            item._idKey = item.guidId
                            return item
                        })
                        this.tableData.total = res.data.total
                    }
                    setTimeout(() => {
                        this.tableData.options.loading = false
                    }, 500)
                }
            },
            /** 事件处理 */
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
                    extendParams: {
                        notSelectClick: () => {
                            this.$message.warning('该行数据的剩余应收金额不足，无法选择')
                        }
                    }
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
            // 多选-选中表格行时触发
            handleSelectionChange(val) {
                this.newSelectList = val
            },
            handleCancel() {
                this.$emit('close', false)
                this.$emit('update:visible', false)
            },
            handleSubmit() {
                this.$emit('close', false)
                this.$emit('update:visible', false)
                this.$emit('confirm', this.newSelectList)
            }
        }
    }
</script>

<style scoped>

</style>
