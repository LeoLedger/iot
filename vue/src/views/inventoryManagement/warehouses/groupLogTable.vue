<!--
* @description 仓库动态列表
* @fileName groupLogTable.vue
* @author 望浩然
-->
<template>
    <div class="groupLog-container">
        <layout-filter
            :table-columns.sync="tableData.columns"
            :filter-model.sync="searchParam"
            @search="handleSearch"
        >
            <template slot="button">
                <el-button
                    v-waves
                    v-prereclick
                    type="warning"
                    size="mini"
                    class="filter-item"
                    icon="el-icon-download"
                    @click="handleExport"
                >导出</el-button>
            </template>

            <template slot="filter">
                <el-input
                    v-model="searchParam.operatorUserName"
                    class="filter-item"
                    placeholder="操作人"
                    size="mini"
                />
            </template>
            <template slot="table">
                <TableComponent
                    v-bind="tableData"
                    :cur_row="currentRow"
                    :page-index.sync="searchParam.pageIndex"
                    :page-size.sync="searchParam.pageSize"
                    @refreshList="handleSearch"
                />
            </template>
        </layout-filter>
    </div>
</template>

<script>
    import warehousesApi from '@/api/inventory/warehouses'
    export default {
        props: {
            // 仓库guid
            guidId: {
                type: String,
                default: null
            },
            productCategory: String
        },
        data() {
            return {
                currentRow: null,
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'operatorUserName',
                            label: '操作人'
                        },
                        {
                            prop: 'operatorTime',
                            label: '操作时间',
                            minWidth: 120,
                            type: 'date'
                        },
                        {
                            prop: 'operatorType',
                            label: '操作类型',
                            type: 'dict',
                            dictType: 'operatorType',
                            width: 100
                        },
                        {
                            prop: 'billCode',
                            label: '关联单据',
                            width: 180
                        },
                        {
                            prop: 'operatorCount',
                            label: '库存变化',
                            width: 100
                        },
                        {
                            prop: 'inventoriesCount',
                            label: '库存数量',
                            width: 100
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    },

                    // 列操作按钮
                    operates: {
                        width: 120,
                        fixed: 'right'
                    }
                },
                searchParam: {
                    pageIndex: 1,
                    pageSize: 15
                }
            }
        },
        watch: {
            guidId: {
                handler(val) {
                    if (val) {
                        this.searchParam.warehousesId = val
                        this.getList()
                    }
                },
                immediate: true
            },
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
            // 获取客户联系人列表数据
            async getList() {
                if (this.guidId) {
                    this.tableData.options.loading = true
                    // 设置仓库ID筛选
                    this.searchParam.warehousesId = this.guidId
                    const res = await warehousesApi.getActLogList({
                        ...this.searchParam,
                        productCategory: this.productCategory
                    })
                    if (res.success) {
                        res.data.records.map(item => {
                            if (item.operatorCount > 0) {
                                item.operatorCount = '+' + item.operatorCount
                            }
                        })
                        this.tableData.list = res.data.records
                        this.tableData.total = res.data.total
                    }
                    this.tableData.options.loading = false
                }
            },
            /** 事件处理 */
            // 搜索
            handleSearch() {
                this.searchParam.pageIndex = 1
                this.searchParam = Object.assign({}, this.searchParam)
                this.getList()
            },
            // 导出
            handleExport() {
                var data = { ...this.searchParam }
                data.pageSize = this.tableData.total
                warehousesApi.exportLog(this.searchParam)
            }
        }
    }
</script>

<style lang='scss'>
.groupLog-container {
  height: 100%;
  .layout-container {
    padding: 0;
    background: white;
  }
}
</style>
