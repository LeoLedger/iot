<!--
* @description 出库记录
* @author yc
!-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        :show-toolbar="!!tableData.list.length"
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
        <div>
            <SelectDialog
                v-if="selectDialog.visible"
                v-bind="selectDialog"
                :visible.sync="selectDialog.visible"
            />
        </div>
    </layout-filter>
</template>

<script>
    // API
    import storageOutApi1 from '@/api/statistical/storageOut'
    import storageOutApi2 from '@/api/businessDocuments/storageOut'
    // 方法
    // 组件
    import SelectDialog from '@/components/SelectDialog/index.vue'

    export default {
        name: 'StorageOutRecord',
        components: {
            SelectDialog
        },
        props: {
            dataId: { type: [Number, String] }
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
                            label: '出库单号',
                            minWidth: 130
                        },
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            width: 130
                        },
                        {
                            prop: 'productName',
                            label: '产品名称',
                            minWidth: 155
                        },
                        {
                            prop: 'count',
                            label: '出库数量',
                            width: 100,
                            isCopy: false,
                            isClick: true,
                            onClick: (data) => {
                                this.selectDialog = {
                                    type: 'device',
                                    title: '出库设备',
                                    visible: true,
                                    onlyShow: true,
                                    customRequest: storageOutApi2.getConfigDeviceList,
                                    extendParams: {
                                        outId: data.approvalId,
                                        productId: data.productId,
                                        category: data.productCategory
                                    }
                                }
                            }
                        },
                        {
                            prop: 'userName',
                            label: '申请人',
                            width: 100
                        },
                        {
                            type: 'date',
                            prop: 'createTime',
                            label: '出库时间',
                            width: 100
                        },
                        {
                            type: 'date',
                            prop: 'approvalYesTime',
                            label: '审批通过时间',
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
                    contractId: '',
                    approvalCode: '',
                    pageSize: 15,
                    pageIndex: 1
                },
                selectDialog: {
                    visible: false
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
        },
        methods: {
            // 请求列表
            async getList() {
                if (this.dataId) {
                    this.tableData.options.loading = true
                    try {
                        var res = await storageOutApi1.getList({
                            ...this.searchParam,
                            contractId: this.dataId
                        })
                        this.tableData.list = res.data.records
                        this.tableData.total = res.data.total
                    } catch (e) {}
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
                    contractId: this.dataId
                }
                data.pageSize = this.tableData.total
                storageOutApi1.export(data)
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
