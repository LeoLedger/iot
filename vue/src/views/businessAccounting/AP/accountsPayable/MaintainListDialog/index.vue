<!--
* @description 维修账单详情列表
* @author 望浩然
!-->
<template>
    <el-dialog
        :visible="visible"
        :close-on-click-modal="true"
        title="维修费账单列表"
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
                <template slot="filter"/>
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
        <ConfirmDialog
            v-if="confirmDialogVisible"
            :data-id="activeRowId"
            :visible.sync="confirmDialogVisible"
            @update="getList"
        />
    </el-dialog>
</template>

<script>
    // 方法
    // API
    import ConfirmDialog from '@/views/operationsManagement/maintenanceBill/components/BillDialog'
    import mainApi from '@/api/operationsManagement/maintenanceBill'
    import enums from '@/utils/enum'

    export default {
        components: { ConfirmDialog },
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
                            prop: 'repairCode',
                            label: '维修/寄修单号',
                            minWidth: 150,
                            isClick: true,
                            onClick: (data) => {
                                this.activeRowId = data.guidId
                                this.confirmDialogVisible = true
                            }
                        },
                        {
                            type: 'status',
                            enums: enums.maintenanceBillStatus,
                            prop: 'status',
                            label: '状态',
                            width: 100
                        },
                        {
                            prop: 'imei',
                            label: 'IMEI',
                            minWidth: 155
                        },
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            width: 100
                        },
                        // {
                        //     prop: 'num',
                        //     label: '维修设备数量',
                        //     width: 120,
                        //     dbProp: 'c_num',
                        //     sortable: 'custom'
                        // },
                        {
                            prop: 'supplierName',
                            label: '供应商',
                            minWidth: 210
                        },
                        {
                            type: 'money',
                            prop: 'cost',
                            label: '维修费用（元）',
                            width: 130,
                            dbProp: 'c_cost',
                            sortable: 'custom'
                        },
                        {
                            type: 'money',
                            prop: 'companyBearCost',
                            label: '公司承担（元）',
                            width: 130,
                            dbProp: 'c_company_bear_cost',
                            sortable: 'custom'
                        },
                        {
                            type: 'money',
                            prop: 'enterpriseBearCost',
                            label: '客户承担（元）',
                            width: 130,
                            dbProp: 'c_enterprise_bear_cost',
                            sortable: 'custom'
                        },
                        {
                            type: 'date',
                            prop: 'buildDate',
                            label: '生成日期',
                            width: 100,
                            dbProp: 'c_build_date',
                            sortable: 'custom'
                        },
                        {
                            prop: 'userName',
                            label: '确认人',
                            width: 100
                        },
                        {
                            type: 'date',
                            prop: 'confirmationTime',
                            label: '确认时间',
                            width: 140,
                            format: 'YYYY-MM-DD HH:mm',
                            dbProp: 'c_confirmation_time',
                            sortable: 'custom'
                        }
                    ],
                    // 列操作按钮
                    operates: {
                        width: 100,
                        fixed: 'right',
                        show: false
                    }
                },
                searchParam: {
                    pageSize: 15,
                    pageIndex: 1
                },
                activeRowId: null,
                confirmDialogVisible: false,
                batchDialogVisible: false
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
