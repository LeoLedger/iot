<!--
* @description 维修单 - 维修确认 - 故障设备列表
* @author 望浩然
!-->
<template>
    <div>
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
        <ReplaceDeviceDialog
            v-if="replaceDeviceDialog.visible"
            v-bind="replaceDeviceDialog"
            :visible.sync="replaceDeviceDialog.visible"
            :excludes="selectedDeviceList"
            @change="handlePickChange"
        />
    </div>
</template>

<script>
    import deviceSim from '@/api/inventory/deviceSim'
    import deviceApi from '@/api/inventory/device'
    import ReplaceDeviceDialog from './ReplaceDeviceDialog'
    import { setTime } from '@/utils/auth'
    export default {
        components: {
            ReplaceDeviceDialog
        },
        props: {
            dataList: { type: Array, default: () => [] },
            isEdit: { type: Boolean, default: false }
        },
        data() {
            return {
                feedbackOptions: [
                    { value: 1, label: '111' }
                ],
                loading: false,
                activeRow: {},
                replaceDeviceDialog: {
                    visible: false,
                    type: '3'
                },
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            label: 'IMEI',
                            prop: 'imei',
                            minWidth: 160,
                            isCopy: true,
                            fixed: 'left',
                            isClick: true,
                            dialogType: 'device',
                            idKey: 'imei'
                        },
                        {
                            label: '产品编号',
                            prop: 'productCode',
                            minWidth: 100,
                            fixed: 'left'
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
                            prop: 'carNumber',
                            label: '车牌号',
                            width: 150
                        },
                        {
                            prop: 'errorCode',
                            label: '故障代码',
                            width: 140,
                            render: (h, { row, column }) => {
                                return (
                                      <fault-msg-select
                                          disabled={true}
                                          type='1'
                                          value={row[column.prop]}
                                          onInput={value => {
                                            row[column.prop] = value
                                          }}
                                          onChange={data => {
                                            row.feedback = data ? data.name : ''
                                          }}
                                      />
                                  )
                            }
                        },
                        {
                            prop: 'feedback',
                            label: '反馈异常',
                            width: 150
                        },
                        {
                            prop: 'registerDate',
                            label: '登记日期',
                            width: 160
                        },
                        {
                            prop: 'factoryFeedback',
                            label: '厂家诊断结果',
                            width: 150,
                            isRender: ({ row }) => this.isEdit && row.status === 0,
                            render: (h, { row, column }) => {
                                return (
                                  <history-select
                                    value={row[column.prop]}
                                    clearable
                                    type='6'
                                    productId={row.productId}
                                    onInput={res => { row[column.prop] = res }}
                                  />
                                 )
                            }
                        },
                        {
                            prop: 'factoryHandlingWay',
                            label: '厂家处理方式',
                            width: 200,
                            isRender: ({ row }) => this.isEdit && row.status === 0,
                            render: (h, { row, column }) => {
                                return (
                                  <el-input
                                    value={row[column.prop]}
                                    placeholder={'请填写' + column.label}
                                    onInput={(val) => { row[column.prop] = val }}/>
                                )
                            }
                        },
                        {
                            label: '是否更换设备',
                            prop: 'isReplaceDevice',
                            width: 100,
                            render: (h, { row, column }) => {
                                return (
                                    <el-checkbox
                                      disabled={!this.isEdit || row.status !== 0}
                                      v-loading={this.loading}
                                      value={row.isReplaceDevice}
                                      onChange={(res) => {
                                        this.onInputProp(res, 'isReplaceDevice', row)
                                      }}
                                    />
                                )
                            }
                        },
                        {
                            label: '是否换卡',
                            prop: 'isReplaceCard',
                            width: 80,
                            render: (h, { row, column }) => {
                                return (
                                  <el-checkbox
                                    disabled={!this.isEdit || row.handlingWay === 2 || row.handlingWay === 1 || row.status !== 0}
                                    v-loading={this.loading}
                                    value={row.isReplaceCard}
                                    onChange={(res) => { this.onInputProp(res, 'isReplaceCard', row) }}/>
                                )
                            }
                        },
                        {
                            prop: 'labourCost',
                            label: '人工费(元)',
                            width: 100,
                            isRender: ({ row }) => this.isEdit && row.status === 0,
                            render: (h, { row, column }) => {
                                return (
                                  <el-input
                                    type='number'
                                    placeholder={'请填写' + column.label}
                                    value={row[column.prop]}
                                    onInput={(val) => { this.onInputMoney(val, 'labourCost', row) }}
                                  />
                                 )
                            }
                        },
                        {
                            prop: 'cost',
                            label: '维修费(元)',
                            width: 100,
                            isRender: ({ row }) => this.isEdit && row.status === 0,
                            render: (h, { row, column }) => {
                                return (
                                  <el-input
                                    type='number'
                                    placeholder={'请填写' + column.label}
                                    value={row[column.prop]}
                                    onInput={(val) => { this.onInputMoney(val, 'cost', row) }}
                                  />
                                )
                            }
                        },
                        {
                            prop: 'handlingWay',
                            label: '处理方式',
                            width: 150,
                            render: (h, { row, column }) => {
                                return (
                                  <dict-select
                                    disabled={!this.isEdit || row.status !== 0}
                                    exclude={this.handingWayExclude(row)}
                                    type='carTroubleBillsHandlingWay'
                                    value={row[column.prop]}
                                    placeholder={column.label}
                                    onChange={(val) => { this.onInputProp(val, 'handlingWay', row) }}
                                  />
                                )
                            }
                        },
                        {
                            prop: 'companyBearCost',
                            label: '公司承担费用',
                            width: 100,
                            isRender: ({ row }) => this.isEdit && row.status === 0,
                            render: (h, { row, column }) => {
                                return (
                                  <div>
                                    <el-input
                                      type='number'
                                      placeholder={'请填写' + column.label}
                                      value={row[column.prop]}
                                      onInput={(val) => { row[column.prop] = val }}
                                    />
                                  </div>
                                )
                            }
                        },
                        {
                            prop: 'enterpriseBearCost',
                            label: '企业承担费用',
                            width: 100,
                            isRender: ({ row }) => this.isEdit && row.status === 0,
                            render: (h, { row, column }) => {
                                return (
                                  <div>
                                    <el-input
                                      type='number'
                                      placeholder={'请填写' + column.label}
                                      value={row[column.prop]}
                                      onInput={(val) => { row[column.prop] = val }}
                                    />
                                  </div>
                          )
                            }
                        },
                        {
                            prop: 'replaceSim',
                            label: '更换SIM卡',
                            width: 200,
                            render: (h, { row, column }) => {
                                if (row.isReplaceCard) {
                                    const params = {
                                        prop: 'replaceSim',
                                        formKey: 'replaceSim',
                                        label: 'SIM卡 - 全新库存',
                                        labelKey: 'sim',
                                        dataKey: 'sim',
                                        extendParams: {
                                            lockedProps: ['warehouses'],
                                            typeId: this.getWarehousesSpaceType(2, '全新'),
                                            productCategory: 'BBB76246-2925-43D8-B81D-D5FF74F1D1D7',
                                            warehouses: 'warehousesSpaceTypeSim',
                                            selectSims: this.excludesSim
                                        },
                                        customRequest: deviceSim.getList
                                    }
                                    return (
                                    <div>
                                      <dialog-pick
                                        clearable
                                        disabled={row.status !== 0}
                                        formData={row}
                                        type='Device'
                                        params={params}
                                        placeholder='请选择SIM卡'
                                        onChange={(list) => { this.handleChangeSim(list[0].sim, row) }}
                                      />
                                    </div>
                                  )
                                }
                            }
                        },
                        {
                            prop: 'replaceImei',
                            label: '替换设备',
                            width: 210,
                            isRender: ({ row }) => this.isEdit && row.status === 0,
                            render: (h, { row, column }) => {
                                if (row.isReplaceDevice) {
                                    return (
                                    <div>
                                      <pick-input
                                        value={row[column.prop]}
                                        clearable
                                        placeholder='选择替换设备'
                                        onPick={() => {
                                          this.handlePickDevice(row)
                                        }}
                                        onClear={() => {
                                          this.handleClearDevice(row)
                                        }}
                                        onInput={res => {
                                          row.replaceImei = res
                                        }}
                                        onBlur={() => {
                                          this.handleBlurDevice(row, row.replaceImei)
                                        }}
                                      >
                                        <span slot='icon'>选</span>
                                      </pick-input>
                                    </div>
                                  )
                                }
                            },
                            isClick: !this.isEdit,
                            dialogType: 'device',
                            idKey: 'replaceImei'
                        },
                        {
                            prop: 'replaceType',
                            label: '替换类型',
                            width: 150,
                            type: 'dict',
                            dictType: 'replaceType'
                        }
                    ],
                    options: {
                        rules: {
                            replaceSim: { required: true, message: '替换设备不得为空', trigger: 'change', premise: [{ prop: 'isReplaceCard', includes: [true] }] },
                            replaceImei: { required: true, message: '替换设备不得为空', trigger: 'change', premise: [{ prop: 'isReplaceDevice', includes: [true] }] },
                            factoryFeedback: { required: true, message: '厂家诊断结果不得为空', trigger: 'change' },
                            factoryHandlingWay: { required: true, message: '厂家处理方式不得为空', trigger: 'change' },
                            labourCost: { required: true, message: '人工费不得为空', trigger: 'change' },
                            cost: { required: true, message: '维修费不得为空', trigger: 'change' },
                            handlingWay: { required: true, message: '处理方式不得为空', trigger: 'change' },
                            companyBearCost: { required: true, message: '公司承担费用不得为空', trigger: 'change' },
                            enterpriseBearCost: { required: true, message: '企业承担费用不得为空', trigger: 'change' }
                        },
                        height: '480px',
                        maxHeight: null,
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    },
                    // 列操作按钮
                    operates: {
                        show: false
                    }
                }
            }
        },
        computed: {
            selectedDeviceList() {
                const arr = []
                this.dataList.map(item => {
                    if (item.replaceDeviceId) {
                        arr.push(item.replaceDeviceId)
                    }
                })
                return arr
            },
            excludesSim() {
                const arr = []
                this.dataList.map(item => {
                    if (item.sim) {
                        arr.push(item.sim)
                    }
                    if (item.sim !== item.replaceSim && item.replaceSim) {
                        arr.push(item.replaceSim)
                    }
                })
                return arr
            },
            handingWayExclude() {
                return (row) => {
                    // 如果row.isReplaceDevice = true
                    if (row.isReplaceDevice) {
                        return [0]
                    } else if (row.isReplaceCard) {
                        return [1, 2]
                    } else return []
                }
            },
            // 校验金额
            amountValidate() {
                return (row) => {
                    const labourCost = Number(row.labourCost) || 0
                    const cost = Number(row.cost) || 0
                    const companyBearCost = Number(row.companyBearCost) || 0
                    const a = labourCost + cost
                    const b = companyBearCost
                    return a === b
                }
            }
        },
        watch: {
        },
        mounted() {
        },
        methods: {
            handlePickDevice(row) {
                let { projectName, projectId, productCode, replaceType, replaceImei, replaceDeviceId } = row
                // 在这里存储当前row
                this.activeRow = row
                this.replaceDeviceDialog = {
                    type: replaceType || '3',
                    value: {
                        imei: replaceImei,
                        guidId: replaceDeviceId
                    },
                    visible: true,
                    projectId,
                    productCode,
                    projectName
                }
            },
            handleBlurDevice(row, val) {
                if (val) {
                    // 调用接口加载设备数据
                    const params = {
                        imei: val,
                        warehousesId: '9f1d6d84-98da-4bc3-bc7c-ec299ef2b4d5',
                        typeId: 'cf946b83-9f2c-11eb-bbfa-000c29bb1337',
                        standbyProjectId: this.projectId,
                        productCategory: 'B16C3151-11D2-4364-8F45-63EFFFFCF424'
                    }
                    deviceApi.getList(params).then(res => {
                        if (res.success && res.data && res.data.records && res.data.records[0]) {
                            const device = res.data.records[0]
                            // 判断是否已选择过该设备
                            const hasOne = this.selectedDeviceList.findIndex(v => v === device.guidId) > -1
                            if (!hasOne) {
                                row.replaceImei = device.imei
                                row.replaceDeviceId = device.guidId
                                if (device.isNewDevice) {
                                    row.replaceType = 1
                                } else if (device.standbyProjectId) {
                                    row.replaceType = 3
                                }
                            } else {
                                row.replaceType = null
                                row.replaceDeviceId = null
                                row.replaceImei = null
                                this.$message.warning('输入的设备已被使用, 请重试')
                            }
                        } else {
                            const params_ = {
                                imei: val,
                                warehousesId: '1bba900a-26c8-492e-bd6d-1583814866c9',
                                typeId: this.getWarehousesSpaceType(0, '旧设备'),
                                productCategory: 'B16C3151-11D2-4364-8F45-63EFFFFCF424'
                            }
                            deviceApi.getList(params_).then(res_ => {
                                if (res_.success && res_.data && res_.data.records && res_.data.records[0]) {
                                    const device_ = res_.data.records[0]
                                    // 判断是否已选择过该设备
                                    const hasOne = this.selectedDeviceList.findIndex(v => v === device_.guidId) > -1
                                    if (!hasOne) {
                                        row.replaceImei = device_.imei
                                        row.replaceDeviceId = device_.guidId
                                        if (device_.isNewDevice) {
                                            row.replaceType = 1
                                        } else if (device_.standbyProjectId) {
                                            row.replaceType = 3
                                        }
                                    } else {
                                        row.replaceType = null
                                        row.replaceDeviceId = null
                                        row.replaceImei = null
                                        this.$message.warning('输入的设备已被使用, 请重试')
                                    }
                                } else {
                                    row.replaceType = null
                                    row.replaceDeviceId = null
                                    row.replaceImei = null
                                    this.$message.warning('未在项目备用库找到您输入的设备, 请重新输入')
                                }
                            })
                        }
                    })
                }
            },
            handlePickChange({ type, list }) {
                let data = list[0]
                // 在这里给replaceDeviceId和replaceType赋值
                this.activeRow.replaceType = type
                this.activeRow.replaceDeviceId = data.guidId
                this.activeRow.replaceImei = data.imei
            },
            handleClearDevice(row) {
                this.activeRow = {}
                row.replaceType = null
                row.replaceDeviceId = null
                row.replaceImei = null
            },
            handleChangeSim(sim, row) {
                // 判断这个sim是否已存在
                const hasSimItem = this.dataList.find(v => v.replaceSim === sim)
                if (hasSimItem && hasSimItem.imei !== row.imei) {
                    row.replaceSim = ''
                    this.$message.warning('该SIM卡已被选择，请重新选择')
                } else row.replaceSim = sim
            },
            onInputMoney(val, prop, row) {
                // 给组件赋值
                row[prop] = val
                // 如果是修改人工费或者维修费, 那么填充公司费
                if (prop === 'labourCost' || prop === 'cost') {
                    row.companyBearCost = Number(row.labourCost) + Number(row.cost)
                    // row.enterpriseBearCost = 0
                }
            },
            onInputProp(val, prop, row) {
                // 开始loading效果
                this.loading = true
                // 给组件赋值
                row[prop] = val
                // 强制刷新视图
                this.$nextTick(() => {
                    this.$forceUpdate()
                })
                // 换卡处理
                if (prop === 'isReplaceCard') {
                    if (val === true) {
                        // 重置换设备的字段
                        row.replaceDeviceId = ''
                        row.replaceType = ''
                        row.replaceImei = ''
                        row.handlingWay = ''
                        row.isReplaceDevice = false
                    } else {
                        row.replaceSim = ''
                        row.handlingWay = ''
                    }
                }
                // 换设备处理
                if (prop === 'isReplaceDevice') {
                    if (val === true) {
                        // 重置换卡的字段
                        row.replaceSim = ''
                        row.handlingWay = ''
                        row.isReplaceCard = false
                    } else {
                        row.replaceDeviceId = ''
                        row.replaceType = ''
                        row.handlingWay = ''
                        row.replaceImei = ''
                    }
                }
                // 如果处理方式
                if (prop === 'handlingWay') {
                    if (val === 0) {}
                    // 如果是报废 收回备用,勾选替换设备,取消换卡勾选
                    if (val === 2 || val === 1) {
                        row.replaceSim = ''
                        row.isReplaceDevice = true
                        row.replaceDeviceId = ''
                        row.replaceType = ''
                        row.replaceImei = ''
                        row.isReplaceCard = false
                    }
                }
                // 结束loading效果
                setTimeout(() => {
                    this.loading = false
                }, 100)
            },
            handleDelete(index, row) {
                this.$emit('delete', index, row)
            },
            // 通过dot实现列表内校验
            getValidate() {
                // 判断人工费+维修费是否等于公司承担费+企业承担费,如果不等则清空公司承担费和企业费
                let showError = false
                let showErrorMsg = ''
                this.dataList.map(item => {
                    if (!this.amountValidate(item)) {
                        item.companyBearCost = null
                        // item.enterpriseBearCost = null
                        showError = true
                        showErrorMsg = '提交失败，人工费与维修费的总额必须等于公司的承担费用！'
                    }
                })
                if (showError) {
                    return {
                        msg: showErrorMsg,
                        result: false
                    }
                } else {
                    return {
                        msg: '校验通过',
                        result: true
                    }
                }
            },
            submit(list) {
                return this.$refs.TableComponent.validateRows(list)
            }
        }
    }
</script>

<style lang='scss'>
</style>
