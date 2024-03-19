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
                v-model="searchParam.userName"
                size="mini"
                placeholder="用户名"
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
    // API
    import { getUserList } from '@/api/user/index'

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
                            prop: 'userName',
                            label: '姓名',
                            width: 100
                        },
                        {
                            prop: 'loginName',
                            label: '登录名'
                        },
                        {
                            prop: 'mapName',
                            label: '区域'
                        },
                        {
                            prop: 'deptName',
                            label: '部门'
                        },
                        {
                            prop: 'remark',
                            label: '描述'
                        }
                    ],
                    // 列操作按钮
                    operates: {
                        width: 100,
                        fixed: 'right'
                    }
                },
                searchParam: {
                    userName: '',
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
                    var res = await getUserList(this.searchParam)
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
