<!--
* @description 选择公司
* @author yc
!-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="publicParam"
        :locked-props="lockedProps"
        @search="handleFilter"
    >
        <template v-if="!onlyShow" slot="filter">
            <DictSelect
                :disabled="lockedProps.includes('type')"
                v-model="publicParam.type"
                type="companyType"
                placeholder="公司类型"
                filterable
                size="mini"
                width="200px"
                @change="handleFilter"
            />
            <el-input
                :disabled="lockedProps.includes('name')"
                v-model="publicParam.name"
                :placeholder="['客户名称','供应商名称'][publicParam.type]"
                size="mini"
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
    import customerApi from '@/api/PM/customer'
    import supplierApi from '@/api/purchase/supplier'

    export default {
        name: 'Company',
        components: {},
        mixins: [mixin],
        data() {
            var that = this
            return {
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'name',
                            label: '名称',
                            minWidth: 160
                        },
                        {
                            prop: 'customerType',
                            label: '客户类型',
                            width: 120,
                            formatter: (params, formData) => {
                                return (that.getDict('customerType').find(v => v.value === params[formData.prop]) || {}).label || '- -'
                            }
                        },
                        {
                            prop: 'customerGrade',
                            label: '客户级别',
                            width: 120,
                            formatter: (params, formData) => {
                                return (that.getDict('customerGrade').find(v => v.value === params[formData.prop]) || {}).label || '- -'
                            }
                        },
                        {
                            prop: 'peopleName',
                            label: '联系人',
                            width: 100
                        },
                        {
                            prop: 'phone',
                            label: '联系电话',
                            width: 120
                        },
                        {
                            prop: 'regionName',
                            label: '所属地区',
                            width: 160
                        },
                        {
                            prop: 'address',
                            label: '地址',
                            minWidth: 160
                        }
                    ],
                    // 列操作按钮
                    operates: {
                        width: 100,
                        fixed: 'right'
                    }
                },
                defaultParam: {
                    type: 0,
                    name: '',
                    pageSize: 15,
                    pageIndex: 1
                }
            }
        },
        computed: {
        },
        watch: {
            'publicParam.type': {
                immediate: true,
                handler(type) {
                    switch (type) {
                    case 0:
                        this.$set(this.tableData.columns.find(v => v.prop === 'customerType'), 'visible', true)
                        this.$set(this.tableData.columns.find(v => v.prop === 'customerGrade'), 'visible', true)
                        break
                    case 1:
                        this.$set(this.tableData.columns.find(v => v.prop === 'customerType'), 'visible', false)
                        this.$set(this.tableData.columns.find(v => v.prop === 'customerGrade'), 'visible', false)
                        break
                    }
                }
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
                        switch (this.publicParam.type) {
                        case 0:
                            res = await customerApi.getList(this.publicParam)
                            break
                        case 1:
                            res = await supplierApi.getList(this.publicParam)
                            break
                        }
                    }
                    this.tableData.list = res.data.records.map(item => {
                        item._companyType = this.publicParam.type
                        return item
                    })
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
