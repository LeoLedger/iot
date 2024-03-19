<!--
* @description 设备日志列表
* @fileName deviceLogTable.vue
* @author 望浩然
-->
<template>
    <div class="deviceLog-container">
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
                    v-model="searchParam.billCode"
                    class="filter-item"
                    placeholder="单据编号"
                    size="mini"
                />
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
    import deviceApi from '@/api/inventory/device'

    export default {
        props: {
            // 设备guid
            dataId: {
                type: String,
                default: null
            }
        },
        data() {
            return {
                groupData: null,
                currentRow: null,
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'operatorTime',
                            label: '操作时间',
                            width: 150,
                            type: 'date',
                            format: 'YYYY-MM-DD HH:mm:ss'
                        },
                        {
                            prop: 'operatorType',
                            label: '操作类型',
                            width: 80,
                            dictType: 'operatorType',
                            type: 'dict'
                        },
                        {
                            prop: 'billCode',
                            label: '关联单据',
                            width: 140,
                            isClick: true
                        },
                        {
                            prop: 'relImei',
                            label: '绑定设备',
                            width: 140,
                            isClick: true,
                            dialogType: 'device',
                            idKey: 'relImei'
                        },
                        {
                            prop: '_status',
                            label: '库存状态',
                            minWidth: 200,
                            render: (h, params = {}) => {
                                const { row, column } = params
                                if (row.warehousesSpaceName === '已出库') {
                                    return (
                                    <span>
                                      { row.warehousesName + ' | ' + row.warehousesSpaceName }
                                      <span class='link-text'>{ '(' + row.sectionName + ')' }</span>
                                    </span>
                                  )
                                } else return <span>{ row.warehousesName + ' | ' + row.warehousesSpaceName }</span>
                            }
                        },
                        {
                            prop: 'operatorUserName',
                            label: '操作人',
                            width: 100
                        }
                    ],
                    options: {
                        height: '400px',
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        showPagination: false
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
            dataId() {
                this.init()
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
            // 获取设备日志列表数据
            async getList() {
                if (this.dataId) {
                    this.tableData.options.loading = true
                    // 设置设备ID筛选
                    this.tableData.options.loading = true
                    const params = Object.assign({}, this.searchParam)
                    params.deviceGuid = this.dataId
                    const res = await deviceApi.getLogList(params)
                    if (res.success) {
                        this.tableData.list = res.data
                        this.tableData.total = res.data.length
                    }
                    setTimeout(() => {
                        this.tableData.options.loading = false
                    }, 500)
                }
            },
            /** 事件处理 */
            // 搜索
            handleSearch(obj) {
                if (typeof obj === 'object') {
                    this.searchParam = Object.assign({}, this.searchParam, obj)
                    this.getList()
                } else {
                    if (this.searchParam.pageIndex !== 1) {
                        this.searchParam.pageIndex = 1
                    } else {
                        this.getList()
                    }
                }
            },
            // 导出
            handleExport() {
                var data = { ...this.searchParam }
                data.pageSize = this.tableData.total
                deviceApi.exportLog(this.searchParam)
            }
        }
    }
</script>

<style lang='scss'>
.deviceLog-container {
  height: 100%;
  .layout-container {
    padding: 0;
    background: white;
  }
}
</style>
