<!--
* @description 项目成员列表
* @author yc
!-->
<template>
    <TableComponent
        v-bind="tableData"
        :list="dataList || []"
        :empty-hide-table="!isEdit"
    >
        <template slot="操作" slot-scope="{$index}">
            <el-button
                type="danger"
                size="mini"
                icon="el-icon-delete"
                title="删除"
                @click="handleDelete($index)"
            />
        </template>
    </TableComponent>
</template>

<script>
    // API
    // 方法
    // 组件

    export default {
        name: 'ProjectMember',
        components: {
        },
        props: {
            isEdit: { type: Boolean, default: true },
            dataList: { type: Array, default: () => [] }
        },
        data() {
            return {
                tableData: {
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'userName',
                            label: '姓名',
                            width: 80
                        },
                        {
                            prop: 'deptName',
                            label: '所属部门',
                            width: 120
                        },
                        {
                            type: 'dict',
                            dictType: 'peopleType',
                            prop: 'memberType',
                            label: '人员类型',
                            width: 120
                        },
                        {
                            prop: 'userMobile',
                            label: '联系电话',
                            width: 110
                        },
                        {
                            prop: 'userEmail',
                            label: '邮箱'
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: this.isEdit ? '100%' : null,
                        maxHeight: this.isEdit ? '100%' : null,
                        onePageHidePagination: true
                    },
                    // 列操作按钮
                    operates: {
                        width: 55,
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
            // 删除成员
            handleDelete(index) {
                this.$emit('delete', index)
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
