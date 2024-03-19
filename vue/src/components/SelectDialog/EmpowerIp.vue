<!--
* @description 选择授权IP
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
                v-model="publicParam.label"
                :disabled="lockedProps.includes('label')"
                size="mini"
                placeholder="授权IP"
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
    // 方法
    import { isEmpty } from '@/utils'
    // API

    export default {
        name: 'EmpowerIp',
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
                            prop: 'label',
                            label: '授权IP',
                            disabled: true
                        },
                        {
                            prop: 'xxx',
                            label: '设备型号'
                        },
                        {
                            prop: 'c_remark',
                            label: '备注'
                        }
                    ]
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
                var { pageSize, pageIndex, label } = this.publicParam
                var list = this.getDict('empowerIp').filter(item => {
                    return (
                        (isEmpty(label) || item.label.indexOf(label) > -1)
                    )
                })
                this.tableData.total = list.length
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
                this.updateSelect()
            }
        }
    }
</script>

<style lang='scss' scoped>

</style>
