<!--
* @description 服务企业标段成员列表
* @author yc
!-->
<template>
    <div>
        <TableComponent
            v-bind="tableData"
            :list="enableDataList"
            empty-hide-table
            height="auto"
        >
            <template slot="操作" slot-scope="{$index, row}">
                <div style="text-align: center">
                    <el-tag v-if="row.dbStatus" size="mini" type="danger">已移除</el-tag>
                    <el-button
                        v-else
                        type="danger"
                        size="mini"
                        icon="el-icon-delete"
                        title="移除"
                        @click="handleDelete($index, row)"
                    />
                </div>
            </template>
        </TableComponent>
    </div>
</template>

<script>
    // API
    // 方法
    import enums from '@/utils/enum'
    // 组件

    export default {
        components: {
        },
        props: {
            isEdit: { type: Boolean, default: true },
            dataList: { type: Array, default: () => [] },
            dataId: { type: String, default: null }
        },
        data() {
            return {
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'name',
                            label: '姓名',
                            fixed: 'left',
                            disabled: true
                        },
                        {
                            type: 'dict',
                            dictType: 'peopleTypeSection',
                            prop: 'memberType',
                            label: '人员类型'
                        },
                        {
                            prop: 'phone',
                            label: '联系电话',
                            width: 150
                        },
                        {
                            prop: 'email',
                            label: '邮箱',
                            width: 150
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
                        width: 70,
                        fixed: 'right',
                        show: this.isEdit
                    }
                }
            }
        },
        computed: {
            enableDataList() {
                return this.dataList.filter(v => v.dbStatus !== true)
            }
        },
        watch: {
        },
        mounted() {
        },
        methods: {
            handleDelete(index, row) {
                this.$emit('delete', index, row)
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
