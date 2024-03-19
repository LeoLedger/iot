<!--
* @description 供应商联系人子窗口
* @fileName contactsDialog.vue
* @author 望浩然
-->
<template>
    <div class="contacts-dialog">
        <el-dialog
            v-if="visible"
            :visible.sync="visible"
            :before-close="handleCancel"
            :close-on-click-modal="false"
            :title="'供应商联系人'"
            class="not-top-padding"
            width="1000px"
            append-to-body>
            <div class="section-container">
                <layout-template
                    :table-columns.sync="tableData.columns"
                    :filter-model.sync="searchParam"
                    @search="handleSearch"
                >
                    <template slot="button">
                        <el-button
                            v-waves
                            v-prereclick
                            type="success"
                            size="mini"
                            class="filter-item"
                            icon="el-icon-plus"
                            @click="handleCreate"
                        >添加</el-button>
                    </template>

                    <template slot="filter">
                        <el-input
                            v-if="supplierData"
                            v-model="supplierData.name"
                            class="filter-item"
                            disabled
                            placeholder="所属供应商"
                            size="mini"
                        />
                        <el-input
                            v-model="searchParam.name"
                            clearable
                            class="filter-item"
                            size="mini"
                            placeholder="联系人名称"
                            @change="handleSearch"/>
                    </template>
                    <template slot="table">
                        <TableComponent
                            v-bind="tableData"
                            :cur_row="currentRow"
                            :page-index.sync="searchParam.pageIndex"
                            :page-size.sync="searchParam.pageSize"
                            @refreshList="handleSearch"
                            @handleSingleSelectChange="handleSelect"
                            @handleCurrentChange="handleSelect"
                        >
                            <template slot="操作" slot-scope="{$index, row}">
                                <el-button
                                    type="primary"
                                    icon="el-icon-edit"
                                    title=""
                                    @click="handleEdit(row)"
                                />
                                <el-button
                                    type="danger"
                                    size="mini"
                                    icon="el-icon-delete"
                                    title=""
                                    @click="handleDel(row)"
                                />
                            </template>
                        </TableComponent>
                    </template>
                </layout-template>
            </div>
            <span slot="footer">
                <el-button size="mini" @click="handleCancel">取 消</el-button>
                <el-button v-prereclick v-if="isCreate" :loading="loading" :disabled="!currentRow || !currentRow.guidId" size="mini" type="primary" @click="handleConfirm">设为默认联系人</el-button>
            </span>
        </el-dialog>
        <UpdateDialog
            v-if="editDialog.visible"
            :data-id="editDialog.dataId"
            :visible.sync="editDialog.visible"
            :extend-params="extendParams"
            @update="() => { getList(); $emit('confirm') }"
        />
    </div>
</template>

<script>
    import UpdateDialog from '@/views/PM/contacts/components/UpdateDialog'
    import supplierApi from '@/api/purchase/supplier'
    import contactsApi from '@/api/PM/contacts'
    export default {
        name: 'ContactsDialog',
        components: { UpdateDialog },
        props: {
            // 供应商id
            dataId: {
                type: String,
                default: null
            },
            visible: {
                type: Boolean,
                default: false
            },
            isCreate: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                supplierData: null,
                currentRow: null,
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'name',
                            label: '姓名',
                            fixed: 'left',
                            isClick: true,
                            dialogType: 'contacts'
                        },
                        {
                            prop: 'customerName',
                            label: '所属公司'
                        },
                        {
                            prop: 'deptName',
                            label: '所属部门',
                            disabled: true
                        },
                        {
                            prop: 'position',
                            label: '职务',
                            width: 150
                        },
                        {
                            prop: 'phone',
                            label: '联系电话',
                            width: 180
                        },
                        {
                            prop: 'email',
                            label: '邮箱',
                            width: 200
                        }
                    ],
                    options: {
                        height: '400px',
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        showSingleSelectCheckBox: true,
                        mutiSelectedKey: 'guidId',
                        curRowKey: 'guidId'
                    },

                    // 列操作按钮
                    operates: {
                        width: 120,
                        fixed: 'right',
                        show: true
                    }
                },
                searchParam: {
                    pageIndex: 1,
                    pageSize: 15
                },
                editDialog: {
                    visible: false,
                    dataId: null
                },
                extendParams: {
                    type: 1,
                    lockedCustomer: true
                },
                loading: false
            }
        },
        watch: {
            dataId() {
                this.init()
            },
            visible() {
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
            /** 初始化 */
            init() {
                this.getClientDetail()
            },
            /** 加载数据 */
            // 获取供应商联系人列表数据
            async getList() {
                this.tableData.options.loading = true
                // 设置客户ID筛选
                this.searchParam.customerId = this.supplierData.guidId
                const params = Object.assign({}, this.searchParam)
                const res = await contactsApi.getList(params)
                if (res.success) {
                    this.tableData.list = res.data.records
                    this.tableData.total = res.data.total
                }
                setTimeout(() => {
                    this.tableData.options.loading = false
                }, 500)
            },
            // 获取供应商详情
            getClientDetail() {
                this.supplierData = null
                this.selectedList = []
                supplierApi.detail(this.dataId).then(res => {
                    if (res.success) {
                        this.supplierData = res.data
                        this.selectedList = [{ guidId: this.supplierData.peopleId }]
                        this.getList()
                    }
                })
            },
            /** 事件处理 */
            // 搜索
            handleSearch() {
                this.searchParam = Object.assign({}, this.searchParam)
                this.getList()
            },
            // 创建
            handleCreate() {
                this.extendParams = {
                    ...this.extendParams,
                    customerId: this.supplierData.guidId,
                    customerName: this.supplierData.name,
                    relDeptId: this.supplierData.relDeptId
                }
                this.editDialog.dataId = null
                this.editDialog.visible = true
            },
            handleSelect(row) {
                this.currentRow = row
            },
            // 编辑
            handleEdit(row) {
                this.extendParams = {
                    ...this.extendParams,
                    customerId: row.customerId,
                    customerName: row.customerName,
                    relDeptId: this.supplierData.relDeptId
                }
                this.editDialog.dataId = row.guidId
                this.editDialog.visible = true
            },
            // 删除
            handleDel(row) {
                this.$confirm('是否确认删除?', '警告', {
                    confirmButtonText: '删除',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                }).then(() => {
                    contactsApi.delete(row.id).then(res => {
                        if (res.success) {
                            this.getList()
                            this.$notify({ title: '成功', message: '删除成功', type: 'success', duration: 2000 })
                        }
                    })
                }).catch(() => {})
            },
            // 关闭当前窗口
            handleCancel() {
                this.$emit('close', false)
            },
            handleConfirm() {
                this.loading = true
                const data = {
                    ...this.supplierData,
                    peopleId: this.currentRow.guidId,
                    peopleName: this.currentRow.name,
                    phone: this.currentRow.phone
                }
                supplierApi.update(data).then(res => {
                    if (res.success) {
                        this.$emit('close', false)
                        this.$emit('confirm')
                    }
                }).finally(() => {
                    this.loading = false
                })
            }
        }
    }
</script>

<style lang='scss' scoped>
.section-container {
  height: 100%;
}
</style>
<style lang="scss">
.contacts-dialog {
  .el-dialog__body {
    padding: 0 !important;
  }
}
</style>
