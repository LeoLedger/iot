<!--
* @description 配置非智能设备出库清单
* @author yc
!-->
<template>
    <div>
        <el-dialog
            v-if="visible"
            :visible="visible"
            :close-on-click-modal="false"
            :title="title"
            width="800px"
            append-to-body
            @close="$emit('update:visible', false)"
        >
            <layout-filter
                :table-columns.sync="tableData.columns"
                :filter-model.sync="searchParam"
                @search="handleFilter"
            >
                <template v-if="isEdit" slot="button">
                    <el-button
                        v-waves
                        size="mini"
                        class="filter-button"
                        type="success"
                        @click="handleImport"
                    >调入</el-button>
                    <el-button
                        v-waves
                        :disabled="!tableData.total"
                        size="mini"
                        class="filter-button"
                        type="warning"
                        @click="handleExport"
                    >调出</el-button>
                </template>
                <template slot="filter">
                    <el-input
                        v-model="searchParam.batchCode"
                        size="mini"
                        placeholder="批次"
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
            <span v-if="isEdit" slot="footer">
                <el-button :loading="loading" size="mini" @click="$emit('update:visible', false)">取 消</el-button>
                <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit">保 存</el-button>
            </span>
        </el-dialog>
        <!-- 选择出库设备 -->
        <SelectDialog
            v-if="deviceStockOut.visible"
            :visible.sync="deviceStockOut.visible"
            :extend-params="deviceStockOut.extendParams"
            title="选择出库产品"
            type="device"
            multiple
            @change="handleDeviceStockOutChange"
        />
    </div>
</template>

