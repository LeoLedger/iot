<!--
* @description 选择人员
* @author yc
!-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        @search="handleFilter"
    >
        <template slot="filter">
            <el-input
                v-model="searchParam.roleName"
                size="mini"
                placeholder="角色名称"
                clearable
                class="filter-item"
                @keyup.enter.native="handleFilter"
            />
        </template>
        <template slot="table">
            <TableComponent
                ref="TableComponent"
                v-bind="tableData"
                :options="tableOptions"
                :selected-list="selectList"
                :page-index.sync="searchParam.pageIndex"
                :page-size.sync="searchParam.pageSize"
                height="60vh"
                @handleCurrentChange="handleCurrentChange"
                @handleSelectionChange="handleSelectionChange"
            />
        </template>
    </layout-filter>
</template>

<script>
    import mixin from './mixin'
    // 方法
    import { roleStatusEnum, roleTypeEnum } from '@/utils/enum'
    // API
    import { getRolesList } from '@/api/role'

    export default {
        name: 'People',
        components: {
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
                            prop: 'roleName',
                            label: '名称',
                            width: 110
                        },
                        {
                            prop: 'roleCode',
                            label: '编号',
                            width: 200
                        }, {
                            prop: 'deptName',
                            label: '所属部门',
                            width: 100
                        },
                        {
                            prop: 'mapName',
                            label: '所属区域',
                            width: 100
                        },
                        {
                            prop: 'roleType',
                            label: '类型',
                            width: 100,
                            formatter: function(row, column) {
                                return (roleTypeEnum.find(item => item.value === row.roleStatus) || {}).label || '- -'
                            }
                        },
                        {
                            prop: 'roleStatus',
                            label: '状态',
                            width: 100,
                            formatter: function(row, column) {
                                return (roleStatusEnum.find(item => item.value === row.roleStatus) || {}).label || '- -'
                            }
                        },
                        {
                            prop: 'remark',
                            label: '备注',
                            minWidth: 200
                        }
                    ],
                    // 列操作按钮
                    operates: {
                        width: 100,
                        fixed: 'right'
                    }
                },
                searchParam: {
                    roleName: '',
                    pageSize: 15,
                    pageIndex: 1
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
        methods: {
            // 请求列表数据
            async getList() {
                this.tableOptions.loading = true
                try {
                    var res = await getRolesList(this.searchParam)
                    if (res.data.success) {
                        this.tableData.list = res.data.data.records
                        this.tableData.total = res.data.data.total
                        this.updateSelect()
                    }
                } catch (err) {}
                this.tableOptions.loading = false
            }
        }
    }
</script>

<style lang='scss' scoped>

</style>
