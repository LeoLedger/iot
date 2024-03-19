<!--
* @description 选择联系人
* @author yc
!-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="publicParam"
        @search="handleFilter"
    >
        <template slot="button">
            <el-button
                v-waves
                size="mini"
                class="filter-button"
                type="success"
                icon="el-icon-plus"
                @click="handleAdd"
            >新增</el-button>
        </template>
        <template slot="filter">
            <!-- 客户 -->
            <RemoteSelect
                v-if="publicParam.type === 0"
                v-model="publicParam.customerId"
                :method="customerRemoteMethod"
                :disabled="!!extendParams.customerId"
                width="200px"
                label-key="name"
                value-key="guidId"
                filter-label-key="name"
                filter-value-key="guidId"
                placeholder="所属公司"
                class="filter-item"
                @change="handleFilter"
            />
            <!-- 供应商 -->
            <RemoteSelect
                v-else-if="publicParam.type === 1"
                v-model="publicParam.customerId"
                :method="supplierRemoteMethod"
                :disabled="!!extendParams.customerId"
                width="200px"
                label-key="name"
                value-key="guidId"
                filter-label-key="name"
                filter-value-key="customerId"
                placeholder="所属公司"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="publicParam.name"
                size="mini"
                placeholder="人员名称"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
        </template>
        <template slot="table">
            <TableComponent
                ref="TableComponent"
                v-bind="tableData"
                :options="tableOptions"
                :selected-list="selectList"
                :page-index.sync="publicParam.pageIndex"
                :page-size.sync="publicParam.pageSize"
                @refreshList="handleRefreshList"
                @handleCurrentChange="handleCurrentChange"
                @handleSelectionChange="handleSelectionChange"
                @not-selected-click="handleNotSelectedClick"
            />
        </template>
        <div>
            <!-- 新增联系人 -->
            <UpdateDialog
                v-if="updateDialogVisible"
                :visible.sync="updateDialogVisible"
                :extend-params="extendParams"
                is-edit
                @update="getList"
            />
        </div>
    </layout-filter>
</template>

<script>
    import mixin from './mixin'
    // 方法
    // API
    import contactsApi from '@/api/PM/contacts'
    import customerApi from '@/api/PM/customer'
    import supplierApi from '@/api/purchase/supplier'
    // 组件
    import UpdateDialog from '@/views/PM/contacts/components/UpdateDialog'

    export default {
        name: 'Contacts',
        components: {
            UpdateDialog
        },
        mixins: [mixin],
        data() {
            return {
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'name',
                            label: '姓名'
                        },
                        {
                            prop: 'customerName',
                            label: '所属公司'
                        },
                        {
                            prop: 'deptName',
                            label: '所属部门'
                        },
                        {
                            prop: 'position',
                            label: '职务'
                        },
                        {
                            prop: 'phone',
                            label: '联系电话'
                        },
                        {
                            prop: 'email',
                            label: '邮箱'
                        }
                    ],
                    // 列操作按钮
                    operates: {
                        width: 100,
                        fixed: 'right'
                    }
                },
                defaultParam: {
                    pageSize: 15,
                    pageIndex: 1
                },
                updateDialogVisible: false,
                customerRemoteMethod: customerApi.getList,
                supplierRemoteMethod: supplierApi.getList
            }
        },
        computed: {
        },
        mounted() {
        },
        methods: {
            // 请求列表数据
            async getList() {
                this.loading = true
                try {
                    var res
                    if (this.customRequest) {
                        res = await this.customRequest(this.publicParam)
                    } else {
                        res = await contactsApi.getList(this.publicParam)
                    }
                    this.tableData.list = res.data.records
                    this.tableData.total = res.data.total
                    this.updateSelect()
                } catch (err) {}
                this.loading = false
            },
            handleAdd() {
                this.updateDialogVisible = true
            }
        }
    }
</script>

<style lang='scss' scoped>

</style>
