<!--
* @description 配置项目数据同步规则
* @author yc
!-->
<template>
    <div>
        <el-dialog
            :visible="visible"
            :before-close="handleDialogClose"
            :close-on-click-modal="false"
            title="配置项目数据同步规则"
            width="800px"
            class="not-padding"
            append-to-body
        >
            <div v-loading="loading" class="container">
                <layout-filter
                    :table-columns.sync="tableData.columns"
                    :filter-model.sync="searchParam"
                    @search="handleFilter"
                >
                    <template slot="button">
                        <el-button
                            v-waves
                            size="mini"
                            class="filter-button"
                            type="success"
                            icon="el-icon-plus"
                            @click="handleUpdate()"
                        >添加</el-button>
                    </template>
                    <template slot="filter">
                        <el-input
                            v-model="searchParam.projectName"
                            size="mini"
                            placeholder="项目名称"
                            clearable
                            class="filter-item"
                            @change="handleFilter"
                        />
                        <el-input
                            v-model="searchParam.projectCode"
                            size="mini"
                            placeholder="项目编号"
                            clearable
                            class="filter-item"
                            @change="handleFilter"
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
                                        <div class="layout-dropdown-item" @click="handleSync(row)">
                                            <el-dropdown-item icon="el-icon-sort" divided>同步数据</el-dropdown-item>
                                        </div>
                                        <div class="layout-dropdown-item" @click="handleUpdate(row)">
                                            <el-dropdown-item icon="el-icon-edit" divided>编辑</el-dropdown-item>
                                        </div>
                                        <div class="layout-dropdown-item" @click="handleDelete(row)">
                                            <el-dropdown-item icon="el-icon-delete" divided>删除</el-dropdown-item>
                                        </div>
                                    </el-dropdown-menu>
                                </el-dropdown>
                            </template>
                        </TableComponent>
                    </template>
                </layout-filter>
            </div>
            <span slot="footer">
                <el-button :loading="loading" size="mini" @click="$emit('update:visible', false)">取 消</el-button>
                <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit">保 存</el-button>
            </span>
        </el-dialog>
        <RuleUpdateDialog
            v-if="ruleUpdateDialog.visible"
            :visible.sync="ruleUpdateDialog.visible"
            :form-data="activeRowData"
            is-edit
            @change="handleRuleChange"
        />
    </div>
</template>

<script>
    // API
    import projectApi from '@/api/PM/project'
    // 方法
    // 组件
    import RuleUpdateDialog from './UpdateDialog'

    export default {
        name: 'ConfigSyncRule',
        components: {
            RuleUpdateDialog
        },
        props: {
            visible: { type: Boolean, default: false }
        },
        data() {
            return {
                loading: false,
                dataList: [],
                tableData: {
                    list: [{}],
                    total: 0,
                    columns: [
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            minWidth: 155
                        },
                        {
                            prop: 'productName',
                            label: '项目名称'
                        },
                        {
                            type: 'dateRange',
                            startKey: '',
                            endKey: '',
                            prop: 'xxx',
                            label: '同步周期',
                            minWidth: 200
                        }
                    ],
                    options: {
                        height: '446px',
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    },
                    operates: {
                        width: 55,
                        fixed: 'right',
                        show: true
                    }
                },
                searchParam: {
                    pageSize: 10,
                    pageIndex: 1
                },
                activeRowData: null,
                ruleUpdateDialog: {
                    visible: false
                }
            }
        },
        computed: {

        },
        watch: {
        },
        mounted() {
        },
        methods: {
            // 筛选数据
            filterData() {
                var { pageSize, pageIndex } = this.searchParam
                var list = this.dataList
                this.tableData.total = list.length
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
            },
            // 点击同步数据按钮时触发
            handleSync() {

            },
            // 点击编辑按钮时触发
            handleUpdate(data) {
                this.activeRowData = data
                this.ruleUpdateDialog.visible = true
            },
            // 点击删除按钮时触发
            handleDelete(data) {
                this.dataList.splice(this.dataList.indexOf(data), 1)
                this.filterData()
            },
            // 筛选列表
            handleFilter() {
                this.filterData()
            },
            // 点击提交按钮时触发
            handleSubmit() {

            },
            // 弹窗关闭时触发
            handleDialogClose() {
                this.$confirm('确认放弃本次操作？').then(_ => {
                    this.$emit('update:visible', false)
                }).catch(_ => {
                    return false
                })
            },
            // 更新规则后触发
            handleRuleChange(data) {
                this.dataList.splice(0, 0, data)
                this.filterData()
            }
        }
    }
</script>

<style lang='scss' scoped>
.container {
    padding: 10px 20px;
}
</style>
