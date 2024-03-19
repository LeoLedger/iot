<!--
* @description 项目信息表单
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
                        :disabled="!isCreate && !isUpdate"
                        :extend-params="extendParams"
                        @section="handleSectionChange"
                    />
                </div>
            </el-collapse-item>
            <el-collapse-item name="2" disabled>
                <div slot="title" class="title">
                    <div class="text">退库产品清单</div>
                    <el-button
                        type="warning"
                        @click="export1"
                    >导出</el-button>
                </div>
                <div class="body-wrap">
                    <TableComponent
                        v-bind="tableData"
                        empty-hide-table
                    >
                        <template slot="操作" slot-scope="{row}">
                            <el-button
                                type="primary"
                                size="mini"
                                icon="el-icon-setting"
                                @click="handleUpdate(row, true)"
                            />
                        </template>
                    </TableComponent>
                </div>
            </el-collapse-item>
        </el-collapse>
        <!-- 配置退库清单 -->
        <ReturnListDialog
            v-if="returnListDialog.visible"
            :row-data="activeRowData"
            :basic-data="formData"
            :visible.sync="returnListDialog.visible"
            :show-action="returnListDialog.showAction"
            :is-approval="isApproval"
            :process-index="processIndex"
            :is-create="isCreate"
            @change="handleListChange"
        />
    </div>
</template>

