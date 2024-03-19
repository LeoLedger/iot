<!--
* @description 选择EO项目
* @author yc
!-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="publicParam"
        @search="handleFilter"
    >
        <template slot="filter">
            <el-input
                v-model="publicParam.projectName"
                :disabled="lockedProps.includes('projectName')"
                size="mini"
                placeholder="项目名称"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="publicParam.projectCode"
                :disabled="lockedProps.includes('projectCode')"
                size="mini"
                placeholder="项目编号"
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
    </layout-filter>
</template>

<script>
    import mixin from './mixin'
    // API
    import resourceApi from '@/api/resource'

    export default {
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
                            prop: 'productCode',
                            label: '产品编号',
                            width: 200
                        },
                        {
                            prop: 'productName',
                            label: '项目名称'
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
                }
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
                        res = await resourceApi.getUserList(this.publicParam)
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
