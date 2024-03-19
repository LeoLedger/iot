<!--
* @description 来料批次检测
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
                @click="updateDialogVisible = true"
            >新增</el-button>
        </template>
        <template slot="filter">
            <el-input
                v-model="publicParam.code"
                :disabled="lockedProps.includes('code')"
                size="mini"
                placeholder="批次"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <DictSelect
                v-model="publicParam.productTestType"
                :disabled="lockedProps.includes('productTestType')"
                type="checkType"
                placeholder="检测类型"
                clearable
                filterable
                size="mini"
                style="width: 180px"
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
            <!-- 新增表单 -->
            <UpdateDialog
                v-if="updateDialogVisible"
                :visible.sync="updateDialogVisible"
                :locked-props="lockedProps"
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
    import enums from '@/utils/enum'
    // API
    import materialTestingApi from '@/api/operationsManagement/materialTesting'
    // 组件
    import UpdateDialog from '@/views/operationsManagement/materialTesting/components/UpdateDialog'

    export default {
        name: 'MaterialTesting',
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
                            prop: 'code',
                            label: '批次',
                            minWidth: 120,
                            disabled: true
                        },
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            minWidth: 130,
                            disabled: true
                        },
                        {
                            type: 'dict',
                            dictType: 'productType',
                            prop: 'productType',
                            minWidth: 155,
                            label: '产品类型'
                        },
                        {
                            prop: 'supplierName',
                            label: '供应商',
                            minWidth: 160
                        },
                        {
                            prop: 'count',
                            label: '抽检数量',
                            width: 100
                        },
                        {
                            prop: 'countInvalid',
                            label: '不良品数',
                            width: 100,
                            dbProp: 'c_count_invalid',
                            sortable: 'custom'
                        },
                        {
                            type: 'date',
                            prop: 'createTime',
                            label: '抽检日期',
                            width: 100,
                            dbProp: 'c_check_date',
                            sortable: 'custom'
                        },
                        {
                            prop: 'userName',
                            label: '操作人',
                            width: 100
                        },
                        {
                            prop: 'checkResult',
                            type: 'status',
                            style: 'block',
                            enums: enums.spotCheckResult,
                            label: '抽检结果',
                            dbProp: 'c_check_result',
                            sortable: 'custom',
                            width: 100
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
                updateDialogVisible: false
            }
        },
        computed: {
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
                        res = await materialTestingApi.getList(this.publicParam)
                    }
                    this.tableData.list = res.data.records
                    this.tableData.total = res.data.total
                    this.updateSelect()
                } catch (err) {}
                this.loading = false
            }
        }
    }
</script>

<style lang='scss' scoped>

</style>
