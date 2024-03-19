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
                        :is-edit="isEditBaseInfo"
                        :is-create="isCreate"
                        :form-data="formData"
                        @data-change="handleDataChange"
                    />
                </div>
            </el-collapse-item>
            <component
                ref="TableModule"
                :is="tableModuleName"
                :is-edit="isEdit"
                :is-create="isCreate"
                :form-data="formData"
                @ready="handleTableModuleReady"
            />
        </el-collapse>
    </div>
</template>

<script>
    // API
    import sendRevisedApi from '@/api/operationsManagement/sendRevised'
    // 方法
    // 组件
    import BaseForm from './BaseForm'
    import UpdateTable from './Table/Update'
    import FeedbackTable from './Table/Feedback'
    import AllocationTable from './Table/Allocation'
    import VerifiableTable from './Table/Verifiable'

    export default {
        name: 'BaseInfo',
        components: {
            BaseForm,
            UpdateTable,
            FeedbackTable,
            AllocationTable,
            VerifiableTable
        },
        props: {
            dataId: { type: [Number, String] },
            isEdit: { type: Boolean, default: false },
            operType: { type: Number }
        },
        data() {
            return {
                loading: false,
                formData: {
                    type: 0
                },
                validateing: false,
                collapseValue: ['1', '2']
            }
        },
        computed: {
            isCreate() {
                return !this.dataId
            },
            isCanSubmit() {
                return !this.loading && !this.validateing
            },
            isEditBaseInfo() {
                if (this.isEdit) {
                    return [0, 1].includes(this.interiorOperType)
                }
                return false
            },
            tableModuleName() {
                switch (this.interiorOperType) {
                case 0:
                case 1:
                    // 新建or编辑
                    return 'UpdateTable'
                case 2:
                    // 维修反馈
                    return this.isEdit ? 'FeedbackTable' : 'UpdateTable'
                case 3:
                    // 分配核验
                    return this.isEdit ? 'AllocationTable' : 'FeedbackTable'
                case 4:
                    // 核验确认
                    return this.isEdit ? 'VerifiableTable' : 'FeedbackTable'
                default:
                    return 'VerifiableTable'
                }
            },
            interiorOperType() {
                if (this.isEdit) {
                    return this.operType
                } else {
                    // 如果详情模式，需要判断
                    switch (this.formData.status) {
                    case 0:
                        // 寄修待反馈
                        return 2
                    case 1:
                        // 分配待反馈
                        return 3
                    case 2:
                        // 核验确认
                        return 4
                    default:
                        return 99
                    }
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
            async submit(isSubmit = 1) {
                let data
                if (this.isCanSubmit) {
                    // 只有创建和编辑才验证基础表单
                    if ([0, 1].includes(this.interiorOperType)) {
                        data = await this.$refs.BaseForm.submit()
                    }
                    return await this.handleSubmit(data, isSubmit)
                } else {
                    this.$message.warning('请等待操作完成！')
                }
                return Promise.reject()
            },
            // 验证表单
            async validate() {
                return await this.$refs.BaseForm.validate()
            },
            // 提交数据
            async handleSubmit(data, isSubmit = 1) {
                // 验证表格内的表单
                let devices = null
                // 暂存不验证表单
                if (isSubmit !== 0) {
                    devices = await this.$refs.TableModule.validate()
                } else {
                    devices = this.$refs.TableModule.deviceList
                }
                var formData = {
                    ...this.formData,
                    ...data,
                    operType: this.interiorOperType
                }
                // 暂存
                if (isSubmit === 0) {
                    formData.operType = 6
                }
                if ([0, 1].includes(this.interiorOperType)) {
                    formData.createDevices = devices
                } else {
                    formData.updateDevices = devices
                }
                var res = await sendRevisedApi.update(formData)
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
                    var res = await sendRevisedApi.detail(this.dataId)
                    this.formData = {
                        ...this.formData,
                        ...res.data
                    }
                    this.loading = false
                }
            },
            // 数据更新时触发
            handleDataChange(data) {
                this.formData = {
                    ...this.formData,
                    ...data,
                    updateDevices: []
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
