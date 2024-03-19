<template>
    <el-dialog
        v-if="visible"
        :visible.sync="visible"
        :before-close="handleCancel"
        :close-on-click-modal="false"
        :title="title"
        class=""
        width="1080px"
        append-to-body>
        <div class="layout-detail-container">
            <TableComponent
                ref="TableComponentContacts"
                v-bind="tableData"
                :page-index.sync="searchParam.pageIndex"
                :page-size.sync="searchParam.pageSize"
                :list="tableData.list"
                @refreshList="handleSearch"
            />
        </div>
        <span slot="footer">
            <el-button size="mini" @click="$emit('update:visible', false)">取 消</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import mainApi from '@/api/businessDocuments/billPayRecord'

    export default {
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            extendParams: {
                type: Object,
                default: () => {}
            },
            title: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                tableData: {
                    list: [],
                    total: 0,
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
                            width: 150
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
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    },
                    // 列操作按钮
                    operates: {
                        width: 120,
                        fixed: 'right'
                    }
                },
                searchParam: {
                    pageIndex: 1,
                    pageSize: -1
                }
            }
        },
        watch: {
            dataId() {
                this.init()
            },
            'searchParam.pageSize'() {
                this.init()
            },
            'searchParam.pageIndex'() {
                this.init()
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
            handleCancel() {
                this.$emit('close', false)
                this.$emit('update:visible', false)
            },
            async getList() {
                this.tableData.options.loading = true
                // 设置筛选
                const params = Object.assign({}, this.searchParam, this.extendParams)
                const res = await mainApi.getReturnCashList(params)
                if (res.success) {
                    this.tableData.list = res.data
                    this.tableData.total = res.data.length
                }
                setTimeout(() => {
                    this.tableData.options.loading = false
                }, 500)
            }
        }
    }
</script>

<style scoped>

</style>
