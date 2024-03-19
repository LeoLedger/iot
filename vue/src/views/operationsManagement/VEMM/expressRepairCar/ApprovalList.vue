<!--
* @description 寄修单
* @author 望浩然
* @date 2021/10/9 - 2021/10/10
!-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        :filter-button="checkFeature(['ty.iot.expressRepairCar.approvalList.search'])"
        @search="handleFilter"
    >
        <template slot="button">
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.expressRepairCar.approvalList.export'])"
                size="mini"
                class="filter-button"
                type="warning"
                icon="el-icon-download"
                @click="handleExport"
            >导出</el-button>
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.expressRepairCar.approvalList.create'])"
                size="mini"
                class="filter-button"
                type="success"
                icon="el-icon-plus"
                @click="handleCreate"
            >新建</el-button>
        </template>
        <template slot="filter">
            <el-input
                v-model="searchParam.code"
                placeholder="寄修单号"
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
<!--            <layout-filter-item label="登记人">-->
<!--                <RemoteSelect-->
<!--                    v-model="searchParam.regisUserId"-->
<!--                    :method="userRemoteMethod"-->
<!--                    label-key="userName"-->
<!--                    value-key="userId"-->
<!--                    filter-label-key="userName"-->
<!--                    placeholder="选择登记人"-->
<!--                    clearable-->
<!--                />-->
<!--            </layout-filter-item>-->
<!--            <layout-filter-item label="登记时间">-->
<!--                <el-date-picker-->
<!--                    v-model="searchParam.createTime"-->
<!--                    :default-time="['00:00:00', '23:59:59']"-->
<!--                    type="daterange"-->
<!--                    format="yyyy-MM-dd"-->
<!--                    value-format="yyyy-MM-dd HH:mm:ss"-->
<!--                    range-separator="至"-->
<!--                    start-placeholder="开始"-->
<!--                    end-placeholder="结束"-->
<!--                    clearable-->
<!--                />-->
<!--            </layout-filter-item>-->
        </template>
        <template slot="table">
            <TableComponent
                v-bind="tableData"
                :page-index.sync="searchParam.pageIndex"
                :page-size.sync="searchParam.pageSize"
                @refreshList="handleRefreshList"
            >
                <template v-if="row.status === 0" slot="操作" slot-scope="{row}">
                    <el-dropdown trigger="click" size="small" v-if="includeFeature(['ty.iot.expressRepairCar.approvalList.feedback','ty.iot.expressRepairCar.approvalList.update'])">
                        <el-button
                            size="mini"
                            icon="el-icon-more"
                            title="操作"
                        />
                        <el-dropdown-menu slot="dropdown">
                            <div v-if="checkFeature(['ty.iot.expressRepairCar.approvalList.feedback'])" class="layout-dropdown-item" @click="handleFeedback(row)">
                                <el-dropdown-item icon="el-icon-edit" divided>维修反馈</el-dropdown-item>
                            </div>
<!--                            <div v-if="checkFeature(['ty.iot.expressRepairCar.approvalList.update'])" class="layout-dropdown-item" @click="handleUpdate(row)">-->
<!--                                <el-dropdown-item icon="el-icon-edit" divided>编辑</el-dropdown-item>-->
<!--                            </div>-->
                        </el-dropdown-menu>
                    </el-dropdown>
                </template>
            </TableComponent>
        </template>
        <editDialog
            v-if="editDialog.visible"
            :visible.sync="editDialog.visible"
            :is-edit="editDialog.isEdit"
            :data-id="editDialog.dataId"
            @update="getList"
        />
        <feedbackDialog
            v-if="feedbackDialog.visible"
            :visible.sync="feedbackDialog.visible"
            :is-edit="feedbackDialog.isEdit"
            :data-id="feedbackDialog.dataId"
            @update="getList"
        />
        <div/>
    </layout-filter>
</template>

<script>
    // 方法
    import enums from '@/utils/enum'
    // API
    import approvalApi from '@/api/operationsManagement/expressRepairCar'
    import resourceApi from '@/api/resource'
    import supplierApi from '@/api/purchase/supplier'
    // 组件
    import editDialog from './editDialog'
    import feedbackDialog from './feedbackDialog'
    export default {
        components: {
            editDialog, feedbackDialog
        },
        props: {
        },
        data() {
            return {
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'code',
                            label: '寄修单号',
                            minWidth: 150,
                            isClick: true,
                            dialogType: 'expressRepairCar'
                        },
                        {
                            prop: 'status',
                            label: '单据状态',
                            width: 100,
                            type: 'status',
                            enums: enums.maintenanceBillStatus2
                        },
                        {
                            prop: 'type',
                            label: '寄修类型',
                            width: 100,
                            type: 'dict',
                            dictType: 'sendRevisedType'
                        },
                        {
                            prop: 'objectName',
                            label: '供应商/客户',
                            minWidth: 150
                        },
                        {
                            prop: 'count',
                            label: '维修数量',
                            width: 100,
                            sortable: 'custom',
                            dbProp: 'c_count'
                        },
                        {
                            prop: 'remark',
                            label: '备注'
                        }
                        // {
                        //     prop: 'userName',
                        //     label: '登记人',
                        //     minWidth: 100
                        // },
                        // {
                        //     prop: 'createTime',
                        //     label: '登记时间',
                        //     sortable: 'custom',
                        //     dbProp: 'c_create_time',
                        //     width: 180
                        // }
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
                searchParam: {
                    pageSize: 15,
                    pageIndex: 1
                },
                activeRowData: null,
                userRemoteMethod: resourceApi.getUserList,
                supplierRemoteMethod: supplierApi.getList,
                editDialog: {
                    visible: false,
                    isEdit: false,
                    dataId: null
                },
                feedbackDialog: {
                    dateId: null,
                    visible: false,
                    isEdit: false
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
                if (this.searchParam.pageIndex !== 1) {
                    this.searchParam.pageIndex = 1
                } else {
                    this.getList()
                }
            },
            // 创建
            handleCreate() {
                this.editDialog.visible = true
                this.editDialog.dataId = null
                this.editDialog.isEdit = true
            },
            // 反馈
            handleFeedback(data) {
                this.feedbackDialog.visible = true
                this.feedbackDialog.dataId = data.guidId
                this.feedbackDialog.isEdit = true
            },
            handleUpdate(data) {
                this.activeRowData = data
                this.editDialog.visible = true
                this.editDialog.dataId = data.guidId
                this.editDialog.isEdit = true
            },
            // 点击导出按钮时触发
            handleExport() {
                const data = { ...this.searchParam }
                data.pageSize = this.tableData.total
                approvalApi.export(data)
            },
            // 详细
            handleDetail(data) {
                this.activeRowData = data
                this.editDialog.visible = true
                this.editDialog.dataId = data.guidId
                this.editDialog.isEdit = false
            },
            // 点击排序时触发
            handleRefreshList(obj) {
                this.searchParam = Object.assign({}, this.searchParam, obj)
                this.getList()
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
