<!--
* @description 审批表单弹窗
* @author yc
!-->
<template>
    <div class="approval-dialog">
        <el-dialog
            :visible="visible"
            :title="title"
            :close-on-click-modal="false"
            width="800px"
            class="not-padding"
            append-to-body
            @close="$emit('update:visible', false)"
        >
            <div v-loading="loading" class="approval-container">
                <div class="body-wrap">
                    <el-tabs :value="tabName" class="layout-tabs">
                        <el-tab-pane
                            v-for="(item, index) in options"
                            :key="index"
                            :name="item.name"
                            :label="item.label"
                            :style="{height: height}"
                        >
                            <div class="container">
                                <slot :name="item.name"/>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane name="process" label="审批流程">
                            <div class="container">
                                <ApprovalProcess
                                    :wf-inst-id="extendParams.wfInstId"
                                    @update="$emit('process-update', $event)"
                                />
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                </div>
                <div v-if="canApproval" class="foot-wrap">
                    <el-form
                        ref="ApprovalForm"
                        :model="formData"
                        label-width="80px"
                    >
                        <el-row>
                            <el-col :span="24">
                                <el-form-item
                                    label="审核结果"
                                    prop="type"
                                >
                                    <el-radio-group
                                        v-model="formData.type"
                                        size="mini"
                                        @change="handlePassChange"
                                    >
                                        <template v-for="option in passOptions">
                                            <el-radio
                                                v-if="option.visible !== false"
                                                :key="option.value"
                                                :label="option.value"
                                            >
                                                {{ option.label }}
                                            </el-radio>
                                        </template>
                                    </el-radio-group>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item
                                    label="下一环节"
                                    prop="targetActivityIdentifier"
                                >
                                    <el-select
                                        v-model="formData.targetActivityIdentifier"
                                        :clearable="false"
                                        size="mini"
                                        style="width: 100%"
                                        placeholder="请选择下一环节"
                                        @change="handleStepChange"
                                    >
                                        <el-option
                                            v-for="option in stepOptions"
                                            :key="option.value"
                                            :value="option.value"
                                            :label="option.label"
                                        />
                                    </el-select>
                                </el-form-item>
                            </el-col>
                            <el-col v-if="receiverOptions.length" :span="12">
                                <el-form-item
                                    label="办理对象"
                                    prop="receiver"
                                >
                                    <el-select
                                        v-model="formData.receiver"
                                        :clearable="false"
                                        value-key="receiverId"
                                        size="mini"
                                        style="width: 100%"
                                        placeholder="请选择办理对象"
                                    >
                                        <el-option-group
                                            v-for="group in receiverOptions"
                                            :key="group.value"
                                            :label="group.label"
                                        >
                                            <el-option
                                                v-for="item in group.options"
                                                :key="item.receiverId"
                                                :label="item.receiverName"
                                                :value="item"
                                            />
                                        </el-option-group>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                            <el-col :span="24">
                                <el-form-item
                                    label="审批意见"
                                    prop="content"
                                >
                                    <el-input
                                        :rows="2"
                                        v-model="formData.content"
                                        type="textarea"
                                        resize="none"
                                        placeholder="请填写审批意见"
                                    />
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-form>
                </div>
            </div>
            <span v-if="canApproval" slot="footer">
                <el-button :loading="loading" size="mini" @click="$emit('update:visible', false)">取 消</el-button>
                <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit">提 交</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    // API
    import workFlow from '@/api/workFlow'
    // 方法
    import enums from '@/utils/enum'
    import { isPromise } from '@/utils'
    // 组件
    import ApprovalProcess from '@/components/Approval/ApprovalProcess'

    export default {
        name: 'ApprovalDialog',
        components: {
            ApprovalProcess
        },
        props: {
            title: { type: String, default: '审批' },
            height: { type: String, default: '' },
            tabName: { type: String, default: 'info' },
            visible: { type: Boolean, default: false },
            options: { type: Array, default: () => [{ label: '基础信息', name: 'info' }] },
            onlyShow: { type: Boolean, default: false },
            beforeSubmit: { type: Function },
            extendParams: { type: Object, default: () => ({}) }
        },
        data() {
            return {
                formData: {
                    type: 0,
                    receiver: null,
                    targetActivityIdentifier: '',
                    content: ''
                },
                passOptions: [
                    { label: '通过', value: 0, visible: true },
                    { label: '驳回', value: 1, visible: true }
                ],
                stepOptions: [],
                receiverOptions: [],
                loading: false
            }
        },
        computed: {
            canApproval() {
                if (this.onlyShow) {
                    return false
                }
                return !!this.extendParams.canHandle
            }
        },
        watch: {
        },
        mounted() {
            this.stepData = {}
            this.queryNextActivities(0)
            this.queryNextActivities(1)
        },
        methods: {
            // 获取下一环节
            async queryNextActivities(type = this.formData.type) {
                var wfActivityInstId = this.extendParams.wfActivityInstId
                if (this.canApproval && wfActivityInstId) {
                    this.loading = true
                    var data = await workFlow.getNextActivities({
                        type,
                        activityInstId: wfActivityInstId
                    })
                    if (data.length) {
                        this.passOptions.find(item => item.value === type).visible = true
                    } else {
                        this.passOptions.find(item => item.value === type).visible = false
                    }
                    this.stepData[type] = data.reverse()

                    if (this.formData.type === type) {
                        this.handlePassChange()
                        this.handleStepChange()
                    }
                    this.loading = false
                }
            },
            // 获取当前已输入的formdata
            getApprovalFormData() {
                if (this.$refs.ApprovalForm) {
                    return this.$refs.ApprovalForm.params
                }
            },
            // 点击提交按钮时触发
            async handleSubmit() {
                if (typeof this.beforeSubmit === 'function') {
                    const bool = this.beforeSubmit(this.formData)
                    if (isPromise(bool)) {
                        await bool
                    }
                    if (!bool) return
                }
                this.loading = true
                try {
                    var { type, files, content, receiver, targetActivityIdentifier } = this.formData
                    var { jsonData, approvalId, approvalType, wfActivityInstId } = this.extendParams
                    var res = await workFlow.send({
                        type,
                        approvalId,
                        approvalType,
                        content,
                        files,
                        receiver,
                        jsonData,
                        wfActivityInstId,
                        targetActivityIdentifier
                    })
                    this.getCanApprovalCount()
                    this.$notify({
                        title: '提交成功',
                        message: res.msg,
                        type: 'success',
                        duration: 2000
                    })
                    this.$emit('update')
                    this.$emit('update:visible', false)
                } catch (e) {
                    console.log(e)
                }
                this.loading = false
            },
            // 审批结果改变时触发
            handlePassChange() {
                var type = this.formData.type
                this.stepOptions = this.stepData[type].map(item => {
                    return {
                        label: item.name,
                        value: item.identifier
                    }
                })
                this.formData.content = type ? '不同意' : '同意'
                this.formData.targetActivityIdentifier = this.stepOptions[0].value
                this.handleStepChange()
            },
            // 下一环节改变时触发
            handleStepChange() {
                var type = this.formData.type
                var options = enums.receiveType.map(({ label, value }) => {
                    return {
                        label,
                        value,
                        options: [],
                        visible: true
                    }
                })
                var receiverData = this.stepData[type].find(item => item.identifier === this.formData.targetActivityIdentifier)
                receiverData.receiverList.forEach(item => {
                    var index = options.findIndex(v => v.value === item.receiverType)
                    if (index > -1) {
                        options[index].options.push(item)
                    }
                })
                options.forEach(item => {
                    item.visible = !!item.options.length
                })
                this.receiverOptions = options.filter(item => item.visible)
                if (receiverData.receiverList.length) {
                    this.formData.receiver = receiverData.receiverList[0]
                } else {
                    this.formData.receiver = null
                }
            }
        }
    }
</script>

<style lang='scss' scoped>
.approval-container {
    display: flex;
    flex-direction: column;
    height: 80vh;
    .body-wrap {
        flex: 1;
        display: flex;
        overflow: hidden;
        padding: 0 10px 0 15px;
        .container{
            padding-bottom: 15px;
        }
        /deep/ {
            .layout-tabs .el-tabs__content .el-tab-pane {
                padding-right: 5px;
            }
        }
    }
    .foot-wrap {
        padding: 20px 15px 0;
        background: rgb(247,248,250);
        border-top: solid 3px #00b1ff;
        box-shadow: 0 -5px 10px rgba(0,0,0,.1);
        position: relative;
        z-index: 10;
        /deep/ {
            .el-form *{
                font-size: 13px;
            }
            .el-radio__input {
                vertical-align: top;
            }
        }
    }
}
</style>
