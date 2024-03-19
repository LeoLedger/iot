<!--
* @description 选择人员
* @author yc
!-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="publicParam"
        @search="handleFilter"
    >
        <template slot="filter">
            <RemoteSelect
                v-model="publicParam.sectionId"
                :method="sectionRemoteMethod"
                :disabled="lockedProps.includes('sectionId')"
                width="200px"
                label-key="name"
                value-key="guidId"
                filter-label-key="sectionName"
                placeholder="选择标段"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="publicParam.code"
                :disabled="lockedProps.includes('code')"
                size="mini"
                placeholder="合同编号"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="publicParam.name"
                :disabled="lockedProps.includes('name')"
                size="mini"
                placeholder="合同名称"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
        </template>
        <template slot="table">
            <TableComponent
                ref="TableComponent"
                v-bind="tableData"
                :options="tableOptions"
                :selected-list="selectList"
                :page-index.sync="publicParam.pageIndex"
                :page-size.sync="publicParam.pageSize"
                @refreshList="handleRefreshList"
                @handleCurrentChange="handleCurrentChange"
                @handleSelectionChange="handleSelectionChange"
                @not-selected-click="handleNotSelectedClick"
            />
        </template>
    </layout-filter>
</template>

<script>
    import mixin from './mixin'
    // 方法
    import moment from 'moment'
    import { getPriceFormat } from '@/utils'
    // API
    import sectionApi from '@/api/PM/section'
    import contractApi from '@/api/PM/contract'
    import enums from '@/utils/enum'

    export default {
        name: 'SalesContract',
        components: {
        },
        mixins: [mixin],
        data() {
            return {
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'code',
                            label: '合同编号',
                            minWidth: 160,
                            disabled: true,
                            isClick: true,
                            dialogType: 'salesContract'
                        },
                        {
                            fixed: 'right',
                            prop: 'approvalStatus',
                            type: 'status',
                            enums: enums.documentStatus,
                            label: '状态',
                            width: 85
                        },
                        {
                            prop: 'name',
                            label: '合同名称',
                            minWidth: 160,
                            disabled: true
                        },
                        {
                            prop: 'type',
                            label: '合同类型',
                            width: 100,
                            formatter: (params, formData) => {
                                return (this.getDict('contractType').find(v => v.value === params[formData.prop]) || {}).label || '- -'
                            }
                        },
                        {
                            prop: 'customerName',
                            label: '客户',
                            minWidth: 200
                        },
                        {
                            prop: 'sectionName',
                            label: '标段',
                            minWidth: 200
                        },
                        {
                            prop: 'amount',
                            label: '合同总金额（元）',
                            width: 150,

                            dbProp: 'c_amount',
                            sortable: 'custom',
                            formatter: (params, formData) => {
                                if (typeof params[formData.prop] === 'number') {
                                    return getPriceFormat(params[formData.prop])
                                }
                                return '- -'
                            }
                        },
                        {
                            prop: '_period',
                            label: '合同期限',
                            width: 180,
                            dbProp: 'c_end_date',
                            sortable: 'custom',
                            formatter: (params, formData) => {
                                if (params.startDate && params.endDate) {
                                    return `${moment(params.startDate).format('yyyy-MM-DD')} 至 ${moment(params.endDate).format('yyyy-MM-DD')}`
                                }
                                return '- -'
                            }
                        },
                        {
                            prop: 'signedDate',
                            label: '签订日期',
                            width: 120,
                            dbProp: 'c_signed_date',
                            sortable: 'custom',
                            formatter: (params, formData) => {
                                if (params[formData.prop]) {
                                    return moment(params[formData.prop]).format('YYYY-MM-DD')
                                }
                                return '- -'
                            }
                        }
                    ]
                },
                defaultParam: {
                    code: '',
                    name: '',
                    pageSize: 15,
                    pageIndex: 1
                },
                sectionRemoteMethod: sectionApi.getList
            }
        },
        computed: {
        },
        mounted() {
        },
        methods: {
            // 请求列表数据
            async getList() {
                this.loading = true
                try {
                    var res
                    if (this.customRequest) {
                        res = await this.customRequest(this.publicParam)
                    } else {
                        res = await contractApi.getList(this.publicParam)
                    }
                    this.tableData.list = res.data.records
                    this.tableData.total = res.data.total
                    this.updateSelect()
                } catch (err) {}
                this.loading = false
            }
        }
    }
</script>

<style lang='scss' scoped>

</style>
