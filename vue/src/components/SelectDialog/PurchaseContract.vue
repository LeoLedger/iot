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
            <el-input
                v-model="publicParam.partyBName"
                :disabled="lockedProps.includes('partyBName')"
                size="mini"
                placeholder="合同乙方"
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
    import contractApi from '@/api/purchase/contract'

    export default {
        name: 'PurchaseContract',
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
                            minWidth: 130,
                            disabled: true
                        },
                        {
                            prop: 'name',
                            label: '合同名称',
                            minWidth: 210
                        },
                        {
                            prop: 'partyAName',
                            label: '合同甲方',
                            minWidth: 210
                        },
                        {
                            prop: 'partyBName',
                            label: '合同乙方',
                            minWidth: 210
                        },
                        {
                            prop: 'amount',
                            label: '合同金额',

                            dbProp: 'c_amount',
                            sortable: 'custom',
                            width: 120,
                            formatter: (params, formData) => {
                                return getPriceFormat(params[formData.prop])
                            }
                        },
                        {
                            prop: 'signedDate',
                            label: '签订日期',
                            dbProp: 'c_signed_date',
                            sortable: 'custom',
                            width: 140,
                            formatter: (params, formData) => {
                                if (params[formData.prop]) {
                                    return moment(params[formData.prop]).format('yyyy-MM-DD')
                                }
                                return '- -'
                            }
                        },
                        {
                            prop: '_period',
                            label: '合同有效期',
                            dbProp: 'c_begin_date',
                            sortable: 'custom',
                            minWidth: 200,
                            formatter: (params, formData) => {
                                if (params.beginDate && params.endDate) {
                                    return `${moment(params.beginDate).format('yyyy-MM-DD')} 至 ${moment(params.endDate).format('yyyy-MM-DD')}`
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
                }
            }
        },
        computed: {
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
