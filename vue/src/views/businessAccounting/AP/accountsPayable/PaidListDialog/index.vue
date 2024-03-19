<!--
* @description 付款明细列表
* @author 望浩然
!-->
<template>
    <el-dialog
        :visible="visible"
        :close-on-click-modal="true"
        title="付款明细"
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
                        v-model="searchParam.recordCode"
                        size="mini"
                        placeholder="付款流水"
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
    // API
    import mainApi from '@/api/businessDocuments/billPayRecordPayable'

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
                            prop: 'recordCode',
                            label: '付款流水',
                            fixed: 'left'
                        },
                        {
                            prop: 'payType',
                            label: '费用类型',
                            type: 'dict',
                            dictType: 'payType'
                        },
                        {
                            prop: 'amountUnpaid',
                            label: '剩余应付金额',
                            width: 100,
                            type: 'money'
                        },
                        {
                            prop: 'amount',
                            label: '付款核销金额',
                            width: 150,
                            align: 'right',
                            type: 'money'
                        },
                        {
                            label: '备注',
                            prop: 'remark',
                            width: 150
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
                    const res = await mainApi.getList(params)
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
