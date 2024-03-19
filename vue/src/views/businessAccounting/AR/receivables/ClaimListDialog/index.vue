<!--
* @description 收款认领列表
* @author 望浩然
!-->
<template>
    <el-dialog
        :visible="visible"
        :close-on-click-modal="true"
        title="收款认领"
        width="800px"
        class="not-padding"
        append-to-body
        @close="$emit('update:visible', false)">
        <div class="layout-detail-container">
            <layout-filter
                :table-columns.sync="tableData.columns"
                :filter-model.sync="searchParam"
                @search="handleSearch"
            >
                <template slot="filter">
                    <el-input
                        v-model="searchParam.receivableCode"
                        size="mini"
                        placeholder="账单编号"
                        clearable
                        class="filter-item"
                        @change="handleSearch"
                    />
                </template>
                <template slot="table">
                    <TableComponent
                        ref="TableComponent"
                        v-bind="tableData"
                        :page-index.sync="searchParam.pageIndex"
                        :page-size.sync="searchParam.pageSize"
                        @refreshList="handleSearch"
                    />
                </template>
            </layout-filter>
        </div>
        <span slot="footer">
            <el-button size="mini" @click="$emit('update:visible', false)">关 闭</el-button>
        </span>
    </el-dialog>
</template>

<script>
    // 方法
    import enums from '@/utils/enum'
    // API
    import claimApi from '@/api/businessDocuments/billReceivableRecordClaim'

    export default {
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            dataId: {
                type: String,
                default: null
            },
            extendParams: {
                type: Object,
                default: () => {}
            }
        },
        data() {
            return {
                tableData: {
                    options: {
                        loading: true
                    },
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            label: '账单编号',
                            prop: 'receivableCode',
                            minWidth: 155
                        },
                        {
                            label: '收款流水号',
                            prop: 'receivableRecordCode',
                            minWidth: 150,
                            isClick: true,
                            dialogType: 'collectionRecord',
                            idKey: 'receivableRecordId'
                        },
                        {
                            label: '合同编号',
                            prop: 'approvalCode',
                            idKey: 'approvalId',
                            minWidth: 130,
                            isClick: true,
                            dialogType: ({ row }) => {
                                return (enums.costType.find(v => v.value === row.costType) || {}).dialogType
                            }
                        },
                        {
                            label: '项目',
                            prop: 'projectName',
                            minWidth: 200
                        },
                        {
                            label: '客户',
                            prop: 'sectionName',
                            minWidth: 200
                        },
                        {
                            label: '标段',
                            prop: 'sectionName',
                            minWidth: 180,
                            isClick: true,
                            dialogType: 'sections',
                            idKey: 'sectionGuid'
                        },
                        {
                            label: '费用类型',
                            prop: 'costType',
                            width: 120,
                            type: 'dict',
                            dictType: 'costType'
                        },
                        {
                            label: '认领金额(元)',
                            prop: 'amount',
                            width: 120,
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
                            width: 100
                        },
                        {
                            label: '操作日期',
                            prop: 'createTime',
                            width: 120,
                            type: 'date'
                        },
                        {
                            label: '备注',
                            prop: 'remark',
                            width: 300
                        }
                    ],
                    // 列操作按钮
                    operates: {
                        width: 100,
                        fixed: 'right'
                    }
                },
                searchParam: {
                    receivableCode: '',
                    pageSize: 15,
                    pageIndex: 1
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
            },
            dataId: {
                deep: true,
                immediate: true,
                handler() {
                    this.getList()
                }
            }
        },
        methods: {
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
            // 请求列表数据
            async getList() {
                if (this.dataId) {
                    this.tableData.options.loading = true
                    const params = { ...this.extendParams, ...this.searchParam }
                    const res = await claimApi.getList(params)
                    this.tableData.list = res.data.records
                    this.tableData.total = res.data.total
                    this.tableData.options.loading = false
                }
            }
        }
    }
</script>

<style lang='scss' scoped>

</style>
