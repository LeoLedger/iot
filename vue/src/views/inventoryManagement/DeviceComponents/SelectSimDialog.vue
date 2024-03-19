<template>
    <el-dialog
        v-if="visible"
        :visible.sync="visible"
        :before-close="handleCancel"
        :close-on-click-modal="true"
        :title="'选择SIM卡设备'"
        width="900px"
        append-to-body
    >
        <div style="height: 600px">
            <layout-filter
                :table-columns.sync="tableData.columns"
                :filter-model.sync="searchParam"
                @search="handleFilter"
            >
                <template slot="filter">
                    <el-input
                        v-model="searchParam.sim"
                        size="mini"
                        placeholder="SIM卡号"
                        clearable
                        class="filter-item"
                        @change="handleFilter"
                    />
                </template>
                <component
                    slot="filter-popup"
                    ref="filterPopup"
                    :is="'filterPopup'"
                    :search-params="searchParam"
                />
                <template slot="table">
                    <TableComponent
                        v-bind="tableData"
                        :page-index.sync="searchParam.pageIndex"
                        :page-size.sync="searchParam.pageSize"
                        @handleSingleSelectChange="handleSelectionChange"
                        @refreshList="handleRefreshList"
                    />
                </template>
            </layout-filter>
        </div>
        <span slot="footer">
            <el-button size="mini" @click="handleCancel">关 闭</el-button>
            <el-button v-prereclick :loading="tableData.options.loading" type="primary" size="mini" @click="handleConfirm">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import deviceApi from '@/api/inventory/deviceSim'
    import filterPopup from '@/views/inventoryManagement/SIM/filterPopup/sim_2'
    import tableColumns from '@/views/inventoryManagement/SIM/tableColumns/sim_2'
    export default {
        components: {
            filterPopup
        },
        props: {
            selectList: {
                type: Array,
                default: () => []
            },
            visible: {
                type: Boolean,
                default: false
            },
            extendParams: {
                type: Object,
                default: () => {}
            }
        },
        data() {
            return {
                loading: false,
                selectRow: null,
                searchParam: {
                    pageSize: 10,
                    pageIndex: 1
                },
                tableData: {
                    list: [],
                    total: 0,
                    columns: tableColumns.columns,
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        rowIndex: 'guidId',
                        curRowKey: 'guidId',
                        showIndex: true, // 是否展示 列表序列号
                        showSingleSelectCheckBox: true,
                        mutiSelectedKey: 'sim'
                    },
                    // 列操作按钮
                    operates: {
                        show: false
                    }
                }
            }
        },
        watch: {
            'searchParam.pageSize'() {
                this.getList()
            },
            'searchParam.pageIndex'() {
                this.getList()
            }
        },
        mounted() {
            this.getList()
        },
        methods: {
            // 请求列表数据
            async getList() {
                this.tableData.options.loading = true
                const res = await deviceApi.getList({
                    ...this.searchParam,
                    ...this.extendParams
                })
                if (res.success) {
                    this.tableData.list = res.data.records.map(item => {
                        return item
                    })
                    this.tableData.total = res.data.total
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
            // 点击排序时触发
            handleRefreshList(obj) {
                this.searchParam = Object.assign({}, this.searchParam, obj)
                this.getList()
            },
            handleCancel() {
                this.$emit('close', false)
                this.$emit('update:visible', false)
            },
            handleConfirm() {
                this.$emit('confirm', this.selectRow)
                this.$emit('update:visible', false)
                this.$emit('close', false)
            },
            // 多选-选中表格行时触发
            handleSelectionChange(row) {
                this.selectRow = row
            }
        }
    }
</script>

<style scoped>

</style>
