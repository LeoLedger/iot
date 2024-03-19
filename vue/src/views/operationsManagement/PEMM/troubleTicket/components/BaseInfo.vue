<!--
* @description 基础信息
* @author yc
!-->
<template>
    <div class="base-info">
        <el-collapse v-loading="loading" v-model="collapseValue" class="layou-collapse flex">
            <el-collapse-item name="1" disabled>
                <div slot="title" class="title">
                    <div class="text">基础信息</div>
                </div>
                <div class="base-form">
                    <BaseForm
                        ref="BaseForm"
                        :is-edit="isBaseInfoEdit"
                        :is-create="isCreate"
                        :form-data="formData"
                        @section-change="handleSectionChange"
                    />
                </div>
            </el-collapse-item>
            <component
                ref="TableModule"
                :is="tableModuleName"
                :is-edit="isEdit"
                :form-data="formData"
                @ready="handleTableModuleReady"
                @validate="handleValidateChange"
            />
        </el-collapse>
        <div>
            <!-- 信息窗口 -->
            <MessageDialog
                v-bind="messageDialog"
                :visible.sync="messageDialog.visible"
                @confirm="messageDialog.visible = false"
            />
        </div>
    </div>
</template>

<script>
    // API
    import troubleTicketApi from '@/api/operationsManagement/troubleTicket'
    // 方法
    // 组件
    import BaseForm from './BaseForm'
    import UpdateTable from './Table/Update'
    import HandleTable from './Table/Handle'

    export default {
        name: 'BaseInfo',
        components: {
            BaseForm,
            UpdateTable,
            HandleTable
        },
        props: {
            dataId: { type: [Number, String] },
            isEdit: { type: Boolean, default: false },
            operType: { type: Number, default: 0 }
        },
        data() {
            return {
                loading: false,
                formData: {},
                collapseValue: ['1', '2'],
                messageDialog: {
                    visible: false
                },
                validateing: false
            }
        },
        computed: {
            isCreate() {
                return !this.dataId
            },
            isCanSubmit() {
                return !this.loading && !this.validateing
            },
            isBaseInfoEdit() {
                if (this.isEdit) {
                    return [0, 1].includes(this.operType)
                }
                return false
            },
            tableModuleName() {
                switch (this.operType) {
                case 0:
                case 1:
                    // 新建or编辑
                    return 'UpdateTable'
                case 2:
                    // 保修替换
                    return this.isEdit ? 'HandleTable' : 'UpdateTable'
                default:
                    return 'HandleTable'
                }
            }
        },
        watch: {
            dataId: {
                immediate: true,
                handler() {
                    this.queryBaseInfo()
                }
            }
        },
        mounted() {
        },
        methods: {
            // 点击提交按钮时触发
            async submit(isTemp = 0) {
                let data
                if (this.isCanSubmit) {
                    // 只有创建和编辑且不是暂存才验证基础表单
                    if (!isTemp && [0, 1].includes(this.operType)) {
                        data = await this.$refs.BaseForm.submit()
                    }
                    return await this.handleSubmit(isTemp, data)
                } else {
                    this.$message.warning('请等待操作完成！')
                }
                return Promise.reject()
            },
            // 验证表单
            validate() {
                return this.$refs.BaseForm.validate()
            },
            // 提交数据
            async handleSubmit(isTemp, data) {
                let devices
                if (isTemp) {
                    devices = this.$refs.TableModule.getFormData()
                } else {
                    // 验证表格内的表单
                    devices = await this.$refs.TableModule.validate()
                }
                var formData = {
                    ...this.formData,
                    ...data,
                    isTemp,
                    devices,
                    operType: this.operType
                }
                var res = await troubleTicketApi.update(formData)
                this.$notify({
                    title: '保存成功',
                    message: res.msg,
                    type: 'success',
                    duration: 2000
                })
            },
            // 获取基础信息
            async queryBaseInfo() {
                if (this.dataId) {
                    this.loading = true
                    let { data } = await troubleTicketApi.detail(this.dataId)
                    this.formData = {
                        ...this.formData,
                        ...data
                    }
                    this.loading = false
                }
            },
            // 验证状态改变时触发
            handleValidateChange(value) {
                this.validateing = value
            },
            // 标段改变时触发
            async handleSectionChange({ data }) {
                this.formData = {
                    ...this.formData,
                    ...data,
                    devices: []
                }
                var res = await troubleTicketApi.validSection(data.sectionId)
                if (!res.data) {
                    this.messageDialog = {
                        visible: true,
                        content: '该标段存在“挂起”状态的设备！'
                    }
                }
            },
            // 表格组件准备就绪时触发
            handleTableModuleReady(_this) {
                _this.parent = this
            }
        }
    }
</script>

<style lang='scss' scoped>
.base-info {
    height: 100%;
    .base-form {
        padding-right: 30px;
    }
    /deep/ {
        .device-wrap {
            height: 100%;
            padding-bottom: 1px;
        }
    }
}
</style>
