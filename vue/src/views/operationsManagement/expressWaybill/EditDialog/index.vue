
<!--
* @description 快递单 - 查看/编辑/添加
* @author 望浩然
* @date 2021/5/14 - 5/18
-->
<template>
    <div>
        <el-dialog
            v-if="visible"
            :visible.sync="visible"
            :before-close="handleCancel"
            :close-on-click-modal="false"
            :title="dialogTitle"
            class="not-padding"
            width="800px"
            append-to-body
        >
            <collapse-tab-layout
                :show-tab="false"
                :collapse-list="collapseList"
                style="padding: 10px 0 10px 10px;">
                <template slot="BaseForm">
                    <BaseForm
                        v-if="visible && !isSend"
                        ref="BaseForm"
                        :is-edit="true"
                        :disabled="isDetail"
                        :form-data="formData"
                        :is-create="!isDetail && dataId === null"
                        @typeChange="handleTypeChange"
                        @approvalChange="handleApprovalChange"
                        @objectChange="handleObjectChange"
                        @clearObject="handleClearObject"
                        @clearApproval="handleClearApproval"
                    />
                    <BaseForm2
                        v-if="visible && isSend"
                        ref="BaseForm"
                        :is-edit="true"
                        :disabled="isDetail"
                        :form-data="formData"
                        @typeChange="handleTypeChange"
                        @approvalChange="handleApprovalChange"
                    />
                </template>
                <template
                    v-show="deviceListVisible"
                    slot="SendDevice"
                >
                    <SendDevice
                        ref="SendDevice"
                        :data-id="formData.guidId"
                        :device-list="deviceList"
                        :basic-data="formData"
                        :show-action="!isDetail"
                        :send-flag="sendFlag"
                    />
                </template>
            </collapse-tab-layout>
            <span slot="footer">
                <el-button size="mini" @click="handleCancel">关 闭</el-button>
                <el-button v-prereclick v-if="!isDetail" :loading="loading" size="mini" type="primary" @click="handleSubmit">保 存</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import BaseForm from './BaseForm'
    import BaseForm2 from './BaseForm2'
    import expressApi from '@/api/operationsManagement/expressRepair'
    import SendDevice from '@/views/operationsManagement/expressWaybill/EditDialog/SendDevice'
    import CollapseTabLayout from '@/components/CollapseTabLayout'
    import NoData from '@/components/NoData'
    export default {
        name: 'EditDialog',
        components: { NoData, CollapseTabLayout, BaseForm, BaseForm2, SendDevice },
        props: {
            // 快递单guidId
            dataId: {
                default: null
            },
            isDetail: {
                type: Boolean,
                default: true
            },
            visible: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                formData: {},
                deviceList: [],
                sendFlag: 0,
                loading: false,
                deviceListVisible: false,
                isSend: false
            }
        },
        computed: {
            collapseList() {
                return [
                    { title: '基础信息', disabled: true, slotName: 'BaseForm' },
                    { title: this.isSend ? '寄修单中的设备' : '寄出设备', button: false, slotName: 'SendDevice', visible: this.deviceListVisible }
                ]
            },
            dialogTitle() {
                if (this.isDetail) {
                    return '查看快递单'
                } else {
                    if (this.dataId) {
                        return '编辑快递单'
                    } else return '添加快递单'
                }
            }
        },
        watch: {
            dataId() {
                this.init()
            }
        },
        mounted() {
            this.init()
        },
        methods: {
            init() {
                if (!this.isDetail && this.dataId === null) this.sendFlag = 0
                if (this.isDetail || this.dataId !== null) {
                    this.getDetail()
                } else {
                    this.formData = {}
                }
            },
            getDetail() {
                this.formData = {}
                if (this.dataId) {
                    this.loading = true
                    expressApi.detail(this.dataId).then(res => {
                        if (res.success) {
                            this.formData = res.data
                            // 如果是新建模式
                            if (this.isDetail === false && !this.dataId) {
                                this.deviceList = []
                            } else {
                                this.deviceList = res.data.list
                            }
                            this.deviceListVisible = [
                                '9FF3CBF7-E62F-421B-96E4-6AD142F6AF0D', // 寄出维修设备
                                'FF9B8B30-FB28-4591-A469-F5F3FC13C9DB', // 寄出替换设备
                                '0B6FF336-4733-4B10-856F-F83F771D8295' // 寄出出库设备
                            ].includes(this.formData.businessType)
                            this.isSend = this.formData.businessType === '9FF3CBF7-E62F-421B-96E4-6AD142F6AF0D'
                        }
                        setTimeout(() => {
                            this.loading = false
                        }, 500)
                    })
                }
            },
            handleSubmit() {
                this.loading = true
                this.$refs.BaseForm.submit((data) => {
                    const dataList = this.$refs.SendDevice.getDataList()
                    if (dataList) {
                        if (dataList.find(item => item._error)) {
                            this.$message.warning('请先处理标红的设备后再试！')
                            this.loading = false
                            return
                        }
                        dataList.map(item => {
                            item.guidId = undefined
                        })
                    }
                    const postData = {
                        ...this.formData,
                        ...data,
                        list: dataList
                    }
                    expressApi.update(postData).then(res => {
                        if (res.success) {
                            this.$notify({
                                title: '保存成功',
                                message: res.msg,
                                type: 'success',
                                duration: 2000
                            })
                            this.$emit('confirm')
                            this.$emit('update:visible', false)
                            this.$emit('close', false)
                        }
                    }).finally(() => {
                        this.loading = false
                    })
                }, () => {
                    this.loading = false
                })
            },
            handleCancel() {
                this.$emit('update:visible', false)
                this.$emit('close', false)
            },
            handleTypeChange() {
                // 清空单据ID和单据Code
                const formData = this.$refs.BaseForm.getFormData()
                this.formData = { ...this.formData, ...formData, approvalCode: '', approvalId: '' }
                //
                this.deviceListVisible = [
                    '9FF3CBF7-E62F-421B-96E4-6AD142F6AF0D', // 寄出维修设备
                    'FF9B8B30-FB28-4591-A469-F5F3FC13C9DB', // 寄出替换设备
                    '0B6FF336-4733-4B10-856F-F83F771D8295' // 寄出出库设备
                ].includes(formData.businessType)
            },
            // 单据变化
            handleApprovalChange() {
                const formData = this.$refs.BaseForm.getFormData()
                this.formData = { ...this.formData, ...formData }
                // 清空原设备列表
                this.deviceList = []
                // 调入该单据所有设备
                this.getDeviceList(formData.approvalId, formData.businessType)
            },
            // 客户变化
            handleObjectChange(val) {
                const formData = this.$refs.BaseForm.getFormData()
                this.formData = { ...this.formData, ...formData }
            },
            // 获取某单据下的所有设备
            async getDeviceList(approvalId, businessType) {
                const params = { sendFlag: 0, approvalId, businessType }
                const res = await expressApi.getApprovalDeviceList(params)
                if (res.success) {
                    this.deviceList = res.data
                }
            },
            handleClearObject() {
                const formData = this.$refs.BaseForm.getFormData()
                this.formData = { ...this.formData, ...formData, objectId: null, objectName: null }
            },
            handleClearApproval() {
                const formData = this.$refs.BaseForm.getFormData()
                this.formData = { ...this.formData, ...formData, approvalId: null, approvalCode: null }
            }
        }
    }
</script>

<style scoped lang="scss">
.greyLabel {
  background-color: #f5f7fa;
  padding: 0 10px;
  height: 35px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
.greyLabel-title {
  font-size: 13px;
  &:before {
    height: 10px;
    content: '';
    width:0;
    border-left: 3px solid #2abeff;
    margin-right: 10px;
   }
  }
}
</style>
