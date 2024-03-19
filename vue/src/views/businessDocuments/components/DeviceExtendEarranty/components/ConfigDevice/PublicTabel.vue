<!--
* @description 延保设备清单公共表格
* @author yc
!-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        @search="handleFilter"
    >
        <slot slot="button" name="button"/>
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
        <template slot="filter-popup">
            <layout-filter-item label="所属仓库">
                <!-- 仓库选择器 -->
                <WarehouseCascader
                    :form-data="searchParam"
                    :type="productCategoryId.find(v=>v.value === 0).id"
                    stock-key="warehousesId"
                    place-key="warehousesSpaceId"
                    placeholder="所属仓库"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="设备状态">
                <DictSelect
                    v-model="searchParam.unitStatus"
                    type="deviceStatus"
                    placeholder="设备状态"
                    clearable
                    filterable
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="质保截止日期">
                <el-date-picker
                    v-model="searchParam.warrantyEndDate"
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
</template>

<script>
    // 方法
    import moment from 'moment'
    import enums from '@/utils/enum'
    import { isEmpty, filterList, exportTabel } from '@/utils'
    // API
    // 组件

    export default {
        name: 'PublicTabel',
        components: {
        },
        props: {
            dataList: { type: Array, default: () => [] },
            isEdit: { type: Boolean, default: false }
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
                            minWidth: 155
                        },
                        {
                            prop: 'imei',
                            label: 'IMEI',
                            minWidth: 155
                        },
                        {
                            prop: 'warehousesName',
                            label: '出库仓库',
                            minWidth: 155,
                            formatter: (row) => {
                                return `${row.warehousesName || '- -'} | ${row.warehousesSpaceName || '- -'}`
                            }
                        },
                        {
                            label: '设备状态',
                            prop: 'unitStatus',
                            width: 100,
                            type: 'status',
                            enums: enums.deviceStatus
                        },
                        {
                            type: 'date',
                            prop: 'warrantyEndDate',
                            label: '质保截止日期',
                            minWidth: 120
                        }
                    ],
                    options: {
                        height: '446px',
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        mutiSelect: this.isEdit,
                        mutiSelectedKey: 'deviceId'
                    }
                },
                selectList: [],
                searchParam: {
                    imei: '',
                    unitStatus: '',
                    warehousesId: '',
                    warehousesSpaceId: '',
                    warrantyEndDate: [],
                    pageSize: 10,
                    pageIndex: 1
                },
                productCategoryId: enums.productCategoryId
            }
        },
        computed: {
        },
        watch: {
            dataList() {
                this.handleFilter()
            },
            'searchParam.pageSize'() {
                this.filterData()
            },
            'searchParam.pageIndex'() {
                this.filterData()
            }
        },
        mounted() {
            this.handleFilter()
        },
        methods: {
            // 筛选数据
            filterData() {
                var { pageSize, pageIndex, warrantyEndDate } = this.searchParam
                var [sDate, eDate] = (warrantyEndDate || [])
                var list = filterList(this.dataList, this.searchParam, [
                    { name: 'imei', type: 'string' },
                    { name: 'unitStatus', type: 'same' },
                    { name: 'warehousesId', type: 'same' },
                    { name: 'warehousesSpaceId', type: 'same' },
                    {
                        filter: (data) => {
                            if (isEmpty(sDate) || isEmpty(eDate)) {
                                return true
                            }
                            return moment(data.warrantyEndDate).isBetween(sDate, eDate)
                        }
                    }
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
            // 点击导出按钮时触发
            handleExport() {
                exportTabel({
                    name: '延保设备清单',
                    columns: this.tableData.columns,
                    dataList: this.dataList
                })
            },
            // 点击剔除按钮时触发
            handleDelete() {
                if (this.selectList.length) {
                    this.selectList.forEach(item => {
                        this.dataList.splice(this.dataList.indexOf(item), 1)
                    })
                    this.handleFilter()
                } else {
                    this.$message.warning('请至少选中一项！')
                }
                return this.dataList
            },
            // 表格行选中时触发
            handleSelectionChange(list) {
                this.selectList = list
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
