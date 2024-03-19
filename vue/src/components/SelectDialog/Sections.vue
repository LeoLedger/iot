<!--
* @description 选择人员
* @author yc
!-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="publicParam"
        @search="handleFilter"
    >
        <template slot="filter">
            <RemoteSelect
                v-model="publicParam.projectId"
                :method="projectRemoteMethod"
                :disabled="lockedProps.includes('projectId')"
                label-key="projectName"
                value-key="guidId"
                filter-label-key="projectName"
                placeholder="所属项目"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <RemoteSelect
                v-model="publicParam.customerId"
                :method="customerRemoteMethod"
                :disabled="lockedProps.includes('customerId')"
                label-key="name"
                value-key="guidId"
                filter-label-key="name"
                placeholder="所属企业"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="publicParam.sectionName"
                :disabled="lockedProps.includes('sectionName')"
                size="mini"
                placeholder="标段名称"
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
    // API
    import sectionApi from '@/api/PM/section'
    import projectApi from '@/api/PM/project'
    import customerApi from '@/api/PM/customer'

    export default {
        name: 'Sections',
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
                            prop: 'code',
                            label: '标段编号'
                        },
                        {
                            prop: 'name',
                            label: '标段名称'
                        },
                        {
                            prop: 'customerName',
                            label: '服务企业'
                        },
                        {
                            prop: 'projectName',
                            label: '所属项目'
                        },
                        {
                            prop: 'managementUnit',
                            label: '主管单位'
                        },
                        {
                            prop: 'projectManagerUserName',
                            label: '项目经理'
                        }
                    ],
                    // 列操作按钮
                    operates: {
                        width: 100,
                        fixed: 'right'
                    }
                },
                defaultParam: {
                    projectId: '',
                    customerId: '',
                    sectionName: '',
                    pageSize: 15,
                    pageIndex: 1
                },
                projectRemoteMethod: projectApi.getList,
                customerRemoteMethod: customerApi.getList
            }
        },
        computed: {
            lockedProps() {
                if (this.extendParams) {
                    return this.extendParams.lockedProps || []
                }
                return []
            }
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
                        res = await sectionApi.getList(this.publicParam)
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
