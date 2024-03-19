<!--
* @description
* @fileName index.vue
* @author
!-->
<template>
    <layout-template
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
    >
        <template slot="button">
            <ImportButton
                class="filter-item"
                action="device-duplicate-fix/import"
                type="primary"
                title="设备列表导入"
                template-name="设备记录模板.xlsx"
                @success="handleImportConfirm"
            />
            <el-button
                type="danger"
                icon="el-icon-delete"
                @click="handleMultipleDelete"
            >
                批量删除
            </el-button>
        </template>
        <template slot="filter">
            <el-select
                v-model="searchParam.warehousesSpaceName"
                placeholder="仓库名称"
                filterable
                size="mini"
                style="width: 150px"
                class="filter-item"
                clearable
            >
                <el-option
                    :value="item"
                    v-for="(item,index) in selectList"
                    :key="index"
                >
                    {{ item }}
                </el-option>
            </el-select>
        </template>
        <template slot="table">
            <TableComponent
                v-bind="tableData"
                :selected-list="selectedList"
                @handleSelectionChange="handleSelect"
            >
                <template slot="操作" slot-scope="{row}">
                    <el-dropdown
                        trigger="click"
                        size="small"
                    >
                        <el-button size="mini" icon="el-icon-more" title="操作" />
                        <el-dropdown-menu slot="dropdown">
                            <div class="layout-dropdown-item" @click="handleDelete(row)">
                                <el-dropdown-item icon="el-icon-delete" divided>删除</el-dropdown-item>
                            </div>
                        </el-dropdown-menu>
                    </el-dropdown>
                </template>
            </TableComponent>
        </template>
    </layout-template>
</template>
<script>
    // 工具
    // API
    import financialStatements from '@/api/statisticsReport/financialStatements.js'
    // 组件
    import ImportButton from '@/components/customizeFormItem/ImportButton'

    export default {
        components: {
            ImportButton
        },
        data() {
            return {
                dataList: [],
                selectList: ['全新设备', '旧设备', '备用设备', '在运营设备', '寄存设备', '报损设备'],
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'warehousesSpaceName',
                            label: '仓库名称',
                            minWidth: 120
                        },
                        {
                            prop: 'imei',
                            label: 'imei',
                            minWidth: 120
                        },
                        {
                            prop: 'enterWarehouseCode',
                            label: '入库单号',
                            minWidth: 120
                        },
                        {
                            prop: 'projectName',
                            label: '项目名称',
                            minWidth: 120
                        },
                        {
                            prop: 'sectionName',
                            label: '标段',
                            minWidth: 120
                        },
                        {
                            prop: 'productName',
                            label: '产品名称',
                            minWidth: 120
                        },
                        {
                            prop: 'serviceBeginDate',
                            label: '服务开始时间',
                            minWidth: 120
                        },
                        {
                            prop: 'serviceEndDate',
                            label: '服务结束时间',
                            minWidth: 120
                        },
                        {
                            prop: '',
                            label: '操作',
                            minWidth: 40,
                            render: (a, data) => {
                                return <el-link type='danger' onClick={() => this.handleDelete(data.row)}>删除</el-link>
                            }
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        mutiSelect: true // 是否多选
                    }
                },
                searchParam: {
                    warehousesSpaceName: ''
                },
                tempData: [],
                selectedList: []
            }
        },
        computed: {
            uploadData_() {
                return filterEmptyParams(get2Function(this.uploadData))
            }
        },
        watch: {
            'searchParam.warehousesSpaceName'() {
                this.filterData()
            }
        },
        mounted() {
        },
        methods: {
            // 筛选数据
            filterData() {
                let { warehousesSpaceName } = this.searchParam
                if (warehousesSpaceName) {
                    this.tableData.list = this.tempData.filter(item => item.warehousesSpaceName === warehousesSpaceName)
                } else {
                    this.tableData.list = this.tempData
                }
            },
            // 导入
            handleImportConfirm(data) {
                // 判断导入
                if (data) {
                    this.tableData.list = data
                    this.tempData = this.tableData.list
                    this.$message({ type: 'success', message: '导入成功' })
                }
            },
            // 删除
            async handleDelete(row) {
                let result = await financialStatements.handleDelete(row.id)
                if (result.data) {
                    this.tableData.list = this.tableData.list.filter(item => item.imei !== row.imei)
                    this.tempData = this.tempData.filter(item => item.imei !== row.imei)
                }
            },
            // 批量删除
            async handleMultipleDelete() {
                let ids = this.selectedList.map(item => {
                    return item.id
                })
                let result = await financialStatements.handleMultipleDelete(ids)
                if (result.data) {
                    this.selectedList.forEach(it => {
                        this.tableData.list = this.tableData.list.filter(item => item.imei !== it.imei)
                        this.tempData = this.tempData.filter(item => item.imei !== it.imei)
                    })
                }
            },
            handleSelect(row) {
                this.selectedList = row
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
