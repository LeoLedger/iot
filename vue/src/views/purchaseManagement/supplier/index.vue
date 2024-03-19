<!--
* @description 供应商
* @fileName index.vue
* @author 望浩然
!-->
<template>
    <div class="section-container">
        <layout-template
            :table-columns.sync="tableData.columns"
            :filter-model.sync="searchParam"
            :filter-button="checkFeature(['ty.iot.purchaseSupplier.search'])"
            @search="handleSearch"
        >
            <template slot="button">
                <el-button
                    v-waves
                    v-prereclick
                    v-if="checkFeature(['ty.iot.purchaseSupplier.export'])"
                    type="warning"
                    size="mini"
                    class="filter-item"
                    icon="el-icon-download"
                    @click="handleExport"
                >导出</el-button>
                <el-button
                    v-waves
                    v-prereclick
                    v-if="checkFeature(['ty.iot.purchaseSupplier.create'])"
                    type="success"
                    size="mini"
                    class="filter-item"
                    icon="el-icon-plus"
                    @click="handleCreate"
                >新增</el-button>
            </template>
            <template slot="filter">
                <el-input
                    v-model="searchParam.name"
                    clearable
                    class="filter-item"
                    size="mini"
                    placeholder="供应商名称"
                    @change="handleSearch"/>
                <RegionCascader
                    v-model="searchParam.regionList"
                    clearable
                    placeholder="请选择所属地区"
                    class="filter-item"
                    style="width:200px;"
                    @change="handleSearch"
                />
            </template>
            <template slot="filter-popup">
                <layout-filter-item label="联系人名称">
                    <el-input
                        v-model="searchParam.peopleName"
                        clearable
                        class="filter-item"
                        size="mini"
                        placeholder="联系人名称"/>
                </layout-filter-item>
            </template>
            <template slot="table">
                <TableComponent
                    v-bind="tableData"
                    :cur_row="currentRow"
                    :page-index.sync="searchParam.pageIndex"
                    :page-size.sync="searchParam.pageSize"
                    :table-row-class-name="handleTableRowClassName"
                    @refreshList="handleSearch"
                    @handleCurrentChange="handleRowClick"
                >
                    <template slot="操作" slot-scope="scope">
                        <el-dropdown v-if="includeFeature(['ty.iot.purchaseSupplier.update', 'ty.iot.purchaseSupplier.delete'])" trigger="click" size="small">
                            <el-button
                                size="mini"
                                icon="el-icon-more"
                                title="操作"
                            />
                            <el-dropdown-menu slot="dropdown">
                                <div v-if="checkFeature(['ty.iot.purchaseSupplier.update'])" class="layout-dropdown-item" @click="handleEdit(scope.row)">
                                    <el-dropdown-item icon="el-icon-edit" divided>编辑</el-dropdown-item>
                                </div>
                                <div v-if="checkFeature(['ty.iot.purchaseSupplier.delete'])" class="layout-dropdown-item" @click="handleDel(scope.row)">
                                    <el-dropdown-item icon="el-icon-delete" divided>删除</el-dropdown-item>
                                </div>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </template>
                </TableComponent>
            </template>
        </layout-template>
        <edit-dialog
            v-if="editDialog.visible"
            :visible="editDialog.visible"
            :data-id="editDialog.dataId"
            :is-create="editDialog.isCreate"
            @more="handleShowContacts"
            @close="handleClose('editDialog')"
            @confirm="handleConfirm('editDialog')"
        />
        <detail-dialog
            v-if="detailDialog.visible"
            :visible="detailDialog.visible"
            :data-id="detailDialog.dataId"
            @close="handleClose('detailDialog')"
        />
        <contacts-dialog
            v-if="contactsDialog.visible"
            :visible="contactsDialog.visible"
            :data-id="contactsDialog.dataId"
            @close="handleClose('contactsDialog')"
        />
    </div>
