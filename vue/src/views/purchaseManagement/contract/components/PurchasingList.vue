<!--
* @description 采购清单
* @author yc
!-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        :show-toolbar="isEdit"
        @search="handleFilter"
    >
        <template slot="button">
            <el-button
                v-waves
                v-if="isEdit"
                size="mini"
                class="filter-button"
                type="success"
                icon="el-icon-plus"
                @click="handleUpdate()"
            >添加</el-button>
        </template>
        <template slot="filter">
            <el-input
                v-model="searchParam.name"
                placeholder="产品名称"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
        </template>
        <template slot="table">
            <TableComponent
                v-bind="tableData"
                :page-index.sync="searchParam.pageIndex"
                :page-size.sync="searchParam.pageSize"
                :empty-hide-table="!isEdit"
                @refreshList="handleRefreshList"
            >
                <template slot="操作" slot-scope="{$index, row}">
                    <el-dropdown trigger="click" size="small">
                        <el-button
                            size="mini"
                            icon="el-icon-more"
                            title="操作"
                        />
                        <el-dropdown-menu slot="dropdown">
                            <div class="layout-dropdown-item" @click="handleUpdate(row)">
                                <el-dropdown-item icon="el-icon-edit" divided>编辑</el-dropdown-item>
                            </div>
                            <div class="layout-dropdown-item" @click="handleDelete($index)">
                                <el-dropdown-item icon="el-icon-delete" divided>删除</el-dropdown-item>
                            </div>
                        </el-dropdown-menu>
                    </el-dropdown>
                </template>
            </TableComponent>
        </template>
        <div>
            <!-- 添加采购清单 -->
            <UpdateDialog
                v-if="updateDialogVisible"
                :row-data="activeRowData"
                :visible.sync="updateDialogVisible"
                :excludes="excludes"
                :extend-params="extendParams"
                is-edit
                @update="handleSubmitUpdate"
            />
            <SelectDialog
                v-if="selectDialog.visible"
                v-bind="selectDialog"
                :visible.sync="selectDialog.visible"
            />
        </div>
    </layout-filter>
</template>

<script>
    // API
    import storagePutApi from '@/api/businessDocuments/storagePut'
    // 方法
    import enums from '@/utils/enum'
    // 组件
    import UpdateDialog from '../purchasing/UpdateDialog'
    import SelectDialog from '@/components/SelectDialog'

    export default {
        components: {
            UpdateDialog,
            SelectDialog
        },
        props: {
            isEdit: { type: Boolean, default: true },
            formData: { type: Object }
        },
        data() {
            return {
                searchParam: {
                    name: ''
                },
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            minWidth: 120,
                            disabled: true
                        },
                        {
                            prop: 'productName',
                            label: '产品名称',
                            minWidth: 120,
                            disabled: true
                        },
                        {
                            type: 'dict',
                            dictType: 'productType',
                            prop: 'productType',
                            label: '产品类型',
                            width: 140,
                            disabled: true
                        },
                        {
                            prop: 'count',
                            label: '采购数量'
                        },
                        {
                            prop: 'unitPrice',
                            label: '采购单价',
                            align: 'right'
                        },
                        {
                            prop: '_totalAmount',
                            label: '金额',
                            align: 'right'
                        },
                        {
                            prop: 'taxRate',
                            label: '税率'
                        },
                        {
                            prop: 'countInbound',
                            label: '已入库',
                            isCopy: false,
                            isClick: ({ row }) => {
                                let category = enums.productCategoryId.find(v => v.id === row.productCategory)
                                if (category && category.value !== 2) {
                                    return !this.isEdit
                                }
                            },
                            onClick: (data) => {
                                this.selectDialog = {
                                    type: 'device',
                                    title: '已入库',
                                    visible: true,
                                    onlyShow: true,
                                    customRequest: storagePutApi.getDeviceList,
                                    extendParams: {
                                        contractId: this.formData.guidId,
                                        productId: data.productId,
                                        productCategory: data.productCategory,
                                        approvalStatus: 3
                                    }
                                }
                            }
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: this.isEdit ? '100%' : null,
                        maxHeight: null
                    },
                    // 列操作按钮
                    operates: {
                        width: 70,
                        fixed: 'right',
                        show: this.isEdit
                    }
                },
                excludes: [],
                selectDialog: {
                    visible: false
                },
                extendParams: {
                    supplierId: ''
                },
                activeRowData: null,
                updateDialogVisible: false
            }
        },
        computed: {
        },
        watch: {
            formData: {
                deep: true,
                immediate: true,
                handler(data) {
                    if (data) {
                        this.productList = data.prodList || []
                        this.extendParams.supplierId = data.partyB
                        this.updateList()
                    }
                }
            }
        },
        mounted() {
        },
        methods: {
            // 请求列表数据
            async getList() {
                this.tableData.options.loading = true
                var res = await productApi.getList(this.searchParam)
                if (res.success) {
                    this.tableData.list = res.data.records.map(item => {
                        return item
                    })
                    this.tableData.total = res.data.total
                }
                this.tableData.options.loading = false
            },
            // 更新表格数据列表
            updateList() {
                this.excludes = this.productList.map(v => v.productId)
                this.tableData.list = this.productList.filter(item => {
                    return this.searchParam.name === '' || item.productName.indexOf(this.searchParam.name) > -1
                })
            },
            // 筛选列表
            handleFilter() {
                this.updateList()
            },
            // 点击新增or编辑按钮时触发
            handleUpdate(data) {
                if (!data && !this.formData.partyB) {
                    return this.$message.warning('请先选择合同乙方')
                }
                this.activeRowData = data
                this.updateDialogVisible = true
            },
            // 点击删除按钮时触发
            handleDelete(index) {
                this.productList.splice(index, 1)
                this.$emit('update', this.productList)
            },
            // 点击排序时触发
            handleRefreshList(obj) {
                this.searchParam = Object.assign({}, this.searchParam, obj)
                this.getList()
            },
            // 采购清单表单更新时触发
            handleSubmitUpdate(data) {
                if (this.activeRowData) {
                    // 编辑
                    var index = this.productList.findIndex(v => v === this.activeRowData)
                    if (index > -1) {
                        this.activeRowData = {
                            ...this.activeRowData,
                            ...data
                        }
                        this.productList[index] = this.activeRowData
                    }
                } else {
                    // 新增
                    this.productList.splice(0, 0, data)
                }
                this.updateList()
                this.$emit('update', this.productList)
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
