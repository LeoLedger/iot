<!--
* @description  项目
* @fileName index.vue
* @author 易超
!-->
<template>
    <layout-template
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        :filter-button="checkFeature(['ty.iot.product.search'])"
        class="project"
        @search="handleFilter"
    >
        <template slot="button">
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.product.export'])"
                size="mini"
                class="filter-button"
                type="warning"
                icon="el-icon-download"
                @click="handleExport"
            >导出</el-button>
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.product.create'])"
                size="mini"
                class="filter-button"
                type="success"
                icon="el-icon-plus"
                @click="handleUpdate()"
            >新增</el-button>
            <ImportButton
                :download-method="handleDownloadTemplate"
                class="filter-item"
                type="primary"
                action="product/import"
                title="产品列表导入"
                template-name="产品记录模板.xlsx"
                @success="handleImportConfirm"
            />
        </template>
        <template slot="filter">
            <DictSelect
                v-model="searchParam.type"
                type="productType"
                placeholder="产品类型"
                clearable
                filterable
                class="filter-item"
                size="mini"
                width="200px"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.code"
                placeholder="产品编号"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
        </template>
        <template slot="filter-popup">
            <layout-filter-item label="产品名称">
                <el-input
                    v-model="searchParam.name"
                    placeholder="产品名称"
                    size="mini"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="供应商">
                <RemoteSelect
                    v-model="searchParam.supplierId"
                    :method="supplierRemoteMethod"
                    label-key="name"
                    value-key="guidId"
                    filter-label-key="name"
                    placeholder="选择供应商"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="产品种类">
                <DictSelect
                    v-model="searchParam.categoryId"
                    type="productCategory"
                    placeholder="产品种类"
                    clearable
                    filterable
                    size="mini"
                />
            </layout-filter-item>
        </template>
        <template slot="table">
            <TableComponent
                v-bind="tableData"
                :page-index.sync="searchParam.pageIndex"
                :page-size.sync="searchParam.pageSize"
                @refreshList="handleRefreshList"
            >
                <template slot="操作" slot-scope="{row}">
                    <el-dropdown v-if="includeFeature(['ty.iot.product.update', 'ty.iot.product.delete'])" trigger="click" size="small">
                        <el-button
                            size="mini"
                            icon="el-icon-more"
                            title="操作"
                        />
                        <el-dropdown-menu slot="dropdown">
                            <div v-if="checkFeature(['ty.iot.product.update'])" class="layout-dropdown-item" @click="handleUpdate(row)">
                                <el-dropdown-item icon="el-icon-edit" divided>编辑</el-dropdown-item>
                            </div>
                            <div v-if="checkFeature(['ty.iot.product.delete'])" class="layout-dropdown-item" @click="handleDelete(row)">
                                <el-dropdown-item icon="el-icon-delete" divided>删除</el-dropdown-item>
                            </div>
                        </el-dropdown-menu>
                    </el-dropdown>
                </template>
            </TableComponent>
        </template>
        <div>
            <!-- 编辑数据 -->
            <UpdateDialog
                v-if="updateDialogVisible"
                :data-id="activeRowId"
                :visible.sync="updateDialogVisible"
                is-edit
                @update="getList"
            />
        </div>
    </layout-template>
</template>
<script>
    // 工具
    // API
    import productApi from '@/api/purchase/product'
    import supplierApi from '@/api/purchase/supplier'
    // 组件
    import UpdateDialog from './components/UpdateDialog'
    import ImportButton from '@/components/customizeFormItem/ImportButton'

    export default {
        components: {
            UpdateDialog,
            ImportButton
        },
        props: {},
        data() {
            return {
                searchParam: {
                    type: '', // 产品类型
                    code: '', // 产品编号
                    supplierId: '', // 供应商
                    categoryId: '', // 产品种类
                    pageSize: 15,
                    pageIndex: 1
                },
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'code',
                            label: '产品编号',
                            width: 180,
                            disabled: true,
                            isClick: true,
                            dialogType: 'product'
                        },
                        {
                            prop: 'qqProductCode',
                            label: '企企物料编号',
                            width: 180,
                            disabled: true
                        },
                        {
                            prop: 'qqStandard',
                            label: '企企规格型号',
                            width: 180,
                            disabled: true
                        },
                        {
                            prop: 'qqProductUnit',
                            label: '企企物料单位',
                            width: 180,
                            disabled: true
                        },
                        {
                            prop: 'name',
                            label: '产品名称',
                            width: 260,
                            disabled: true
                        },
                        {
                            type: 'dict',
                            dictType: 'productType',
                            prop: 'type',
                            label: '产品类型',
                            width: 190
                        },
                        {
                            type: 'dict',
                            dictType: 'productCategory',
                            prop: 'categoryId',
                            label: '产品种类',
                            width: 140
                        },
                        {
                            prop: 'supplierName',
                            label: '供应商',
                            width: 240
                        },
                        {
                            prop: 'remark',
                            label: '备注',
                            minWidth: 300
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    },
                    // 列操作按钮
                    operates: {
                        width: 70,
                        fixed: 'right',
                        show: true
                    }
                },
                supplierRemoteMethod: supplierApi.getList,
                activeRowId: null,
                updateDialogVisible: false
            }
        },
        computed: {
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
                var res = await productApi.getList(this.searchParam)
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
            // 点击新增or编辑按钮时触发
            handleUpdate(data = {}) {
                this.activeRowId = data.guidId
                this.updateDialogVisible = true
            },
            // 点击删除按钮时触发
            async handleDelete(data) {
                await this.$confirm('此操作将删除此产品信息, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                })
                this.tableData.options.loading = true
                try {
                    var res = await productApi.delete(data.id)
                    if (res.success) {
                        await this.getList()
                        this.$notify({
                            title: '成功',
                            message: '删除成功',
                            type: 'success',
                            duration: 2000
                        })
                    }
                } catch (e) {}
                this.tableData.options.loading = false
            },
            // 点击导出按钮时触发
            handleExport() {
                var data = { ...this.searchParam }
                data.pageSize = this.tableData.total
                productApi.export(data)
            },
            // 点击排序时触发
            handleRefreshList(obj) {
                this.searchParam = Object.assign({}, this.searchParam, obj)
                this.getList()
            },
            // 导入
            handleImportConfirm(data) {
                var failure = data.reduce((a, b) => {
                    if (b.code > 0) {
                        return a + 1
                    }
                    return a
                }, 0)
                var succeed = data.length - failure
                var messageNode = `<p style="margin-bottom: 4px;">导入成功${succeed}条数据，导入失败${failure}条数据</p>`
                messageNode += data.map((item, index) => {
                    if (item.code > 0) {
                        return `<p>第${index + 1}行：${item.errorMsg}</p>`
                    }
                }).filter(v => v).join('')
                this.$message({
                    type: 'success',
                    duration: failure > 0 ? 0 : 5000,
                    showClose: true,
                    message: messageNode,
                    dangerouslyUseHTMLString: true
                })
                this.tableData.list = data.filter(item => item.code === 0).map(item => item.data).concat(this.tableData.list)
                console.log(123);
                this.handleFilter()
            },
            // 下载模板
            handleDownloadTemplate() {
                productApi.downTemplate({ tem: 1 }).then(res => {
                    this.$message({ type: 'success', message: '已获取导入模板, 请按模板填写数据后导入' })
                })
            }
        }
    }
</script>

<style lang='scss' scoped>

</style>
