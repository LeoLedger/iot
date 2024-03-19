<!--
* @description 项目信息表单
* @author yc
!-->
<template>
    <div v-loading="loading" class="base-form">
        <FormConfig
            ref="baseForm"
            :span="12"
            :label-width="90"
            :forms="forms"
            :scroll="false"
            :disabled="!isEdit"
            :form-data="insideFormData"
            :has-default-form-class="false"
            :show-footer="false"
            is-edit
        />
        <!-- 配置同步规则 -->
        <ConfigSyncRule
            v-if="configSyncRule.visible"
            :is-edit="isEdit"
            :visible.sync="configSyncRule.visible"
            :project-id="projectId"
        />
        <!-- 配置授权IP -->
        <ConfigEmpowerIp
            v-if="configEmpowerIp.visible"
            :is-edit="isEdit"
            :visible.sync="configEmpowerIp.visible"
            :form-list="insideFormData.ipList"
            :project-id="insideFormData.guidId"
            @update="handleEmpowerIpChange"
        />
    </div>
</template>

<script>
    // API
    // 方法
    import { mapGetters } from 'vuex'
    import { isEmpty } from '@/utils'
    // 组件
    import FormConfig from '@/components/FormConfig'
    import SelectDialog from '@/components/SelectDialog/index.vue'
    import ConfigSyncRule from './ConfigSyncRule/ConfigDialog'
    import ConfigEmpowerIp from './ConfigEmpowerIp/ConfigEmpowerIp'

    export default {
        name: 'BaseForm',
        components: {
            FormConfig,
            SelectDialog,
            ConfigSyncRule,
            ConfigEmpowerIp
        },
        props: {
            isEdit: { type: Boolean, default: false },
            isCreate: { type: Boolean, default: false },
            formData: { type: Object, default: () => ({}) }
        },
        data() {
            return {
                model: {},
                forms: [
                    {
                        prop: 'projectName',
                        label: '项目名称',
                        itemType: 'input',
                        rules: [
                            { required: true, message: '请输入项目名称', trigger: 'change' }
                        ]
                        // appendRender: this.isEdit && (() => {
                        //     return (
                        //         <el-button
                        //             type='primary'
                        //             icon='el-icon-s-tools'
                        //             onClick={() => {
                        //                 this.configSyncRule.visible = true
                        //             }}
                        //         />
                        //     )
                        // })
                    },
                    {
                        prop: 'businessType',
                        type: 'businessType',
                        label: '业务类型',
                        itemType: 'dictSelect',
                        rules: [
                            { required: true, message: '请选择业务类型', trigger: 'change' }
                        ]
                    },
                    {
                        prop: '_region',
                        label: '所属区域',
                        itemType: 'regionCascader',
                        rules: [
                            { required: true, message: '请选择所属区域', trigger: 'change' }
                        ]
                    },
                    {
                        prop: 'customerName',
                        label: '源客户',
                        type: 'company',
                        itemType: 'dialogPick',
                        formKey: 'customerId',
                        extendParams: {
                            type: 0
                        },
                        rules: [
                            { required: true, message: '请选择源客户', trigger: 'change' }
                        ]
                    },
                    {
                        prop: 'projectManagerUserName',
                        label: '项目经理',
                        type: 'people',
                        itemType: 'dialogPick',
                        formKey: 'projectManagerUserId',
                        change: ([data]) => {
                            var formData = this.getFormData()
                            if (formData.saleManagerUserId === data.userId) {
                                // 如果与销售经理为同一个人，则清空选中的销售经理
                                formData.saleManagerUserId = ''
                                formData.saleManagerUserName = ''
                            }
                            data.memberName = data.userName
                            data.memberUserId = data.userId
                            data.memberType = this.getDict('peopleType').find(v => v.label === '项目经理').value
                            this.$emit('member-update', {
                                data,
                                formData,
                                replaceId: this.insideFormData.projectManagerUserId
                            })
                        }
                    },
                    {
                        prop: 'saleManagerUserName',
                        label: '销售经理',
                        type: 'people',
                        itemType: 'dialogPick',
                        formKey: 'saleManagerUserId',
                        change: ([data]) => {
                            var formData = this.getFormData()
                            if (formData.projectManagerUserId === data.userId) {
                                // 如果与项目经理为同一个人，则清空选中的项目经理
                                formData.projectManagerUserId = ''
                                formData.projectManagerUserName = ''
                            }
                            data.memberName = data.userName
                            data.memberUserId = data.userId
                            data.memberType = this.getDict('peopleType').find(v => v.label === '销售经理').value
                            this.$emit('member-update', {
                                data,
                                formData,
                                replaceId: this.insideFormData.saleManagerUserId
                            })
                        }
                    },
                    {
                        prop: '_period',
                        label: '项目周期',
                        itemType: 'daterange',
                        rules: [
                            { required: true, message: '请选择项目周期', trigger: 'blur' }
                        ]
                    },
                    {
                        prop: 'empowerIp',
                        label: '授权IP',
                        itemType: 'input',
                        disabled: true,
                        isCopy: false,
                        isClick: !this.isEdit,
                        onClick: () => {
                            this.configEmpowerIp.visible = true
                        },
                        appendRender: this.isEdit && (() => {
                            return (
                                <el-button
                                    type='primary'
                                    icon='el-icon-s-tools'
                                    onClick={() => {
                                        this.configEmpowerIp.visible = true
                                    }}
                                />
                            )
                        })
                    },
                    {
                        prop: 'costCenterId',
                        type: 'costCenter',
                        label: '成本中心',
                        itemType: 'dictSelect',
                        disabled: !this.isCreate,
                        rules: [
                            { required: true, message: '请选择成本中心', trigger: 'blur' }
                        ]
                    },
                    {
                      prop: 'qqProjectCode',
                      label: '企企项目编号',
                      itemType: 'input'
                    },
                    {
                        prop: 'projectSummary',
                        label: '项目简介',
                        itemType: 'textarea',
                        numLimit: 100,
                        placeholder: '请填写项目简介, 不超过100字',
                        span: 24
                    },
                    {
                        prop: 'remark',
                        label: '备注',
                        itemType: 'textarea',
                        numLimit: 100,
                        placeholder: '请填写备注, 不超过100字',
                        span: 24
                    }
                ],
                loading: false,
                configSyncRule: {
                    visible: false
                },
                configEmpowerIp: {
                    visible: false
                }
            }
        },
        computed: {
            ...mapGetters(['userInfo']),
            insideFormData() {
                return {
                    costCenterId: this.userInfo.costCenterId,
                    ...this.formData,
                    ...this.model
                }
            }
        },
        watch: {
        },
        mounted() {
            if (this.isCreate) {
                this.forms.find(v => v.prop === 'costCenterId').disabled = !isEmpty(this.userInfo.costCenterId)
            }
        },
        methods: {
            // 提交表单
            submit(callback, errorCallback) {
                this.$refs.baseForm.submitHandler((data) => {
                    var [provinceId, cityId, areaId] = data._region || []
                    var [startDate, endDate] = data._period || []
                    data = {
                        ...this.insideFormData,
                        ...data,
                        areaId,
                        cityId,
                        provinceId,
                        startDate,
                        endDate
                    }
                    callback && callback(data)
                    this.$emit('submit', data)
                }, (err, data) => {
                    errorCallback && errorCallback(err, data)
                    this.$message.warning(Object.values(err)[0][0].message)
                })
            },
            // 获取当前已输入的formdata
            getFormData() {
                if (this.$refs.baseForm) {
                    return this.$refs.baseForm.params
                }
            },
            // 设置form配置
            setFormConfigProp(key, prop, value) {
                this.$set(this.forms.find(item => item.prop === key), prop, value)
            },
            // 授权ip改变时触发
            handleEmpowerIpChange(list) {
                this.model = {
                    ...this.model,
                    ipList: list,
                    empowerIp: list.length
                }
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
