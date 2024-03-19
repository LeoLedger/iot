<!--
* @description  
* @fileName index.vue
* @author
!-->
<template>
    <layout-template
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        @search="handleFilter"
    >
        <template slot="button">
            <!-- :download-method="handleDownloadTemplate" -->
            <ImportButton
                v-if="checkFeature(['ty.iot.collectionRecord.collection.import'])"
                class="filter-item"
                action="device-duplicate-fix/import"
                type="primary"
                title="设备列表导入"
                template-name="设备记录模板.xlsx"
                @success="handleImportConfirm"
            />
        </template>
        <template slot="table">
            <TableComponent
                v-bind="tableData"
                :page-index.sync="searchParam.pageIndex"
                :page-size.sync="searchParam.pageSize"
                @refreshList="handleRefreshList"
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
    import { filterList } from '@/utils'
    // API
    import financialStatements from '@/api/statisticsReport/financialStatements.js'
    // 组件
    import ImportButton from '@/components/customizeFormItem/ImportButton'

    export default {
        components: {
            ImportButton
        },
        data() {
            let myDate = new Date()
            let month = myDate.getMonth() + 1
            month = month < 10 ? '0' + month : month // 格式化月份，补0
            let day = myDate.getDate()
            day = day < 10 ? '0' + day : day
            let beginDate = myDate.getFullYear().toString() + '-' + month + '-01 00:00:00' // 月初
            let endDate = myDate.getFullYear().toString() + '-' + month + '-' + day + ' 23:59:59'
            return {
                dataList: [],
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
                            render: (a,data) => {
                                return <el-link type='danger' onClick={() => this.handleDelete(data.row)}>删除</el-link>
                            }
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    }
                },
                searchParam: {
                    dateList: [beginDate, endDate],
                    beginDate: beginDate,
                    endDate: endDate,
                    pageSize: 15,
                    pageIndex: 1
                }
            }
        },
        computed: {
            uploadData_() {
                return filterEmptyParams(get2Function(this.uploadData))
            }
        },
        watch: {
            'searchParam.pageSize'() {
                this.filterData()
            },
            'searchParam.pageIndex'() {
                this.filterData()
            },
            'searchParam.dateList'(val) {
                if (val) {
                    this.searchParam.beginDate = val[0]
                    this.searchParam.endDate = val[1]
                } else {
                    this.searchParam.beginDate = null
                    this.searchParam.endDate = null
                }
                // this.getList()
            }
        },
        mounted() {
            // this.getList()
        },
        methods: {
            // 请求列表数据
            async getList() {
                this.tableData.options.loading = true
                var res = await financialStatements.pageContractTenderDetail({
                    ...this.searchParam
                })
                this.dataList = res.data.records
                this.filterData()
                this.tableData.options.loading = false
            },
            // 筛选数据
            filterData() {
                let { pageSize, pageIndex } = this.searchParam
                let list = filterList(this.dataList, this.searchParam, [
                    { name: 'productCode', type: 'string' },
                    { name: 'productName', type: 'string' },
                    { name: 'productType', type: 'same' }
                ])
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
                this.tableData.total = list.length
            },
            // 筛选列表
            handleFilter() {
                if (this.searchParam.pageIndex !== 1) {
                    this.searchParam.pageIndex = 1
                    // this.getList()
                } else {
                    // this.getList()
                    // this.filterData()
                }
            },
            handleImportConfirm(data) {
                // 判断导入
                if (data) {
                    this.tableData.list = data
                    this.$message({ type: 'success', message: '导入成功' })
                }
            },
            // 删除
            async handleDelete(row) {
                let result = await financialStatements.handleDelete(row.id)
                if (result.data) {
                    this.tableData.list = this.tableData.list.filter(item => item.imei != row.imei)
                }
            },
            handleRefreshList() {

            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
