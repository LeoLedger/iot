<!--
* @description 通用选择设备
* @author 望浩然
!-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="publicParam"
        :locked-props="extendParams.lockedProps"
        :show-toolbar="!dataList && !!(filterName || filterPopupName)"
        @search="handleFilter"
    >
        <template v-if="!dataList">
            <component
                v-if="filterName"
                slot="filter"
                :is="filterName"
                :search-param="publicParam"
                :locked-props="extendParams.lockedProps"
                @change="handleFilter"
            />
            <component
                v-if="filterPopupName"
                slot="filter-popup"
                :is="filterPopupName"
                :search-params="publicParam"
                :locked-props="extendParams.lockedProps"
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
    import deviceTableConfig from './deviceTableConfig'
    // 方法
    import enums from '@/utils/enum'
    // API
    import storageOutApi from '@/api/businessDocuments/storageOut'
    // 组件

    export default {
        name: 'Device',
        components: {
        },
        mixins: [mixin, deviceTableConfig.mixin],
        data() {
            return {
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [],
                    // 列操作按钮
                    operates: {
                        width: 100,
                        fixed: 'right'
                    }
                },
                defaultParam: {
                    pageSize: 15,
                    pageIndex: 1,
                    unitResidual: []
                },
                filterName: '',
                filterPopupName: ''
            }
        },
        computed: {
            categoryType() {
                var category = enums.productCategoryId.find(item => item.id === this.publicParam.productCategory)
                return category ? category.value : -1
            }
        },
        watch: {
        },
        mounted() {
        },
        methods: {
            // 更新表格配置
            updateTableConfig() {
                let { typeId, productCategory } = this.publicParam
                if (typeId) {
                    let { columns, filterItem, filterPopup } = this.getTableConfig(typeId)
                    this.filterName = filterItem
                    this.filterPopupName = filterPopup
                    this.tableData.columns = columns
                } else {
                    let categoryId = (enums.productCategoryId.find(v => v.id === productCategory) || {}).value
                    switch (categoryId) {
                    case 0: // 智能设备
                        this.tableData.columns = [
                            {
                                prop: 'productCode',
                                label: '产品编号',
                                minWidth: 155
                            },
                            {
                                prop: 'productName',
                                label: '产品名称',
                                minWidth: 155
                            },
                            {
                                prop: 'imei',
                                label: 'IMEI',
                                minWidth: 155
                            },
                            {
                                prop: 'packageCode',
                                label: '包装箱编号',
                                minWidth: 130
                            },
                            {
                                prop: 'sim',
                                label: 'SIM卡号',
                                minWidth: 155
                            },
                            {
                                type: 'date',
                                prop: 'warrantyStartDate',
                                label: '质保开始日期',
                                minWidth: 130
                            }
                        ]
                        break
                    case 1: // SIM卡
                        this.filterName = 'FilterSim'
                        this.filterPopupName = 'pop_sim_1'
                        this.tableData.columns = [
                            {
                                prop: 'productCode',
                                label: '产品编号',
                                minWidth: 155
                            },
                            {
                                prop: 'sim',
                                label: 'SIM卡号',
                                minWidth: 155
                            },
                            {
                                prop: 'iccid',
                                label: 'ICCID',
                                minWidth: 155
                            }
                        ]
                        break
                    case 2: // 非智能设备
                        this.tableData.columns = [
                            {
                                prop: 'productCode',
                                label: '产品编号',
                                minWidth: 155
                            },
                            {
                                label: '产品名称',
                                prop: 'productName',
                                minWidth: 155
                            },
                            {
                                type: 'dict',
                                dictType: 'productType',
                                label: '产品类型',
                                prop: 'productType',
                                minWidth: 120
                            },
                            {
                                label: '批次',
                                prop: 'batchCode',
                                minWidth: 155
                            }
                        ]
                        break
                    default:
                        this.tableData.columns = [
                            {
                                prop: 'productCode',
                                label: '产品编号',
                                minWidth: 155
                            },
                            {
                                label: '产品名称',
                                prop: 'productName',
                                minWidth: 155
                            },
                            {
                                type: 'dict',
                                dictType: 'productType',
                                label: '产品类型',
                                prop: 'productType',
                                minWidth: 120
                            },
                            {
                                prop: 'imei',
                                label: 'IMEI',
                                minWidth: 155
                            },
                            {
                                prop: 'sim',
                                label: 'SIM卡号',
                                minWidth: 155
                            },
                            {
                                label: '批次',
                                prop: 'batchCode',
                                minWidth: 155
                            }
                        ]
                        break
                    }
                }
            },
            // 请求列表数据
            async getList() {
                this.loading = true
                this.updateTableConfig()
                try {
                    var res
                    var publicParam = { ...this.publicParam }
                    if (publicParam.unitResidual && publicParam.unitResidual.length < 1) {
                        publicParam.unitResidual = undefined
                    }
                    if (this.customRequest) {
                        const params = { ...this.publicParam }
                        params.warehouses = undefined
                        res = await this.customRequest(this.publicParam)
                    } else {
                        // 当listType = 1，且selectDeviceIds为空数组时，接口会把所有设备返回，所以这里判断如果条件达成，则不请求接口
                        var { listType, selectDeviceIds } = this.publicParam
                        if (listType === 1 && Array.isArray(selectDeviceIds) && selectDeviceIds.length === 0) {
                            res = { data: { records: [] }}
                        } else {
                            const params = { ...this.publicParam }
                            params.warehouses = undefined
                            res = await storageOutApi.getDeviceList(this.publicParam)
                        }
                    }
                    let data, total
                    if (res.data.records !== undefined) {
                        data = res.data.records
                        total = res.data.total
                    } else {
                        data = res.data
                        total = res.data.length
                    }
                    if (typeof this.extendParams.filterMethod === 'function') {
                        data = this.extendParams.filterMethod(data)
                    }
                    this.tableData.list = data
                    this.tableData.total = total
                    this.updateSelect()
                } catch (err) {
                    this.$message({ type: 'error', message: '数据加载失败' })
                }
                this.loading = false
            },
            // 一键选中
            async quickSelected() {
                try {
                    var res = await storageOutApi.getDeviceList({
                        ...this.publicParam,
                        pageSize: this.maxCount
                    })
                    this.selectList = res.data.records
                } catch (err) {
                    this.$message({ type: 'error', message: '数据加载失败' })
                }
            },
            handleListUpdate() {
                this.updateTableConfig()
            }
        }
    }
</script>

<style lang='scss' scoped>

</style>
