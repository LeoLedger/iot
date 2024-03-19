<!--
* @fileName 备用分配 - 主窗口 - 项目备用设备列表
* @author   望浩然
* @date     2021/4/17
-->
<template>
    <div style="height: 100%">
        <layout-filter
            :table-columns.sync="tableData.columns"
            :filter-model.sync="searchParam"
            @search="handleSearch"
        >
            <template slot="button">
                <el-button
                    v-waves
                    v-prereclick
                    type="warning"
                    size="mini"
                    class="filter-item"
                    icon="el-icon-download"
                    @click="handleExport"
                >导出</el-button>
            </template>
            <template slot="filter">
                <RemoteSelect
                    v-model="searchParam.standbyProjectId"
                    :method="projectRemoteMethod"
                    :extend-params="{status: 1}"
                    label-key="projectName"
                    value-key="guidId"
                    filter-label-key="projectName"
                    placeholder="选择备用项目"
                    clearable
                    class="filter-item"
                    @change="handleSearch"
                />
                <el-input
                    v-model="searchParam.productCode"
                    clearable
                    class="filter-item"
                    size="mini"
                    placeholder="产品编号"
                    @change="handleSearch"/>
                <RemoteSelect
                    v-model="searchParam.productType"
                    :method="productTypeRemoteMethod"
                    :extend-params="{ categoryId: 'B16C3151-11D2-4364-8F45-63EFFFFCF424' }"
                    label-key="dictName"
                    value-key="dictId"
                    filter-label-key="dictName"
                    placeholder="选择产品类型"
                    clearable
                    class="filter-item"
                    @change="handleSearch"
                />
            </template>
            <template slot="table">
                <TableComponent
                    ref="TableComponent"
                    v-bind="tableData"
                    :page-index.sync="searchParam.pageIndex"
                    :page-size.sync="searchParam.pageSize"
                >
                    <template slot="操作" slot-scope="{row}">
                        <el-dropdown trigger="click" size="small">
                            <el-button
                                size="mini"
                                icon="el-icon-more"
                                title="操作"
                            />
                            <el-dropdown-menu slot="dropdown">
                                <div class="layout-dropdown-item" @click="handleEdit(row)">
                                    <el-dropdown-item icon="el-icon-edit" divided>编辑</el-dropdown-item>
                                </div>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </template>
                </TableComponent>
            </template>
        </layout-filter>
        <EditDialog
            v-if="editDialog.visible"
            :visible="editDialog.visible"
            :data-id="editDialog.dataId"
            :disabled="!editDialog.isEdit"
            @close="editDialog.visible = false"
            @confirm="handleConfirm"
        />
    </div>
</template>

<script>
    import EditDialog from '@/views/inventoryManagement/Backup/ProjectDevice/EditDialog'
    import deviceApi from '@/api/inventory/device'
    import projectApi from '@/api/PM/project'
    import { getPriceFormat } from '@/utils'
    export default {
        components: { EditDialog },
        props: {
            // 数据刷新标志
            freshKey: {
                type: [Number, String, Date],
                default: 0
            }
        },
        data() {
            const that = this
            return {
                productTypeRemoteMethod: deviceApi.getDictList,
                projectRemoteMethod: projectApi.getList,
                searchParam: {
                    pageSize: 15,
                    pageIndex: 1
                },
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            label: '备用项目',
                            prop: 'standbyProjectName',
                            minWidth: 200,
                            isClick: true,
                            dialogType: 'project',
                            idKey: 'standbyProjectId'
                        },
                        {
                            label: '产品编号',
                            prop: 'productCode',
                            minWidth: 100,
                            sortable: false
                        },
                        {
                            label: '产品名称',
                            prop: 'productName',
                            minWidth: 100,
                            sortable: false
                        },
                        {
                            label: '产品类型',
                            prop: 'productType',
                            minWidth: 120,
                            formatter: (params, formData) => {
                                return (that.getDict('productType').find(v => v.value === params[formData.prop]) || {}).label || '- -'
                            }
                        },
                        {
                            label: '在运营数量',
                            prop: 'operateCount',
                            align: 'left',
                            width: 100
                        },
                        {
                            label: '备用比例(%)',
                            prop: 'ratio',
                            align: 'left',
                            width: 100
                        },
                        {
                            label: '应配置备用数量',
                            prop: 'answerCount',
                            align: 'left',
                            width: 100
                        },
                        {
                            label: '已分配备用数量',
                            prop: 'alreadyCount',
                            align: 'left',
                            width: 100,
                            isCopy: false,
                            isClick: true,
                            render: (h, params = {}) => {
                                const { row, column } = params
                                return <span class='link-text' onClick={() => this.onClickDetail(row)}>{row.alreadyCount || '--'}</span>
                            }
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        showSummary: true,
                        summaryMethod: this.handleSummary
                    },
                    // 列操作按钮
                    operates: {
                        width: 60,
                        fixed: 'right',
                        show: true
                    }
                },
                editDialog: {
                    visible: false,
                    dataId: null,
                    isEdit: false
                },
                summaryCount: {
                    sumAlreadyCount: 0,
                    sumAnswerCount: 0,
                    sumOperateCount: 0
                }
            }
        },
        watch: {
            // 监听数据刷新标志
            freshKey() {
                this.init()
            },
            'searchParam.pageSize'() {
                this.getList()
            },
            'searchParam.pageIndex'() {
                this.getList()
            }
        },
        mounted() {
            this.init()
        },
        methods: {
            // 初始化
            init() {
                this.getList()
            },
            /** 加载数据 */
            getList() {
                this.tableData.options.loading = true
                const params = Object.assign({}, this.searchParam)
                deviceApi.getDistributionList(params).then(res => {
                    if (res.success) {
                        this.summaryCount = {
                            sumAlreadyCount: res.data.sumAlreadyCount,
                            sumAnswerCount: res.data.sumAnswerCount,
                            sumOperateCount: res.data.sumOperateCount
                        }
                        this.tableData.list = res.data.data.records
                        this.tableData.total = res.data.data.total
                    }
                })
                this.tableData.options.loading = false
            },
            /** 事件处理 */
            // 搜索
            handleSearch(obj) {
                if (typeof obj === 'object') {
                    this.searchParam = Object.assign({}, this.searchParam, obj)
                    this.getList()
                } else {
                    if (this.searchParam.pageIndex !== 1) {
                        this.searchParam.pageIndex = 1
                    } else {
                        this.getList()
                    }
                }
            },
            // 导出
            handleExport() {
                const data = { ...this.searchParam }
                data.pageSize = this.tableData.total
                deviceApi.exportDistributionList(this.searchParam)
            },
            // 编辑
            handleEdit(row) {
                this.editDialog.dataId = row.id
                this.editDialog.visible = true
                this.editDialog.isEdit = true
            },
            // 详情
            onClickDetail(row) {
                this.editDialog.dataId = row.id
                this.editDialog.visible = true
                this.editDialog.isEdit = false
            },
            // 确定
            handleConfirm() {
                this.editDialog.visible = false
                this.getList()
            },
            handleSummary({ columns, data }) {
                const sums = []
                columns.forEach((column, index) => {
                    if (index === 4) {
                        sums[index] = '合计(非本页)'
                        return
                    }
                    if (index === 5) {
                        sums[index] = this.summaryCount.sumOperateCount
                        return
                    }
                    if (index === 7) {
                        sums[index] = this.summaryCount.sumAnswerCount
                        return
                    }
                    if (index === 8) {
                        sums[index] = this.summaryCount.sumAlreadyCount
                    }
                })
                return sums
            }
        }
    }
</script>

<style scoped>

</style>