<script>
    // 方法
    import { filterList } from '@/utils'
    // API
    import storageOutApi from '@/api/businessDocuments/storageOut'
    // 组件
    import SelectDialog from '@/components/SelectDialog/index'

    export default {
        name: 'IntelligentNon',
        components: {
            SelectDialog
        },
        props: {
            isEdit: { type: Boolean, default: false },
            visible: { type: Boolean, default: false },
            rowData: { type: Object, required: true },
            contract: { type: Object, required: true },
            isCreate: { type: Boolean, default: false },
            extendParams: { type: Object },
            selectDeviceIds: { type: Array, default: () => [] }
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
                            minWidth: 120
                        },
                        {
                            prop: 'productName',
                            label: '产品名称',
                            minWidth: 160
                        },
                        {
                            type: 'dict',
                            dictType: 'productType',
                            prop: 'productType',
                            label: '产品类型',
                            minWidth: 120
                        },
                        {
                            prop: 'batchCode',
                            label: '批次',
                            width: 120
                        },
                        {
                            prop: 'count',
                            label: '出库数量',
                            width: 110
                        }
                    ],
                    options: {
                        height: '60vh',
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        curRowKey: 'guidId',
                        mutiSelect: this.isEdit,
                        mutiSelectedKey: 'guidId'
                    }
                },
                searchParam: {
                    pageSize: 15,
                    pageIndex: 1
                },
                deviceStockOut: {
                    visible: false,
                    extendParams: {
                        // 排除列表
                        selectDeviceIds: [],
                        // 产品code
                        productCode: null,
                        // 产品种类
                        productCategory: null,
                        // 仓库id
                        warehousesId: '1bba900a-26c8-492e-bd6d-1583814866c9',
                        // 仓位id
                        typeId: this.getWarehousesSpaceType(1, '全新'),
                        // 数据处理方法
                        filterMethod: (list) => {
                            var dirtyData = this.dataList.find(item => item._isDirty)
                            if (dirtyData) {
                                var index = list.findIndex(item => item.guidId === dirtyData.guidId)
                                if (index > -1) {
                                    list[index].num -= dirtyData.count
                                }
                            }
                            return list
                        },
                        lockedProps: ['productCode']
                    }
                },
                importAction: '',
                selectList: [],
                importDialogVisible: false
            }
        },
        computed: {
            title() {
                return this.isEdit ? '配置出库清单' : '查看出库清单'
            },
            loading() {
                return this.tableData.options.loading
            }
        },
        watch: {
            rowData: {
                deep: true,
                immediate: true,
                handler(data) {
                    if (data) {
                        this.dataList = (data.otherList || []).map(v => v)
                        var { productCode, productCategoryId } = data
                        this.deviceStockOut.extendParams = {
                            ...this.deviceStockOut.extendParams,
                            productCode,
                            productCategory: productCategoryId
                        }
                        this.handleFilter()
                    } else {
                        this.dataList = []
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
            this.searchParam = {
                ...this.searchParam,
                ...this.extendParams
            }
        },
        methods: {
            // 筛选数据
            filterData() {
                if (this.isEdit) {
                    let { pageSize, pageIndex } = this.searchParam
                    var list = filterList(this.dataList, this.searchParam, [
                        { name: 'batchCode', type: 'string' }
                    ])
                    this.tableData.total = list.length
                    this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
                } else {
                    this.queryConfigDeviceList()
                }
            },
            // 获取配置的出库设备
            async queryConfigDeviceList() {
                this.tableData.options.loading = true
                var res = await storageOutApi.getConfigDeviceList({
                    ...this.searchParam,
                    outId: this.contract.guidId,
                    category: this.rowData.productCategoryId,
                    outProdId: this.rowData.guidId
                })
                this.tableData.list = res.data.records
                this.tableData.total = res.data.total
                this.tableData.options.loading = false
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
                if (this.dataList.length > this.rowData.countApply) {
                    return this.$message.warning('出库数量不能大于申请出库数量，请调出部分产品后再试！')
                }
                this.$emit('update:visible', false)
                this.$emit('change', this.dataList)
            },
            // 点击调入按钮时触发
            handleImport() {
                var countApply = this.rowData.countApply
                var count = this.dataList.reduce((a, b) => a + b.count, 0)
                if (count < countApply) {
                    this.deviceStockOut.extendParams.selectDeviceIds = this.dataList.filter(v => !v._isDirty).map(item => item.guidId).concat(this.selectDeviceIds)
                    this.deviceStockOut.visible = true
                } else {
                    this.$message.warning('已达最大出库数量，请调出部分产品后再试！')
                }
            },
            // 点击调出按钮时触发
            handleExport() {
                if (this.selectList.length) {
                    this.selectList.forEach(item => {
                        this.dataList.splice(this.dataList.indexOf(item), 1)
                    })
                    this.handleFilter()
                } else {
                    this.$message.warning('请至少选中一项！')
                }
            },
            // 多选-选中表格行时触发
            handleSelectionChange(val) {
                this.selectList = val
            },
            // 选择出库设备后触发
            handleDeviceStockOutChange(list) {
                // 只获取需要的字段
                let props = this.tableData.columns.map(item => item.prop).concat([
                    'guidId',
                    'purchaseUnitPrice',
                    { formKey: 'count', dataKey: 'num' }
                ])
                // 合并相同id的产品
                let dirtyData = this.dataList.find(item => item._isDirty)
                if (dirtyData) {
                    let idx = list.findIndex(item => item.guidId === dirtyData.guidId)
                    if (idx > -1) {
                        dirtyData.count += list[idx].num
                        list.splice(idx, 1)
                    }
                }
                this.dataList = this.dataList.concat(list.map(item => {
                    let data = {}
                    props.forEach(key => {
                        if (typeof key === 'object') {
                            data[key.formKey] = item[key.dataKey]
                        } else {
                            data[key] = item[key]
                        }
                    })
                    return data
                }))
                let countApply = this.rowData.countApply
                // 找到超出申请数量的那一条数据
                let count = 0
                let index = this.dataList.findIndex((item) => {
                    count += item.count
                    item._isDirty = false
                    return count > countApply
                }, 0)
                // 如果index大于-1，说明找到了超出申请数量的数据
                if (index > -1) {
                    // 截取未超出的部分
                    this.dataList = this.dataList.slice(0, index + 1)
                    // 计算截取后的总数量超出了申请数量多少
                    count = this.dataList.reduce((a, b) => a + b.count, 0)
                    // 并在最后一条数据中减去超出的数量
                    let data = this.dataList.slice(-1)[0]
                    data.count -= (count - countApply)
                    data._isDirty = true
                }
                // 如果index等于-1，说明选择的批次数量还没有大于申请数据，不需要做任何处理
                this.handleFilter()
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
