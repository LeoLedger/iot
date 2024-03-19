<!--
* @description 抽检明细列表
* @author yc
!-->
<template>
    <TableComponent
        v-bind="tableData"
        :list="dataList"
        empty-hide-table
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
    import enums from '@/utils/enum'
    // 组件

    export default {
        name: 'CheckList',
        components: {
        },
        props: {
            isEdit: { type: Boolean, default: true },
            dataList: { type: Array, default: () => [] }
        },
        data() {
            var that = this
            return {
                error: [],
                tableData: {
                    total: 0,
                    list: [],
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'imei',
                            label: 'IMEI',
                            width: 200,
                            render: this.isEdit && ((h, { row, column }) => {
                                var key = column.prop
                                return (
                                    <el-input
                                        size='mini'
                                        type='text'
                                        value={row[key]}
                                        class={row._error.includes(key) ? 'error' : ''}
                                        placeholder={column.label}
                                        onBlur={() => { that.validate(false) }}
                                        onInput={res => { row[key] = res }}
                                    />
                                )
                            })
                        },
                        {
                            type: this.isEdit ? '' : 'status',
                            style: this.isEdit ? '' : 'block',
                            enums: enums.checkResult,
                            prop: 'checkResult',
                            label: '检测结果',
                            width: 120,
                            render: this.isEdit && ((h, { row, column }) => {
                                var key = column.prop
                                return (
                                    <dict-select
                                        size='mini'
                                        type='checkResult'
                                        value={row[key]}
                                        class={row._error.includes(key) ? 'error' : ''}
                                        placeholder='检测结果'
                                        onChange={res => {
                                            row[key] = res
                                            that.handleCheckResultChange()
                                        }}
                                    />
                                )
                            })
                        },
                        {
                            prop: 'remark',
                            label: '备注说明',
                            render: this.isEdit && ((h, { row, column }) => {
                                var key = column.prop
                                return (
                                    <el-input
                                        size='mini'
                                        type='text'
                                        value={row[key]}
                                        onInput={res => { row[key] = res }}
                                        placeholder={column.label}
                                    />
                                )
                            })
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: null,
                        maxHeight: null
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
            this.validate()
        },
        methods: {
            // 效验表单
            validate(message = true) {
                var pass = true
                this.dataList.forEach((item, index) => {
                    var error = [];
                    ['imei', 'checkResult'].forEach(key => {
                        if (item[key] === '') {
                            pass = false
                            error.push(key)
                        }
                    })
                    item._error = error
                })
                if (!pass && message) {
                    this.$message.warning('IMEI和检测结果不能为空')
                }
                return pass
            },
            // 新增
            handleAdd() {
                this.dataList.push({
                    imei: '',
                    checkResult: '',
                    remark: '',
                    _error: []
                })
                this.$emit('update', this.dataList)
            },
            // 删除
            handleDelete(index) {
                this.dataList.splice(index, 1)
                this.$emit('update', this.dataList)
            },
            // 检测结果改变时触发
            handleCheckResultChange() {
                this.validate(false)
                this.$emit('update', this.dataList)
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
