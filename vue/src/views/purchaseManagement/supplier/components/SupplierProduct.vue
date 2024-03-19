<!--
* @description 供应商提供产品列表
* @author yc
!-->
<template>
    <div>
        <TableComponent
            v-bind="tableData"
            :list="dataList"
            empty-hide-table
        >
            <template slot="操作" slot-scope="{$index, row}">
                <el-button
                    type="danger"
                    size="mini"
                    icon="el-icon-delete"
                    title="删除"
                    @click="handleDelete($index, row)"
                />
            </template>
        </TableComponent>
    </div>
</template>

<script>
    // API
    // 方法
    import enums from '@/utils/enum'
    import DetailDialog from '@/views/purchaseManagement/product/components/DetailDialog'
    import { getPriceFormat } from '@/utils'
    // 组件

    export default {
        components: {
            DetailDialog
        },
        props: {
            isEdit: { type: Boolean, default: true },
            dataList: { type: Array, default: () => [] },
            dataId: { default: null }
        },
        data() {
            const that = this
            return {
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'code',
                            label: '产品编号',
                            fixed: 'left',
                            width: 100
                        },
                        {
                            prop: 'name',
                            label: '产品名称',
                            isClick: true,
                            minWidth: 150,
                            dialogType: 'product',
                            idKey: 'guidId'
                        },
                        {
                            prop: 'type',
                            label: '产品类型',
                            width: 150,
                            formatter: (params, formData) => {
                                return (that.getDict('productType').find(v => v.value === params[formData.prop]) || {}).label || '- -'
                            }
                        },
                        {
                            prop: 'categoryId',
                            label: '产品种类',
                            width: 140,
                            formatter: (params, formData) => {
                                return (that.getDict('productCategoryId').find(v => v.id === params[formData.prop]) || {}).label || '- -'
                            }
                        },
                        {
                            prop: 'purchaseCost',
                            label: '参考采购单价(元)',
                            width: 150,
                            align: 'right',
                            type: 'money'
                        }
                    ],
                    options: {
                        height: null,
                        maxHeight: null,
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    },
                    // 列操作按钮
                    operates: {
                        width: 60,
                        fixed: 'right',
                        show: this.isEdit
                    }
                }
            }
        },
        computed: {
        },
        watch: {
        },
        mounted() {
        },
        methods: {
            handleDelete(index, row) {
                this.$emit('delete', index, row)
            },
            onClickDetail(row) {
                this.visible = true
                this.rowData = { id: row.id }
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
