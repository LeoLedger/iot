<!--
* @description 调入续费设备
* @author yc
!-->
<template>
    <el-dialog
        :visible="visible"
        :close-on-click-modal="false"
        title="调入设备"
        width="900px"
        append-to-body
        @close="$emit('update:visible', false)"
    >
        <layout-filter
            :table-columns.sync="tableData.columns"
            :filter-model.sync="searchParam"
            @search="handleFilter"
        >
            <template slot="filter">
                <el-input
                    v-model="searchParam.imei"
                    size="mini"
                    placeholder="IMEI"
                    clearable
                    class="filter-item"
                    @change="handleFilter"
                />
            </template>
            <template slot="table">
                <TableComponent
                    ref="TableComponent"
                    v-bind="tableData"
                    :selected-list="selectList"
                    :page-index.sync="searchParam.pageIndex"
                    :page-size.sync="searchParam.pageSize"
                    @handleSelectionChange="handleSelectionChange"
                />
            </template>
        </layout-filter>
        <span slot="footer">
            <el-button :loading="loading" size="mini" @click="$emit('update:visible', false)">取 消</el-button>
            <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit">调 入</el-button>
        </span>
    </el-dialog>
</template>

<script>
    // 方法
    import enums from '@/utils/enum'
    import moment from 'moment'
    import { filterList } from '@/utils'
    // API

    export default {
        name: 'ImportDevice',
        components: {
        },
        props: {
            isEdit: { type: Boolean, default: false },
            visible: { type: Boolean, default: false },
            deviceList: Array
        },
        data() {
            return {
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            minWidth: 155,
                            disabled: true
                        },
                        {
                            prop: 'imei',
                            label: 'IMEI',
                            minWidth: 180,
                            disabled: true
                        },
                        {
                            prop: 'sim',
                            label: 'SIM卡号',
                            width: 140
                        },
                        {
                            type: 'status',
                            enums: enums.deviceStatus,
                            prop: 'unitStatus',
                            label: '设备状态',
                            width: 100
                        },
                        {
                            prop: 'serviceEndDate',
                            label: '到期时间',
                            width: 130,
                            formatter: (params, formData) => {
                                if (params[formData.prop]) {
                                    return moment(params[formData.prop]).format('YYYY-MM-DD')
                                }
                                return '- -'
                            }
                        }
                    ],
                    options: {
                        height: '50vh',
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        curRowKey: 'id',
                        mutiSelect: true,
                        mutiSelectedKey: 'id'
                    }
                },
                searchParam: {
                    imei: '',
                    pageSize: 15,
                    pageIndex: 1
                },
                selectList: []
            }
        },
        computed: {
            loading() {
                return this.tableData.options.loading
            }
        },
        watch: {
            visible: {
                immediate: true,
                handler(visible) {
                    if (visible) {
                        this.filterData()
                    }
                }
            },
            'searchParam.pageSize'() {
                this.filterData()
            },
            'searchParam.pageIndex'() {
                this.filterData()
            }
        },
        mounted() {
        },
        methods: {
            // 筛选数据
            filterData() {
                var { pageSize, pageIndex } = this.searchParam
                var list = filterList(this.deviceList.filter(item => item.calloutFlag === 1), this.searchParam, [
                    { name: 'imei', type: 'string' }
                ])
                this.tableData.total = list.length
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
            },
            // 筛选列表
            handleFilter() {
                this.selectList = []
                if (this.searchParam.pageIndex !== 1) {
                    this.searchParam.pageIndex = 1
                } else {
                    this.filterData()
                }
            },
            // 点击提交按钮时触发
            handleSubmit() {
                if (this.selectList.length) {
                    this.$emit('change', this.selectList)
                    this.$emit('update:visible', false)
                    this.selectList = []
                } else {
                    this.$message.warning('请至少选择一项')
                }
            },
            // 多选-选中表格行时触发
            handleSelectionChange(val) {
                this.selectList = val
            }
        }
    }
</script>

<style lang='scss' scoped>

</style>
