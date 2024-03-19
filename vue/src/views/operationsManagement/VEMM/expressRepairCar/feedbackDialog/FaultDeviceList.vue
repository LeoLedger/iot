<!--
* @description 寄修单 - 维修反馈 - 设备清单
* @author 望浩然
!-->
<template>
    <div v-if="!loading">
        <TableComponent
            ref="TableComponent"
            v-bind="tableData"
            :list="dataList"
            empty-hide-table
        >
            <template slot="操作" slot-scope="{$index, row}" v-if="showAction">
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
    </div>
</template>

<script>
    export default {
        components: {
        },
        props: {
            dataList: { type: Array, default: () => [] },
            isEdit: { type: Boolean, default: false },
            isCreate: { type: Boolean, default: false },
            showAction: { type: Boolean, default: false }
        },
        data() {
            return {
                loading: false,
                activeRow: {},
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            label: 'IMEI',
                            prop: 'imei',
                            minWidth: 200,
                            isCopy: true,
                            fixed: 'left',
                            isClick: true,
                            dialogType: 'device',
                            idKey: 'imei'
                        },
                        {
                            label: '产品编号',
                            prop: 'productCode',
                            width: 150,
                            fixed: 'left'
                        },
                        {
                            prop: 'projectName',
                            label: '项目',
                            isClick: true,
                            dialogType: 'project',
                            idKey: 'projectId',
                            minWidth: 100
                        },
                        {
                            prop: 'sectionName',
                            label: '标段',
                            isClick: true,
                            dialogType: 'sections',
                            idKey: 'sectionId',
                            minWidth: 100
                        },
                        {
                            prop: 'customerName',
                            label: '企业',
                            isClick: true,
                            dialogType: 'customer',
                            idKey: 'customerId',
                            minWidth: 100
                        },
                        {
                            prop: 'errorCode',
                            label: '故障代码',
                            width: 140,
                            render: this.isCreate && ((h, { row, column }) => {
                                return (
                                    <fault-msg-select
                                        type='1'
                                        clearable
                                        value={row[column.prop]}
                                        onInput={res => { row[column.prop] = res }}
                                        onChange={val => {
                                          this.onInputProp(val, 'errorCode', row)
                                        }}
                                     />
                                )
                            })
                        },
                        {
                            prop: 'feedback',
                            label: '反馈异常',
                            width: 150
                        },
                        {
                            prop: 'factoryFeedback',
                            label: '厂家诊断结果',
                            width: 200,
                            render: this.isEdit && ((h, { row, column }) => {
                                return (
                                  <history-select
                                    value={row[column.prop]}
                                    clearable
                                    type='6'
                                    productId={row.productId}
                                    onInput={res => { row[column.prop] = res }}
                                  />
                                 )
                            })
                        },
                        {
                            prop: 'factoryHandlingWay',
                            label: '厂家处理方式',
                            width: 200,
                            render: this.isEdit && ((h, { row, column }) => {
                                return (
                                        <el-input
                                          value={row[column.prop]}
                                          onInput={(val) => { row[column.prop] = val }}
                                        />
                                )
                            })
                        },
                        {
                            prop: 'verificationResult',
                            label: '维修结果',
                            width: 200,
                            render: (h, { row, column }) => {
                                return (
                                    <dict-select
                                  disabled={!this.isEdit}
                                  type='expressRepairCarVerificationResult'
                                  value={row.verificationResult}
                                  placeholder={column.label}
                                  onChange={(val) => { this.handleResultChange(val, row) }}
                                  />
                                )
                            }
                        },
                        {
                            prop: 'verificationHandlingWay',
                            label: '处理方式',
                            width: 200,
                            render: (h, { row, column }) => {
                                return (
                                    <dict-select
                                  disabled={true}
                                  type='expressRepairCarHandlingWay'
                                  value={row.verificationHandlingWay}
                                  placeholder={column.label}
                                  onChange={(val) => { row[column.prop] = val }}
                                  />
                                )
                            }
                        },
                        {
                            prop: 'cost',
                            label: '维修费(元)',
                            width: 100,
                            render: this.isEdit && ((h, { row, column }) => {
                                return (
                                  <el-input
                                    type='number'
                                    value={row[column.prop]}
                                    onInput={(val) => { this.onInputMoney(val, 'cost', row) }}
                                  />
                                )
                            })
                        },
                        {
                            prop: 'companyBearCost',
                            label: '公司承担费用',
                            width: 100,
                            render: this.isEdit && ((h, { row, column }) => {
                                return (
                                    <div>
                                    <el-input
                                  type='number'
                                  value={row[column.prop]}
                                  onInput={(val) => { row[column.prop] = val }}
                                  />
                                  </div>
                                )
                            })
                        },
                        {
                            prop: 'enterpriseBearCost',
                            label: '企业承担费用',
                            width: 100,
                            render: this.isEdit && ((h, { row, column }) => {
                                return (
                                    <div>
                                    <el-input
                                  type='number'
                                  value={row[column.prop]}
                                  onInput={(val) => { row[column.prop] = val }}
                                  />
                                  </div>
                                )
                            })
                        }
                    ],
                    options: {
                        rules: {
                            errorCode: { required: true, message: '故障代码不得为空', trigger: 'change' },
                            factoryFeedback: { required: true, message: '厂家诊断结果不得为空', trigger: 'change' },
                            factoryHandlingWay: { required: true, message: '厂家处理方式不得为空', trigger: 'change' },
                            verificationResult: { required: true, message: '维修结果不得为空', trigger: 'change' },
                            verificationHandlingWay: { required: true, message: '处理方式不得为空', trigger: 'change' },
                            cost: { required: true, message: '维修费不得为空', trigger: 'change' }
                        },
                        height: null,
                        maxHeight: null,
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    },
                    // 列操作按钮
                    operates: {
                        show: true,
                        fixed: 'right'
                    }
                }
            }
        },
        computed: {
            // 校验金额
            amountValidate() {
                return (row) => {
                    const labourCost = Number(row.labourCost) || 0
                    const cost = Number(row.cost) || 0
                    const companyBearCost = Number(row.companyBearCost) || 0
                    const enterpriseBearCost = Number(row.enterpriseBearCost) || 0
                    const a = labourCost + cost
                    const b = companyBearCost + enterpriseBearCost
                    return a === b
                }
            }
        },
        watch: {
            showAction: {
                immediate: true,
                handler(val) {
                    this.$set(this.tableData.operates, 'show', val)
                }
            }
        },
        methods: {
            onInputMoney(val, prop, row) {
                // 给组件赋值
                row[prop] = val
                row.companyBearCost = val
                row.enterpriseBearCost = 0
            },
            onInputProp(val, prop, row) {
                // 开始loading效果
                // this.loading = true
                // 给组件赋值
                console.log(prop, '=>', val)
                if (prop === 'errorCode') {
                    row.feedback = val ? val.name : ''
                } else {
                    row[prop] = val
                }
                // 强制刷新视图
                this.$nextTick(() => {
                    this.$forceUpdate()
                })
                // 结束loading效果
                setTimeout(() => {
                    // this.loading = false
                }, 100)
            },
            handleDelete(index, row) {
                this.$emit('delete', index, row)
            },
            submit() {
                return this.$refs.TableComponent.validate()
            },
            handleResultChange(val, row) {
                if (val === 0) {
                    row.verificationHandlingWay = 0
                    row.verificationResult = 0
                } else if (val === 1) {
                    row.verificationHandlingWay = 1
                    row.verificationResult = 1
                }
            },
            // 通过dot实现列表内校验
            getValidate() {
                // 判断人工费+维修费是否等于公司承担费+企业承担费,如果不等则清空公司承担费和企业费
                let showError = false
                this.dataList.map(item => {
                    if (!this.amountValidate(item)) {
                        item.companyBearCost = null
                        item.enterpriseBearCost = null
                        showError = true
                    }
                })
                if (showError) {
                    return {
                        msg: '提交失败，人工费与维修费的总额必须等于公司与企业的承担费用总和！',
                        result: false
                    }
                } else {
                    return {
                        msg: '校验通过',
                        result: true
                    }
                }
            }
        }
    }
</script>

<style lang='scss'>
</style>
