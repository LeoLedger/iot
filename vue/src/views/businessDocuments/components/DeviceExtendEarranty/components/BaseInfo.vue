<!--
* @description 基础信息
* @author yc
!-->
<template>
    <div v-loading="loading">
        <el-collapse v-model="collapseValue" class="layou-collapse">
            <el-collapse-item name="1" disabled>
                <div slot="title" class="title">
                    <div class="text">基础信息</div>
                </div>
                <div class="body-wrap">
                    <BaseForm
                        ref="BaseForm"
                        :form-data="formData"
                        :disabled="!isEdit"
                        :is-create="isCreate"
                        @data-change="handleDataChange"
                    />
                </div>
            </el-collapse-item>
            <el-collapse-item name="2" disabled>
                <div slot="title" class="title">
                    <div class="text">延保明细</div>
                </div>
                <div class="body-wrap">
                    <TableComponent
                        ref="TableComponent"
                        v-bind="tableData"
                        empty-hide-table
                    >
                        <template slot="操作" slot-scope="{row}">
                            <el-button
                                type="primary"
                                size="mini"
                                icon="el-icon-setting"
                                style="height: 28px"
                                @click="handleConfigButton(row)"
                            />
                        </template>
                    </TableComponent>
                </div>
            </el-collapse-item>
        </el-collapse>
        <!-- 延保设备清单 -->
        <DeviceList
            v-if="deviceListDialogVisible"
            :visible.sync="deviceListDialogVisible"
            :row-data="activeRowData"
            :bills-data="formData"
            :is-create="isCreate"
            :is-edit="isEditDeviceList"
            @update="handleDeviceUpdate"
        />
    </div>
</template>

