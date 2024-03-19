<!--
* @description 采购清单
* @author yc
!-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        :filter-button="checkFeature(['ty.iot.purchaseContract.search'])"
        @search="handleFilter"
    >
        <template slot="button">
            <el-button
                v-waves
                v-if="checkFeature(['ty.iot.purchaseContract.export'])"
                size="mini"
                class="filter-button"
                type="warning"
                icon="el-icon-download"
                @click="handleExport"
            >导出</el-button>
        </template>
        <template slot="filter">
            <RemoteSelect
                v-model="searchParam.supplierId"
                :method="supplierRemoteMethod"
                width="200px"
                label-key="name"
                value-key="guidId"
                filter-label-key="name"
                filter-value-key="customerId"
                placeholder="选择供应商"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.code"
                size="mini"
                placeholder="合同编号"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.prodCode"
                placeholder="产品编号"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
        </template>
        <template slot="filter-popup">
            <layout-filter-item label="合同签订日期">
                <el-date-picker
                    v-model="searchParam.signedDate"
                    :default-time="['00:00:00', '23:59:59']"
                    type="daterange"
                    format="yyyy-MM-dd"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="预计到货日期">
                <el-date-picker
                    v-model="searchParam.deliveryDate"
                    :default-time="['00:00:00', '23:59:59']"
                    type="daterange"
                    format="yyyy-MM-dd"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    clearable
                />
            </layout-filter-item>
        </template>
        <template slot="table">
            <TableComponent
                v-bind="tableData"
                :page-index.sync="searchParam.pageIndex"
                :page-size.sync="searchParam.pageSize"
                @refreshList="handleRefreshList"
            />
        </template>
    </layout-filter>
</template>

<script>
    // API
    import supplierApi from '@/api/purchase/supplier'
    import purchasingApi from '@/api/purchase/purchasing'
    // 方法
    // 组件

    export default {
        components: {
        },
        props: {
        },
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
                            minWidth: 120,
                            disabled: true
                        },
                        {
                            prop: 'productName',
                            label: '产品名称',
                            minWidth: 150,
                            disabled: true
                        },
                        {
                            type: 'dict',
                            dictType: 'productType',
                            prop: 'productType',
                            label: '产品类型',
                            minWidth: 120
                        },
                        {
                            prop: 'contractCode',
                            label: '采购合同',
                            idKey: 'contractId',
                            isClick: true,
                            minWidth: 130,
                            dialogType: 'purchaseContract'
                        },
                        {
                            prop: 'supplierName',
                            label: '供应商',
                            minWidth: 200
                        },
                        {
                            type: 'date',
                            prop: 'signedDate',
                            label: '合同签订日期',
                            width: 100
                        },
                        {
                            type: 'date',
                            prop: 'deliveryTime',
                            label: '预计到货日期',
                            width: 100
                        },
                        {
                            prop: 'count',
                            width: 120,
                            label: '采购数量',
                            dbProp: 'c_count',
                            sortable: 'custom'
                        },
                        {
                            type: 'money',
                            prop: 'unitPrice',
                            width: 130,
                            label: '采购单价（元）',
                            dbProp: 'c_unit_price',
                            sortable: 'custom'
                        },
                        {
                            type: 'money',
                            prop: 'totalAmount',
                            width: 120,
                            label: '总金额（元）',
                            dbProp: 'c_total_amount',
                            sortable: 'custom'
                        },
                        {
                            prop: 'countInbound',
                            width: 120,
                            label: '已入库数量',
                            dbProp: 'c_count_inbound',
                            sortable: 'custom'
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    }
                },
                searchParam: {
                    code: '',
                    prodCode: '',
                    supplierId: '',
                    signedDate: [],
                    deliveryDate: [],
                    pageSize: 15,
                    pageIndex: 1
                },
                activeRowData: null,
                supplierRemoteMethod: supplierApi.getList
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
        mounted() {
            this.handleFilter()
        },
        methods: {
            // 请求列表数据
            async getList() {
                this.tableData.options.loading = true
                var res = await purchasingApi.getList({
                    ...this.searchParam
                })
                if (res.success) {
                    this.tableData.list = res.data.records.map(item => {
                        return item
                    })
                    this.tableData.total = res.data.total
                }
                this.tableData.options.loading = false
            },
            // 筛选列表
            handleFilter() {
                if (this.searchParam.pageIndex !== 1) {
                    this.searchParam.pageIndex = 1
                } else {
                    this.getList()
                }
            },
            // 点击删除按钮时触发
            async handleDelete(data) {
                await this.$confirm('此操作将删除此合同信息, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                })
                this.tableData.options.loading = true
                try {
                    var res = await purchasingApi.delete(data.id)
                    if (res.success) {
                        await this.getList()
                        this.$notify({
                            title: '成功',
                            message: '删除成功',
                            type: 'success',
                            duration: 2000
                        })
                    }
                } catch (e) {}
                this.tableData.options.loading = false
            },
            // 点击导出按钮时触发
            handleExport() {
                var data = { ...this.searchParam }
                data.pageSize = this.tableData.total
                purchasingApi.export(data)
            },
            // 点击排序时触发
            handleRefreshList(obj) {
                this.searchParam = Object.assign({}, this.searchParam, obj)
                this.getList()
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
