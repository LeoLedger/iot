<!--
* @description 选择产品
* @author yc
!-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="publicParam"
        @search="handleFilter"
    >
        <template slot="filter">
            <DictSelect
                v-model="publicParam.type"
                :disabled="!!extendParams.type"
                :exclude="extendParams._typeExclude"
                type="productType"
                placeholder="产品类型"
                clearable
                filterable
                class="filter-item"
                size="mini"
                width="200px"
                @change="handleFilter"
            />
            <el-input
                v-model="publicParam.code"
                :disabled="!!extendParams.code"
                placeholder="产品编号"
                size="mini"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
        </template>
        <template slot="filter-popup">
            <layout-filter-item label="产品名称">
                <el-input
                    v-model="publicParam.name"
                    :disabled="!!extendParams.name"
                    placeholder="产品名称"
                    size="mini"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="供应商">
                <RemoteSelect
                    v-model="publicParam.supplierId"
                    :method="supplierRemoteMethod"
                    :disabled="!!extendParams.supplierId"
                    label-key="name"
                    value-key="guidId"
                    filter-label-key="name"
                    filter-value-key="customerId"
                    placeholder="选择供应商"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="产品种类">
                <DictSelect
                    v-model="publicParam.categoryId"
                    :disabled="!!extendParams.categoryId"
                    type="productCategory"
                    placeholder="产品种类"
                    clearable
                    filterable
                    size="mini"
                />
            </layout-filter-item>
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
    import productApi from '@/api/purchase/product'
    import supplierApi from '@/api/purchase/supplier'
    // 组件

    export default {
        name: 'Product',
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
                            label: '产品编号',
                            disabled: true
                        },
                        {
                            prop: 'name',
                            label: '产品名称',
                            disabled: true
                        },
                        {
                            type: 'dict',
                            dictType: 'productType',
                            prop: 'type',
                            label: '产品类型',
                            width: 190
                        },
                        {
                            type: 'dict',
                            dictType: 'productCategory',
                            prop: 'categoryId',
                            label: '产品种类',
                            width: 140
                        },
                        {
                            prop: 'supplierName',
                            label: '供应商'
                        },
                        {
                            prop: 'remark',
                            label: '备注'
                        }
                    ],
                    // 列操作按钮
                    operates: {
                        width: 100,
                        fixed: 'right'
                    }
                },
                defaultParam: {
                    type: '',
                    code: '',
                    pageSize: 15,
                    pageIndex: 1
                },
                supplierRemoteMethod: supplierApi.getList
            }
        },
        mounted() {
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
                        res = await productApi.getList(this.publicParam)
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