<script>
    // API
    import storageReturnApi from '@/api/businessDocuments/storageReturn'
    // 方法
    // 组件
    import BaseForm from './BaseForm'
    import ReturnListDialog from './ReturnListDialog'
    import { getNumberFormat } from '@/utils'

    export default {
        components: {
            BaseForm,
            ReturnListDialog
        },
        props: {
            dataId: { type: [Number, String] },
            isEdit: { type: Boolean, default: false },
            isUpdate: { type: Boolean, default: false },
            jsonData: { type: [Object, Array] },
            isApproval: { type: Boolean, default: false },
            processIndex: { type: Number, default: 0 },
            extendParams: { type: Object }
        },
        data() {
            return {
                loading: false,
                formData: {},
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: null,
                        maxHeight: null
                    },
                    // 列操作按钮
                    operates: {
                        width: 60,
                        fixed: 'right',
                        show: this.isEdit
                    }
                },
                collapseValue: ['1', '2'],
                activeRowData: null,
                returnListDialog: {
                    visible: false,
                    showAction: false
                }
            }
        },
        computed: {
            isCreate() {
                return !this.dataId
            },
            tableColumns() {
                return [
                    {
                        prop: 'productCode',
                        label: '产品编号',
                        minWidth: 100
                    },
                    {
                        prop: 'productType',
                        label: '产品类型',
                        minWidth: 100,
                        type: 'dict',
                        dictType: 'productType'
                    },
                    {
                        prop: 'count',
                        label: '可退库数量',
                        width: 100,
                        align: 'right'
                    },
                    {
                        prop: 'countIng',
                        label: '退库中',
                        width: 60,
                        align: 'right'
                    },
                    {
                        // 仅在非创建和修改时显示
                        visible: !this.isCreate && !this.isUpdate,
                        prop: 'countApply',
                        label: '申请退库数量',
                        width: 120,
                        align: 'right'
                    },
                    {
                        // 仅在创建和修改时显示
                        visible: this.isCreate || this.isUpdate,
                        prop: 'countApply',
                        label: '申请退库数量',
                        width: 120,
                        render: (h, { row, column }) => {
                            return (
                              <el-input
                                disabled={!this.isCreate && !this.isUpdate}
                                type='number'
                                value={row[column.prop]}
                                onInput={(val) => this.onInputNumber(row, column.prop, val)}
                              />
                            )
                        }
                    },
                    {
                        // 仅在 核对/完成 时显示
                        visible: this.processIndex > 1,
                        prop: 'countApply_',
                        label: '清点退库数量',
                        width: 120,
                        isCopy: false,
                        isClick: true,
                        onClick: (row) => {
                            this.handleUpdate(row, false)
                        },
                        align: 'right'
                    },
                    {
                        // 仅在清点时显示
                        visible: this.processIndex === 1,
                        prop: 'countApply_',
                        label: '清点退库数量',
                        width: 120,
                        isCopy: false,
                        isClick: true,
                        onClick: (row) => {
                            this.handleUpdate(row, false)
                        },
                        align: 'right'
                    },
                    {
                        // 仅在核对/完成时显示
                        visible: this.processIndex > 1,
                        prop: 'amountDeduct',
                        label: '扣除押金(元)',
                        width: 120,
                        type: 'money'
                    }
                ]
            }
        },
        watch: {
            dataId: {
                deep: true,
                immediate: true,
                handler() {
                    this.queryBaseInfo()
                }
            },
            processIndex() {
                this.tableData.operates.show = this.processIndex === 1 && this.isApproval
                this.$set(this.tableData, 'columns', this.tableColumns)
            }
        },
        mounted() {
            this.$set(this.tableData, 'columns', this.tableColumns)
        },
        methods: {
            async export1() {
                await storageReturnApi.exportDevice({ approvalDeviceReturnId: this.formData.guidId })
            },
            //
            onInputNumber(row, prop, val) {
                const max = row.count
                const min = 0
                if (val > max) {
                    row[prop] = max
                    return this.$message({ type: 'warning', message: '退库数量不得超过' + max + '台(可退库数量)' })
                } else if (val < min) {
                    row[prop] = 0
                } else {
                    row[prop] = val
                }
            },
            // 点击提交按钮时触发
            submit(callback, errorCallback) {
                var index = this.tableData.list.findIndex(item => item.countApply)
                if (this.tableData.list.length && index > -1) {
                    this.loading = true
                    this.$refs.BaseForm.submit((data) => {
                        storageReturnApi.update({
                            ...this.formData,
                            ...data,
                            prodList: this.tableData.list
                        }).then(res => {
                            this.$notify({
                                title: '保存成功',
                                message: res.msg,
                                type: 'success',
                                duration: 2000
                            })
                            this.getCanApprovalCount()
                            callback && callback()
                        }).catch(() => {
                            errorCallback && errorCallback()
                        }).finally(() => {
                            this.loading = false
                        })
                    }, () => {
                        this.loading = false
                        errorCallback && errorCallback()
                    })
                } else {
                    this.$message.warning('缺少退库产品清单，无法提交')
                    errorCallback && errorCallback()
                }
            },
            // 获取基础信息
            async queryBaseInfo() {
                if (this.dataId) {
                    // 如果是编辑,则从详情接口获取列表
                    this.loading = true
                    var res = await storageReturnApi.detail(this.dataId)
                    if (res.success) {
                        // 获取清单下的设备列表
                        await Promise.all(res.data.prodList.map(item => this.queryDeviceList(item)))
                        this.formData = {
                            ...this.formData,
                            ...res.data,
                            prodList: res.data.prodList
                        }
                        this.tableData.list = res.data.prodList
                        this.$emit('data-update', this.formData)
                        this.$emit('update:jsonData', this.tableData.list)
                    }
                    this.loading = false
                }
            },
            // 获取申请入库设备列表
            async queryDeviceList(data) {
                if (data.countApply) {
                    var res = await storageReturnApi.getProdDeviceList(data.guidId)
                    data.deviceList = res.data
                    data.countApply_ = res.data.length
                }
            },
            // 标段发生改变
            handleSectionChange(item) {
                // 标段改变,自动改变项目和企业
                const formData = this.$refs.BaseForm.getFormData()
                const newData = {
                    sectionId: item.guidId,
                    sectionName: item.name,
                    projectId: item.projectId,
                    projectName: item.projectName,
                    customerId: item.customerId,
                    customerName: item.customerName
                }
                this.formData = { ...formData, ...newData }
                // 标段改变,自动获取标段下的可退库产品列表
                this.loading = true
                storageReturnApi.getProdList(item.guidId).then(res => {
                    this.tableData.list = res.data.map(item => {
                        let countApply_ = 0
                        if (item.deviceList && item.deviceList.length) {
                            countApply_ = item.deviceList.length
                        }
                        return {
                            ...item,
                            countApply_: countApply_
                        }
                    })
                    if (res.data && res.data.length) {
                        // 更新列表项
                        this.$set(this.tableData, 'columns', this.tableColumns)
                        this.$message({ type: 'success', message: '已获取到该标段下的可退库产品列表' })
                    } else this.$message({ type: 'warning', message: '该标段下没有可退库产品' })
                    this.loading = false
                })
            },
            // 点击配置按钮时触发
            handleUpdate(data, showAction) {
                this.activeRowData = data
                this.activeRowData.sectionId = this.formData.sectionId
                // 审批时,设备列表数据已预加载, 非审批时,需要懒加载
                if (this.isApproval) {
                    this.returnListDialog.visible = true
                    this.returnListDialog.showAction = showAction
                } else {
                    this.queryDeviceList(this.activeRowData).then(res => {
                        this.returnListDialog.visible = true
                        this.returnListDialog.showAction = false
                    })
                }
            },
            // 退库清单更新时触发
            handleListChange(list) {
                // 更新清点退库数量
                this.activeRowData.countApply_ = list.length
                // 更新设备列表
                this.activeRowData.deviceList = list
                // 更新扣除押金
                this.activeRowData.amountDeduct = Number(list.reduce((a, b) => {
                    return Number(a) + Number(b.cashPledge)
                }, 0))
                // 更新tableData.list
                const item = this.tableData.list.find(item => item.guidId === this.activeRowData.guidId)
                item.deviceList = list
                this.$emit('update:jsonData', this.tableData.list)
            }
        }
    }
</script>

<style lang='scss' scoped>
.input-dialog {
    padding: 20px 0;
    .text {
        margin-bottom: 15px;
    }
}
</style>
