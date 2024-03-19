<!--
* @description 维修单
* @author 望浩然
* @date 2021/5/10 - 2021/5/13
!-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        :filter-button="checkFeature(['ty.iot.approvalList.search'])"
        @search="handleFilter"
    >
        <template slot="button">
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.approvalList.export'])"
                size="mini"
                class="filter-button"
                type="warning"
                icon="el-icon-download"
                @click="handleExport"
            >导出</el-button>
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.approvalList.create'])"
                size="mini"
                class="filter-button"
                type="success"
                icon="el-icon-plus"
                @click="handleUpdate()"
            >登记</el-button>
        </template>
        <template slot="filter">
            <el-input
                v-model="searchParam.code"
                placeholder="故障单号"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
        </template>
        <template slot="filter-popup">
            <layout-filter-item label="单据状态">
                <DictSelect
                    v-model="searchParam.status"
                    type="repairStatus"
                    placeholder="选择单据状态"
                    clearable
                    filterable
                    size="mini"/>
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
            <layout-filter-item label="登记人">
                <RemoteSelect
                    v-model="searchParam.regisUserId"
                    :method="userRemoteMethod"
                    label-key="userName"
                    value-key="userId"
                    filter-label-key="userName"
                    placeholder="选择登记人"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="登记时间">
                <el-date-picker
                    v-model="searchParam.createTime"
                    :default-time="['00:00:00', '23:59:59']"
                    type="daterange"
                    format="yyyy-MM-dd"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    range-separator="至"
                    start-placeholder="开始"
                    end-placeholder="结束"
                    clearable
                />
            </layout-filter-item>
        </template>
        <template slot="table">
            <TableComponent
                v-bind="tableData"
                :page-index.sync="searchParam.pageIndex"
                :page-size.sync="searchParam.pageSize"
                :selected-list="selectedList"
                @refreshList="handleRefreshList"
                @handleSelectionChange="handleSelect"
            >
                <template v-if="row.status === 0 || row.status === 2" slot="操作" slot-scope="{row}">
                    <el-dropdown trigger="click" size="small" v-if="includeFeature(['ty.iot.approvalList.confirm'])">
                        <el-button
                            size="mini"
                            icon="el-icon-more"
                            title="操作"
                        />
                        <el-dropdown-menu slot="dropdown">
                            <div v-if="checkFeature(['ty.iot.approvalList.confirm']) && (row.status === 0 || row.status === 2)" class="layout-dropdown-item" @click="handleConfirm(row)">
                                <el-dropdown-item icon="el-icon-edit" divided>维修确认</el-dropdown-item>
                            </div>
                            <div v-if="checkFeature(['ty.iot.approvalList.edit']) && row.status === 0" class="layout-dropdown-item" @click="handleEdit(row)">
                                <el-dropdown-item icon="el-icon-edit" divided>编辑</el-dropdown-item>
                            </div>
                            <div v-if="checkFeature(['ty.iot.approvalList.delete']) && row.status === 0" class="layout-dropdown-item" @click="handleDelete(row)">
                                <el-dropdown-item icon="el-icon-edit" divided>删除</el-dropdown-item>
                            </div>
                        </el-dropdown-menu>
                    </el-dropdown>
                </template>
            </TableComponent>
        </template>
        <reg-dialog
            v-if="resignDialog.visible"
            :visible.sync="resignDialog.visible"
            :is-edit="resignDialog.isEdit"
            :data-id="resignDialog.dataId"
            :is-detail="resignDialog.isDetail"
            @update="getList"
        />
        <reg-edit-dialog
            v-if="regEditDialog.visible"
            :visible.sync="regEditDialog.visible"
            :is-edit="regEditDialog.isEdit"
            :data-id="regEditDialog.dataId"
            @update="getList"
        />
        <confirm-dialog
            v-if="confirmDialog.visible"
            :visible.sync="confirmDialog.visible"
            :data-id="confirmDialog.dataId"
            @update="getList"
        />
        <div/>
    </layout-filter>
</template>

