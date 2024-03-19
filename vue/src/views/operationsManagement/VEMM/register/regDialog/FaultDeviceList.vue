<!--
* @description 登记维修 - 故障设备列表
* @author 望浩然
!-->
<template>
    <TableComponent
        ref="TableComponent"
        v-bind="tableData"
        :list="dataList"
        empty-hide-table
    >
        <template slot="操作" slot-scope="{$index, row}">
            <div style="text-align: center">
                <el-button
                    size="mini"
                    icon="el-icon-delete"
                    title="移除"
                    @click="handleDelete($index, row)"
                />
            </div>
        </template>
    </TableComponent>
</template>

<script>
    export default {
        components: {
        },
        props: {
            dataList: { type: Array, default: () => [] },
            isEdit: { type: Boolean, default: true }
        },
        data() {
            return {
                feedbackOptions: [
                    { value: 1, label: '111' }
                ],
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            label: '产品编号',
                            prop: 'productCode',
                            minWidth: 100,
                            sortable: false
                        },
                        {
                            label: 'IMEI',
                            prop: 'imei',
                            minWidth: 155,
                            dbProp: 'c_imei',
                            sortable: 'custom',
                            isClick: true,
                            dialogType: 'device',
                            idKey: 'imei'
                        },
                        {
                            label: '所在项目',
                            prop: 'projectName',
                            minWidth: 100,
                            sortable: false,
                            isClick: true,
                            dialogType: 'project',
                            idKey: 'projectId'
                        },
                        {
                            label: '所在标段',
                            prop: 'sectionName',
                            minWidth: 100,
                            sortable: false,
                            isClick: true,
                            dialogType: 'project',
                            idKey: 'projectId'
                        },
                        {
                            label: '所在企业',
                            prop: 'customerName',
                            minWidth: 100,
                            sortable: false
                        },
                        {
                            prop: 'carNumber',
                            label: '车牌号',
                            width: 150,
                            render: (h, { row, column }) => {
                                const disabled = !this.isEdit
                                return (
                                  <el-input
                                    value={row.carNumber}
                                    onInput={(val) => { row.carNumber = val }}
                                    placeholder='输入车牌号'
                                    disabled={disabled}
                                  />
                                )
                            }
                        },
                        {
                            prop: 'errorCode',
                            label: '故障代码',
                            width: 140,
                            render: this.isEdit &&
                                ((h, { row, column }) => {
                                    return (
                                        <fault-msg-select
                                            type='1'
                                            clearable
                                            value={row[column.prop]}
                                            onInput={value => {
                                                row[column.prop] = value
                                            }}
                                            onChange={data => {
                                                row.feedback = data ? data.name : ''
                                            }}
                                        />
                                    )
                                })
                        },
                        {
                            prop: 'feedback',
                            label: '反馈异常',
                            width: 200
                        },
                        {
                            prop: 'registerDate',
                            label: '登记日期',
                            width: 160,
                            render: (h, { row, column }) => {
                                const disabled = !this.isEdit
                                return (
                                  <el-date-picker
                                    value={row[column.prop]}
                                    style='width: 100%'
                                    type='date'
                                    placeholder='选择日期'
                                    value-format='yyyy-MM-dd HH:mm:ss'
                                    format='yyyy-MM-dd'
                                    onInput={(val) => { row[column.prop] = val }}
                                    disabled={disabled}
                                  />
                                )
                            }
                        },
                        {
                            label: '上次维修时间',
                            prop: 'lastRepairTime',
                            width: 140,
                            dbProp: 'c_last_repair_time',
                            sortable: 'custom',
                            type: 'date'
                        }
                    ],
                    options: {
                        rules: {
                            errorCode: { required: true, message: '请选择故障代码', trigger: 'change' },
                            registerDate: { required: true, message: '请填写登记日期', trigger: 'change' }
                        },
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
        watch: {
        },
        mounted() {
        },
        methods: {
            onInputProp(val, prop, row) {
                row[prop] = val
            },
            handleDelete(index, row) {
                this.$emit('delete', index, row)
            },
            submit() {
                return this.$refs.TableComponent.validate()
            }
        }
    }
</script>

<style lang='scss'>
</style>
