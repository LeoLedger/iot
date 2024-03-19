<!--
* @description 出库记录
* @author yc
!-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        @search="handleFilter"
    >
        <template slot="button">
            <el-button
                v-waves
                :disabled="!tableData.total"
                size="mini"
                class="filter-button"
                type="warning"
                icon="el-icon-download"
                @click="handleExport"
            >导出</el-button>
        </template>
        <template slot="filter">
            <el-input
                v-model="searchParam.approvalCode"
                size="mini"
                placeholder="单号"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
        </template>
        <template slot="table">
            <TableComponent
                v-bind="tableData"
                :page-index.sync="searchParam.pageIndex"
                :page-size.sync="searchParam.pageSize"
                empty-hide-table
            />
        </template>
    </layout-filter>
</template>

<script>
    // API
    import storagePutApi from '@/api/statistical/storagePut'
    // 方法
    // 组件

    export default {
        name: 'StoragePutRecord',
        components: {
        },
        props: {
            dataId: null
        },
        data() {
            return {
                loading: false,
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'approvalCode',
                            label: '入库单号',
                            minWidth: 155,
                            idKey: 'approvalId',
                            isClick: true,
                            dialogType: 'storagePutApproval',
                            disabled: true,
                            extendParams: {
                                onlyShow: true
                            }
                        },
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            width: 130
                        },
                        {
                            type: 'dict',
                            dictType: 'productType',
                            prop: 'productType',
                            label: '产品类型',
                            minWidth: 155
                        },
                        {
                            prop: 'count',
                            label: '入库数量',
                            width: 100,
                            dbProp: 'c_count',
                            sortable: 'custom'
                        },
                        {
                            type: 'date',
                            prop: 'createTime',
                            label: '入库时间',
                            width: 100,
                            dbProp: 'c_create_time',
                            sortable: 'custom'
                        },
                        {
                            prop: 'userName',
                            label: '提交人',
                            width: 100
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: null,
                        maxHeight: null,
                        onePageHidePagination: true
                    }
                },
                searchParam: {
                    pageSize: 15,
                    pageIndex: 1
                }
            }
        },
        computed: {
        },
        watch: {
            dataId: {
                immediate: true,
                handler() {
                    this.getList()
                }
            },
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
            // 请求列表
            async getList() {
                if (this.dataId) {
                    this.tableData.options.loading = true
                    try {
                        var res = await storagePutApi.getList({
                            ...this.searchParam,
                            purchaseContractId: this.dataId
                        })
                        this.tableData.list = res.data.records
                        this.tableData.total = res.data.total
                    } catch (e) {
                        console.log(e)
                    }
                    this.tableData.options.loading = false
                }
            },
            // 筛选列表
            handleFilter() {
                if (this.searchParam.pageIndex !== 1) {
                    this.searchParam.pageIndex = 1
                } else {
                    this.getList()
                }
            },
            // 点击导出按钮时触发
            handleExport() {
                var data = {
                    ...this.searchParam,
                    purchaseContractId: this.dataId
                }
                data.pageSize = this.tableData.total
                storagePutApi.export(data)
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