<script>
    // 方法
    import enums from '@/utils/enum'
    // API
    import approvalApi from '@/api/operationsManagement/carTroubleTicket'
    import resourceApi from '@/api/resource'
    import supplierApi from '@/api/purchase/supplier'
    // 组件
    import regDialog from './regDialog'
    import regEditDialog from './regEditDialog'
    import confirmDialog from './confirmDialog'
    import productApi from '@/api/purchase/product'
    export default {
        components: {
            regDialog, confirmDialog, regEditDialog
        },
        props: {
        },
        data() {
            return {
                selectedList: [], // 选中的数据
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'code',
                            label: '维修单号',
                            isClick: true,
                            minWidth: 150,
                            dialogType: 'carTroubleBill',
                            idKey: 'guidId'
                        },
                        {
                            prop: 'status',
                            label: '单据状态',
                            width: 100,
                            type: 'status',
                            enums: enums.repairStatus
                        },
                        {
                            prop: 'supplierName',
                            label: '供应商',
                            minWidth: 150
                        },
                        {
                            prop: 'num',
                            label: '报修数量',

                            width: 100,
                            sortable: 'custom',
                            dbProp: 'c_num'
                        },
                        {
                            prop: 'remark',
                            label: '备注'
                        },
                        {
                            prop: 'userName',
                            label: '登记人',
                            minWidth: 100
                        },
                        {
                            prop: 'createTime',
                            label: '登记时间',
                            sortable: 'custom',
                            dbProp: 'c_create_time',
                            width: 180
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        mutiSelect: true // 是否多选
                    },
                    // 列操作按钮
                    operates: {
                        width: 70,
                        fixed: 'right',
                        show: true
                    }
                },
                searchParam: {
                    pageSize: 15,
                    pageIndex: 1
                },
                activeRowData: null,
                userRemoteMethod: resourceApi.getUserList,
                supplierRemoteMethod: supplierApi.getList,
                resignDialog: {
                    visible: false,
                    isEdit: false,
                    dataId: null
                },
                confirmDialog: {
                    dateId: null,
                    visible: false
                },
                regEditDialog: {
                    visible: false,
                    isEdit: true,
                    dataId: null
                }
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
                const res = await approvalApi.getList({ ...this.searchParam })
                if (res.success) {
                    this.tableData.list = res.data.records
                    this.tableData.total = res.data.total
                }
                this.tableData.options.loading = false
            },
            // 筛选列表
            handleFilter() {
                this.selectedList = []
                if (this.searchParam.pageIndex !== 1) {
                    this.searchParam.pageIndex = 1
                } else {
                    this.getList()
                }
            },
            // 登记
            handleUpdate(data) {
                this.activeRowData = data
                this.resignDialog.visible = true
                this.resignDialog.isEdit = true
                this.resignDialog.dataId = null
                this.resignDialog.isDetail = false
            },
            // 确认
            handleConfirm(data) {
                this.confirmDialog.visible = true
                this.confirmDialog.dataId = data.guidId
            },
            // 编辑
            handleEdit(data) {
                this.regEditDialog.visible = true
                this.regEditDialog.dataId = data.guidId
            },
            // 删除
            handleDelete(row) {
                this.$confirm('是否确认删除?', '警告', {
                    confirmButtonText: '删除',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                }).then(() => {
                    approvalApi.delete(row.guidId).then(res => {
                        if (res.success) {
                            this.getList()
                            this.$notify({ title: '成功', message: '删除成功', type: 'success', duration: 2000 })
                        }
                    })
                }).catch(() => {})
            },
            // 点击导出按钮时触发
            handleExport() {
                const data = { ...this.searchParam }
                data.pageSize = this.tableData.total
                // approvalApi.export(data)
                if (this.selectedList.length > 0) {
                    data.ids = this.selectedList.map(item => item.id)
                }
                approvalApi.exportByPost(data)
            },
            // 详细
            handleDetail(data) {
                this.activeRowData = data
                this.resignDialog.visible = true
                this.resignDialog.isEdit = false
                this.resignDialog.isDetail = true
                this.resignDialog.dataId = data.guidId
            },
            // 点击排序时触发
            handleRefreshList(obj) {
                this.searchParam = Object.assign({}, this.searchParam, obj)
                this.getList()
            },
            handleSelect(row) {
                this.selectedList = row
            }
        }
    }
</script>

<style lang='scss' scoped>
.flex-align-center {
    display: flex;
    align-items: center;
    .flex {
        flex: 1;
    }
    .separator {
        margin: 0 8px;
        font-size: 12px;
    }
    /deep/ {
        .el-input__inner {
            text-align: center;
        }
    }
}
</style>