<script>
    // API
    import deviceExtendEarrantyApi from '@/api/businessDocuments/deviceExtendEarranty'
    // 方法
    import rigorous from '@/utils/rigorous'
    // 组件
    import BaseForm from './BaseForm'
    import DeviceList from './ConfigDevice/DeviceList'

    export default {
        components: {
            BaseForm,
            DeviceList
        },
        props: {
            dataId: { type: [Number, String] },
            isEdit: { type: Boolean, default: false },
            jsonData: { type: null },
            isApproval: { type: Boolean, default: false },
            processIndex: { type: Number, default: 0 }
        },
        data() {
            return {
                loading: false,
                formData: {},
                dataList: [],
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            minWidth: 100
                        },
                        {
                            type: 'dict',
                            dictType: 'productType',
                            prop: 'productType',
                            label: '产品类型',
                            minWidth: 100
                        },
                        {
                            prop: 'count',
                            label: '延保数量',
                            width: 80,
                            isCopy: false,
                            isClick: true,
                            onClick: async(data) => {
                                if (!Array.isArray(data.deviceList)) {
                                    await this.queryDeviceList(data)
                                }
                                this.activeRowData = data
                                this.isEditDeviceList = false
                                this.deviceListDialogVisible = true
                            }
                        },
                        {
                            type: this.isEdit ? 'money' : null,
                            prop: 'extendYear',
                            label: '延保时长（年）',
                            width: 120,
                            render: this.isEdit && ((h, { row, column }) => {
                                return (
                                    <el-input-number
                                        value={row[column.prop]}
                                        onInput={res => {
                                            row[column.prop] = res
                                            this.updateBaseFormExpenses()
                                        }}
                                        placeholder='年'
                                        min={0}
                                        size='mini'
                                        precision={0}
                                        controls-position='right'
                                        style='width:100%;'
                                    />
                                )
                            })
                        },
                        {
                            type: this.isEdit ? 'money' : null,
                            prop: 'unitPrice',
                            label: '单价',
                            width: 130,
                            render: this.isEdit && ((h, { row, column }) => {
                                return (
                                    <el-input-number
                                        value={row[column.prop]}
                                        onInput={res => {
                                            row[column.prop] = res
                                            this.updateBaseFormExpenses()
                                        }}
                                        placeholder='单价'
                                        min={0}
                                        size='mini'
                                        controls-position='right'
                                        style='width:100%;'
                                    />
                                )
                            })
                        },
                        {
                            type: 'money',
                            prop: 'totalAmount',
                            label: '总价',
                            minWidth: 80
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: null,
                        maxHeight: null,
                        showAsterisk: this.isEdit,
                        onePageHidePagination: true
                    },
                    // 列操作按钮
                    operates: {
                        width: 67,
                        fixed: 'right',
                        show: this.isEdit
                    }
                },
                publicParam: {
                    pageSize: 10,
                    pageIndex: 1
                },
                collapseValue: ['1', '2'],
                activeRowData: null,
                isEditDeviceList: false,
                deviceListDialogVisible: false
            }
        },
        computed: {
            isCreate() {
                return !this.dataId
            }
        },
        watch: {
            dataId: {
                immediate: true,
                handler() {
                    this.queryBaseInfo()
                }
            },
            'publicParam.pageSize'() {
                this.filterData()
            },
            'publicParam.pageIndex'() {
                this.filterData()
            }
        },
        mounted() {
        },
        methods: {
            // 验证表单
            validate() {
                return new Promise((resolve, reject) => {
                    let list = this.dataList.filter(v => v.count)
                    if (list.length) {
                        resolve(list)
                    } else {
                        let message = '请至少配置一项延保时长和延保设备！'
                        this.$message.warning(message)
                        reject(message)
                    }
                })
            },
            // 点击提交按钮时触发
            async submit() {
                this.loading = true
                try {
                    let baseData = await this.$refs.BaseForm.submit()
                    let proList = await this.validate()
                    let res = await deviceExtendEarrantyApi.update({
                        ...this.formData,
                        ...baseData,
                        proList
                    })
                    this.getCanApprovalCount()
                    return this.$notify({
                        title: '保存成功',
                        message: res.msg,
                        type: 'success',
                        duration: 2000
                    })
                } catch (e) {
                    console.error(e)
                }
                this.loading = false
                return Promise.reject()
            },
            // 筛选数据
            filterData() {
                var pageSize = this.publicParam.pageSize
                var pageIndex = this.publicParam.pageIndex
                var list = this.dataList || []
                this.tableData.total = list.length
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
            },
            // 获取基础信息
            async queryBaseInfo() {
                if (this.dataId) {
                    this.loading = true
                    var res = await deviceExtendEarrantyApi.detail(this.dataId)
                    this.formData = {
                        ...this.formData,
                        ...res.data
                    }
                    var list = (res.data.proList || []).map(item => {
                        item.deviceInProdId = item.guidId
                        item.guidId = void 0
                        return item
                    })
                    this.dataList = list
                    this.filterData()
                    this.$emit('data-update', this.formData)
                    this.loading = false
                }
            },
            // 获取原始入库单的产品
            async queryOriginProduct() {
                this.loading = true
                try {
                    let { data } = await deviceExtendEarrantyApi.getOriginProduct({
                        supplierId: this.formData.purchaseSupplierId
                    })
                    let list = data.map(item => {
                        return {
                            count: 0,
                            unitPrice: 0,
                            extendYear: 0,
                            totalAmount: 0,
                            deviceList: null,
                            productId: item.productId,
                            productCode: item.productCode,
                            productType: item.productType
                        }
                    })
                    this.dataList = list
                    this.filterData()
                    this.updateBaseFormExpenses()
                } catch (e) {
                    console.log(e)
                }
                this.loading = false
            },
            // 获取延保设备列表
            async queryDeviceList(data) {
                this.loading = true
                try {
                    let { guidId } = this.formData
                    if (this.isCreate) {
                        // 创建时修改为不需要获取全部延保设备，用户自行调入
                        data.deviceList = []
                    } else {
                        let res = await deviceExtendEarrantyApi.getDevice({
                            lifeId: guidId,
                            lifeProId: data.deviceInProdId
                        })
                        data.deviceList = res.data
                    }
                } catch (e) {
                    console.log(e)
                }
                this.loading = false
            },
            // 更新基础表单费用
            updateBaseFormExpenses() {
                this.dataList.forEach(item => {
                    item.totalAmount = rigorous.floatMul(item.count, item.unitPrice)
                })
                this.formData = {
                    ...this.formData,
                    ...this.$refs.BaseForm.getFormData(),
                    count: this.dataList.reduce((a, b) => {
                        return a + b.count
                    }, 0),
                    amount: this.dataList.reduce((a, b) => {
                        return rigorous.floatAdd(a, b.totalAmount)
                    }, 0)
                }
            },
            // 入库单改变时触发
            handleDataChange(data) {
                this.formData = {
                    ...this.formData,
                    ...data
                }
                this.queryOriginProduct()
            },
            // 点击配置按钮时触发
            async handleConfigButton(data) {
                if (!Array.isArray(data.deviceList)) {
                    await this.queryDeviceList(data)
                }
                this.activeRowData = data
                this.isEditDeviceList = true
                this.deviceListDialogVisible = true
            },
            // 设备清单更新时触发
            handleDeviceUpdate(list) {
                this.activeRowData.count = list.length
                this.activeRowData.deviceList = list
                this.updateBaseFormExpenses()
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