</template>
<script>
    // 工具
    // API
    import resourceApi from '@/api/resource'
    import supplierApi from '@/api/purchase/supplier'
    // 组件
    import DetailDialog from '@/views/purchaseManagement/supplier/components/DetailDialog'
    import EditDialog from '@/views/purchaseManagement/supplier/components/EditDialog'
    import ContactsDialog from '@/views/purchaseManagement/supplier/components/ContactsDialog'
    import contactsApi from '@/api/PM/contacts'
    import customerApi from '@/api/PM/customer'

    export default {
        components: {
            ContactsDialog,
            EditDialog,
            DetailDialog
        },
        props: {},
        data() {
            return {
                currentRow: null,
                tableData: {
                    list: [],
                    total: 0,
                    options: {
                        stripe: true,
                        fit: true,
                        loading: false,
                        curRowKey: 'id' // 高亮当前判断的 key
                    },
                    // 列操作按钮
                    operates: {
                        width: 60,
                        fixed: 'right',
                        show: true
                    },
                    columns: [
                        {
                            label: '供应商名称',
                            prop: 'name',
                            sortable: false,
                            disabled: true,
                            render: (h, params = {}) => {
                                const { row, column } = params
                                return <span class='link-text' onClick={() => this.onClickDetail(row)}>{row.name || '--'}</span>
                            },
                            minWidth: 250
                        },
                        {
                            label: '联系人',
                            prop: 'peopleName',
                            width: 120
                        },
                        {
                            label: '联系电话',
                            prop: 'phone',
                            width: 150
                        },
                        {
                            label: '所属地区',
                            prop: 'regionName',
                            minWidth: 150
                        },
                        {
                            label: '客户地址',
                            prop: 'address',
                            minWidth: 250
                        }
                    ]
                },
                searchParam: {
                    pageIndex: 1,
                    pageSize: 15,
                    regionList: [],
                    name: null
                },
                areaOptions: [],
                detailDialog: {
                    visible: false,
                    dataId: null
                },
                editDialog: {
                    visible: false,
                    dataId: null,
                    isCreate: false
                },
                contactsDialog: {
                    visible: false,
                    dataId: null
                }
            }
        },
        computed: {},
        watch: {
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
                this.getList()
            },
            /** 加载数据 */
            // 获取客户列表数据
            getList() {
                this.tableData.options.loading = true
                const [provinceId, cityId, areaId] = this.searchParam.regionList
                const params = {
                    ...this.searchParam,
                    areaId,
                    cityId,
                    provinceId
                }
                delete params.regionList
                supplierApi.getList(params).then(res => {
                    if (res.success) {
                        this.tableData.list = res.data.records.map(item => {
                            return item
                        })
                        this.tableData.total = res.data.total
                    }
                })
                this.tableData.options.loading = false
            },
            /** 点击事件类 */
            // 查看详情
            onClickDetail(row) {
                this.detailDialog.dataId = row.guidId
                this.detailDialog.type = 'detail'
                this.detailDialog.visible = true
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
            // 行点击
            handleRowClick() {},
            // 根据对应字段状态 修改行样式
            handleTableRowClassName({ row, rowIndex }) {
                return ''
            },
            // 创建
            handleCreate() {
                this.editDialog.dataId = null
                this.editDialog.isCreate = true
                this.editDialog.visible = true
            },
            // 导出
            handleExport() {
                var data = { ...this.searchParam }
                data.pageSize = this.tableData.total
                supplierApi.export(this.searchParam)
            },
            // 编辑
            handleEdit(row) {
                this.editDialog.dataId = row.guidId
                this.editDialog.isCreate = false
                this.editDialog.visible = true
            },
            // 删除
            handleDel(row) {
                // 判断当前供应商是否有联系人
                contactsApi.getList({ customerId: row.guidId }).then(res => {
                    if (res.success) {
                        let msg = '是否确认删除该供应商？'
                        if (res.data.records.length) {
                            msg = '检测到该供应商下有联系人，删除供应商将会自动删除供应商下所有联系人，是否确认删除该供应商？'
                        }
                        this.$confirm(msg, '警告', {
                            confirmButtonText: '删除',
                            cancelButtonText: '取消',
                            type: 'warning',
                            center: true
                        }).then(() => {
                            supplierApi.delete(row.guidId).then(res => {
                                if (res.success) {
                                    this.getList()
                                    this.$notify({ title: '成功', message: '删除成功', type: 'success', duration: 2000 })
                                }
                            })
                        })
                    }
                })
            },
            // 子窗口关闭
            handleClose(objName) {
                this[objName].visible = false
                this[objName].dataId = null
            },
            // 子窗口确认操作
            handleConfirm(objName) {
                this[objName].visible = false
                this[objName].dataId = null
                // 确认操作需要刷新主列表
                this.getList()
            },
            // 子窗口: 客户联系人列表
            handleShowContacts(clientId) {
                this.contactsDialog.dataId = clientId
                this.contactsDialog.visible = true
            }
        }
    }
</script>

<style lang='scss' scoped>
.section-container {
  height: 100%;
}
</style>
