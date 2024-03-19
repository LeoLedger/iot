<template>
    <div class="base-form">
        <FormConfig
            ref="baseForm"
            :span="12"
            :label-width="100"
            :forms="forms"
            :scroll="false"
            :disabled="disabled"
            :form-data="formData_"
            :has-default-form-class="false"
            :show-footer="false"
            :is-edit="isEdit"
        />
    </div>
</template>

<script>
    import FormConfig from '@/components/FormConfig'
    import enums from '@/utils/enum'
    export default {
        components: {
            FormConfig
        },
        props: {
            isEdit: {
                type: Boolean,
                default: true
            },
            disabled: {
                type: Boolean,
                default: false
            },
            isCreate: {
                type: Boolean,
                default: false
            },
            extendParams: {
                type: Object,
                default: () => {}
            },
            excludes: {
                type: Array,
                default: () => []
            }
        },
        data() {
            return {
                formData_: {
                    memberUserId: '',
                    sectionId: null,
                    memberType: null,
                    name: '',
                    phone: '',
                    email: '',
                    deptId: ''
                },
                forms: [
                    {
                        prop: 'name',
                        label: '标段成员',
                        type: 'contacts',
                        itemType: 'dialogPick',
                        formKey: 'memberUserId',
                        rules: [
                            { required: true, message: '请选择标段成员', trigger: 'blur' }
                        ],
                        change: ($event) => this.handleMember($event),
                        span: 23,
                        extendParams: this.extendParams,
                        excludes: this.excludes
                    },
                    {
                        prop: 'memberType',
                        label: '成员类型',
                        type: 'peopleTypeSection',
                        itemType: 'dictSelect',
                        rules: [
                            { required: true, message: '请选择成员类型', trigger: 'blur' }
                        ],
                        span: 23
                    }
                ],
                memberForm: {}
            }
        },
        methods: {
            // 提交表单
            submit(callback, errorCallback) {
                this.$refs.baseForm.submitHandler((data) => {
                    data = {
                        ...this.formData_,
                        ...this.memberForm,
                        ...data
                    }
                    callback && callback(data)
                    this.$emit('submit', data)
                }, (err, data) => {
                    errorCallback && errorCallback(err, data)
                    this.$message.warning(Object.values(err)[0][0].message)
                })
            },
            handleMember(list) {
                if (list && list[0]) {
                    this.memberForm.name = list[0].name
                    this.memberForm.phone = list[0].phone
                    this.memberForm.email = list[0].email
                }
            }
        }
    }
</script>

<style scoped>

</style>
