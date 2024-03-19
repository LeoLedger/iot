<!--
* @description 配置项目授权IP
* @author yc
!-->
<template>
    <div>
        <el-dialog
            :visible="visible"
            :before-close="handleDialogClose"
            :close-on-click-modal="false"
            :title="title"
            width="800px"
            class="not-padding"
            append-to-body
        >
            <div v-loading="loading" class="container">
                <layout-filter
                    :table-columns.sync="tableData.columns"
                    :filter-model.sync="searchParam"
                    @search="filterData"
                >
                    <template slot="filter">
                        <el-input
                            v-model="searchParam.productName"
                            size="mini"
                            placeholder="产品名称"
                            clearable
                            class="filter-item"
                            @change="filterData"
                        />
                        <el-input
                            v-model="searchParam.productCode"
                            size="mini"
                            placeholder="产品编号"
                            clearable
                            class="filter-item"
                            @change="filterData"
                        />
                    </template>
                    <template slot="table">
                        <TableComponent
                            ref="TableComponent"
                            v-bind="tableData"
                            :page-index.sync="searchParam.pageIndex"
                            :page-size.sync="searchParam.pageSize"
                        />
                    </template>
                </layout-filter>
            </div>
            <span v-if="isEdit" slot="footer">
                <el-button :loading="loading" size="mini" @click="$emit('update:visible', false)">取 消</el-button>
                <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit">保 存</el-button>
            </span>
            <span v-else slot="footer">
                <el-button :loading="loading" size="mini" @click="$emit('update:visible', false)">关 闭</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    // API
    import projectApi from '@/api/PM/project'
    // 方法
    import { filterList } from '@/utils'
    // 组件

    export default {
        name: 'ConfigEmpowerIp',
        components: {
        },
        props: {
            formList: Array,
            isEdit: { type: Boolean, default: false },
            visible: { type: Boolean, default: false },
            projectId: null
        },
        data() {
            return {
                loading: false,
                dataList: [],
                tableData: {
                    list: [],
                    total: 0,
                    columns: [
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            minWidth: 160
                        },
                        {
                            prop: 'productName',
                            label: '产品名称',
                            minWidth: 160
                        },
                        {
                            prop: 'empowerName',
                            label: '授权IP',
                            minWidth: 200,
                            render: this.isEdit && ((h, { row, column }) => {
                                return (
                                    <dialog-pick
                                        formData={row}
                                        type='empowerIp'
                                        params={{
                                            prop: 'empowerName',
                                            label: '授权IP',
                                            formKey: 'empowerIp',
                                            clearable: true
                                        }}
                                        placeholder='请选择'
                                    />
                               )
                            })
                        }
                    ],
                    options: {
                        height: '446px',
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    }
                },
                searchParam: {
                    pageSize: 10,
                    pageIndex: 1
                },
                updateDialog: {
                    visible: false
                },
                activeRowData: null
            }
        },
        computed: {
            title() {
                return this.isEdit ? '配置项目授权IP' : '项目授权IP'
            }
        },
        watch: {
            'searchParam.pageSize'() {
                this.filterData()
            },
            'searchParam.pageIndex'() {
                this.filterData()
            }
        },
        mounted() {
            if (this.isEdit) {
                this.queryList()
            } else {
                this.queryConfigList()
            }
        },
        methods: {
            // 请求列表数据
            async queryList() {
                this.tableData.options.loading = true
                let res = await projectApi.getEmpowerProduct()
                this.dataList = res.data.map(item => {
                    item.empowerName = ''
                    return item
                })
                this.filterData()
                if (Array.isArray(this.formList)) {
                    this.dataList.forEach(item => {
                        let data = this.formList.find(v => v.productId === item.productId) || {}
                        item.empowerIp = data.empowerIp
                        item.empowerName = (this.getDict('empowerIp').find(v => v.value === data.empowerIp) || {}).label || ''
                    })
                } else if (this.projectId) {
                    this.queryConfigList()
                }
                this.tableData.options.loading = false
            },
            // 获取已配置的产品
            async queryConfigList() {
                this.tableData.options.loading = true
                let res = await projectApi.getEmpowerProduct({
                    guidId: this.projectId
                })
                if (this.isEdit) {
                    this.dataList.forEach(item => {
                        let data = res.data.find(v => v.productId === item.productId) || {}
                        item.empowerIp = data.empowerIp
                        item.empowerName = (this.getDict('empowerIp').find(v => v.value === data.empowerIp) || {}).label || ''
                    })
                } else {
                    this.dataList = res.data.map(item => {
                        item.empowerName = (this.getDict('empowerIp').find(v => v.value === item.empowerIp) || {}).label || ''
                        return item
                    })
                    this.filterData()
                }
                this.tableData.options.loading = false
            },
            // 筛选数据
            filterData() {
                var { pageSize, pageIndex } = this.searchParam
                var list = filterList(this.dataList, this.searchParam, [
                    { name: 'productName', type: 'string' },
                    { name: 'productCode', type: 'string' }
                ])
                this.tableData.total = list.length
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
            },
            // 点击提交按钮时触发
            handleSubmit() {
                this.$emit('update', this.dataList.filter(v => v.empowerIp))
                this.$emit('update:visible', false)
            },
            // 弹窗关闭时触发
            handleDialogClose() {
                if (this.isEdit) {
                    this.$confirm('确认放弃本次操作？').then(_ => {
                        this.$emit('update:visible', false)
                    }).catch(_ => {
                        return false
                    })
                } else {
                    this.$emit('update:visible', false)
                }
            }
        }
    }
</script>

<style lang='scss' scoped>
.container {
    padding: 10px 20px;
}
</style>
