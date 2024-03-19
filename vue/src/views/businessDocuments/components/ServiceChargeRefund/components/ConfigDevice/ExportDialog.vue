<!--
* @description 调入退费设备
* @author yc
!-->
<template>
    <div>
        <el-dialog
            :visible="visible"
            :close-on-click-modal="false"
            title="调入退费设备"
            width="1300px"
            append-to-body
            @close="$emit('update:visible', false)"
        >
            <layout-filter
                :table-columns.sync="tableData.columns"
                :filter-model.sync="searchParam"
                @search="handleFilter"
            >
                <component
                    slot="filter"
                    :is="filterName"
                    :search-param="searchParam"
                    @change="handleFilter"
                />
                <component
                    slot="filter-popup"
                    :is="filterPopupName"
                    :search-params="searchParam"
                    @change="handleFilter"
                />
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
                <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit">调 出</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    // 方法
    // API
    import storageOutApi from '@/api/businessDocuments/storageOut'
    // 组件
    // 表格配置
    import smart_4 from '@/views/inventoryManagement/intelligentDevice/tableColumns/smart_4'
    import pop_smart_4 from '@/views/inventoryManagement/intelligentDevice/filterPopup/smart_4'
    import FilterSmart from '@/views/inventoryManagement/intelligentDevice/filter/index_1'

    export default {
        name: 'ConfigDialog',
        components: {
            pop_smart_4,
            FilterSmart
        },
        props: {
            isEdit: { type: Boolean, default: false },
            visible: { type: Boolean, default: false },
            deviceIds: Array
        },
        data() {
            return {
                dataList: [],
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: smart_4.columns,
                    options: {
                        height: '634px',
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        curRowKey: 'guidId',
                        mutiSelect: true,
                        mutiSelectedKey: 'guidId'
                    }
                },
                selectList: [],
                filterName: 'FilterSmart',
                filterPopupName: 'pop_smart_4',
                searchParam: {
                    listType: 1,
                    pageSize: 15,
                    pageIndex: 1,
                    typeId: this.getWarehousesSpaceType(0, '在运营'),
                    productCategory: 'B16C3151-11D2-4364-8F45-63EFFFFCF424' // 智能设备
                }
            }
        },
        computed: {
            loading() {
                return this.tableData.options.loading
            }
        },
        watch: {
            visible(visible) {
                if (visible) {
                    this.getList()
                }
            },
            'searchParam.pageSize'() {
                this.getList()
            },
            'searchParam.pageIndex'() {
                this.getList()
            }
        },
        methods: {
            // 请求列表数据
            async getList() {
                this.selectList = []
                this.tableData.options.loading = true
                try {
                    let ids = this.deviceIds.filter(v => v.flag === 1).map(v => v.id)
                    if (ids.length) {
                        let res = await storageOutApi.getDeviceList({
                            ...this.searchParam,
                            selectDeviceIds: ids
                        })
                        this.tableData.list = res.data.records
                        this.tableData.total = res.data.total
                    } else {
                        this.tableData.list = []
                        this.tableData.total = 0
                    }
                } catch (err) {
                    console.log(err)
                }
                this.tableData.options.loading = false
            },
            // 筛选列表
            handleFilter() {
                if (this.searchParam.pageIndex !== 1) {
                    this.searchParam.pageIndex = 1
                } else {
                    this.getList()
                }
            },
            // 点击提交按钮时触发
            handleSubmit() {
                if (this.selectList.length) {
                    this.$emit('change', this.selectList)
                    this.$emit('update:visible', false)
                } else {
                    this.$message.warning('请至少选中一项！')
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
