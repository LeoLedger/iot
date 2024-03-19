<!--
* @description 供应商提供产品列表
* @author yc
!-->
<template>
    <div>
        <TableComponent
            v-bind="tableData"
            :list="dataList"
        >
            <template v-if="isEdit" slot="操作" slot-scope="{$index, row}">
                <el-button
                    type="danger"
                    size="mini"
                    icon="el-icon-warning"
                    title="删除"
                    @click="handleDelete($index, row)"
                />
            </template>
        </TableComponent>
    <!--  产品详情窗口  -->
    <!--  为供应商添加产品窗口  -->
    </div>
</template>

<script>
    // API
    // 方法
    // 组件

    export default {
        components: {
        },
        props: {
            isEdit: { type: Boolean, default: true },
            height: { type: String, default: '100%' },
            dataList: { type: Array, default: () => [] }
        },
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
                            fixed: 'left',
                            disabled: true
                        },
                        {
                            prop: 'xxx',
                            label: '产品名称',
                            disabled: true,
                            render: (h, params = {}) => {
                                const { row, column } = params
                                return <span class='link-text' onClick={() => this.onClickDetail(row)}>{row.name || '--'}</span>
                            }
                        },
                        {
                            prop: 'xxx',
                            label: '产品类型',
                            width: 150
                        },
                        {
                            prop: 'xxx',
                            label: '参考采购单价(元)',
                            width: 150
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    },
                    // 列操作按钮
                    operates: {
                        width: 100,
                        fixed: 'right'
                    }
                }
            }
        },
        computed: {
        },
        watch: {
            xxx: {
                immediate: true,
                handler(value) {

                }
            }
        },
        mounted() {
        },
        methods: {
            handleDelete(index, row) {},
            onClickDetail(row) {
                this.detailDialog.rowData = row
                this.detailDialog.visible = true
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
