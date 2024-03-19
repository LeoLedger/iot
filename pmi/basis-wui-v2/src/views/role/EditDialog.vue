<template>
    <!-- 数据字典详情 新增 / 编辑 RenewalDialog -->
    <DialogForm
        v-bind="dialogOption"
        :submit="formDialogSubmit"
        :form-data="formData"
        :form-dialog-visible="visible"
        @changeDialog="changeDialog"
    />
</template>

<script>
    import DialogForm from '@/components/DialogForm'
    import { basicForms } from './Config'
    import { saveOrUpdate } from '@/api/role'
    import { getMapTree } from '@/api/map'
    import { getCode } from '@/api/resource'

    export default {
        name: 'EditBasicInfoDialog',
        components: {
            DialogForm
        },
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            isEdit: {
                type: Boolean,
                default: false
            },
            formData: {
                type: Object,
                default: () => {
                    return {}
                }
            },
            forms: { // 若有特殊的配置 请在父级props上传递
                type: Array
            },
            treeData: {
                type: Array,
                default: () => []
            }
        },
        data() {
            const { formData, isEdit, forms } = this.$props
            const title = isEdit && '编辑角色' || '添加角色'
            return {
                // 配置弹窗
                dialogOption: {
                    title,
                    width: '800px',
                    formOptions: {
                        loading: false,
                        submitBtnText: '提交',
                        showCancelBtn: true,
                        labelWidth: 80,
                        span: 12,
                        forms: basicForms
                    }
                },
                mapTreeData: null
            }
        },
        watch: {
            treeData: {
                immediate: true,
                handler(newData) {
                    this.$set(this.dialogOption.formOptions.forms[3], 'options', newData)
                }
            },
            isEdit: {
                immediate: true,
                handler(newData) {
                    /* console.log(newData, 'isEdit')
          if(newData) { // 在编辑 状态: 不许更改上级分类
              this.$set(this.dialogOption.formOptions.forms[2], 'isEdit', false);
          } else {
              this.$set(this.dialogOption.formOptions.forms[2], 'isEdit', true);
          } */
                }
            }
            // formData: {
            //     immediate: true,
            //     handler(newData) {
            //
            //     }
            // }
        },
        created() {
            this.getMapTree()
            this.$set(this.dialogOption.formOptions.forms[1], 'blur', (value, params) => {
                if (value != undefined) {
                    getCode({ name: value }).then(res => {
                        if (res.data.success) {
                            params.roleCode = res.data.data
                        }
                    })
                }
            })
        },
        methods: {
            changeDialog(bool) {
                this.$emit('update:visible', bool)
            },
            async getMapTree() {
                let data = null
                await getMapTree({}).then(res => {
                    this.mapTreeData = res.data.data
                    data = res.data.data
                    this.$set(this.dialogOption.formOptions.forms[4], 'options', data)
                })
                return data || []
            },
            // 表单弹窗 提交
            formDialogSubmit(params) {
                const submitParams = { ...this.formData, ...params }
                this.$set(this.dialogOption.formOptions, 'loading', true)// 更改提交按钮的状态值

                saveOrUpdate(submitParams).then((res) => {
                    this.$set(this.dialogOption.formOptions, 'loading', false) // 更改提交按钮的状态值
                    const { success, msg } = res.data
                    if (success) {
                        this.$message.success('请求处理成功')
                        this.changeDialog(false) // 关闭按钮
                        this.$emit('editSubmitCallBack') // 触发操作成功的回调
                    } else {
                        this.$message.error(msg)
                    }
                })
            }

        }
    }
</script>

<style lang='scss' scoped>

</style>
