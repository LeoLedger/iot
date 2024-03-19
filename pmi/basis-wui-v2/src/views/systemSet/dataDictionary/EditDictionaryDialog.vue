<!--
* @description
* @fileName list.vue
* @author 姜庆博
* @date 2019/06/11 19:39:44
* @version V1.0.0
!-->
<template>
    <!-- 数据字典详情 新增 / 编辑 RenewalDialog -->
    <DialogForm
            v-bind="dialogOption"
            :submit="formDialogSubmit"
            :formData="formData"
            :formDialogVisible="visible"
            @changeDialog="changeDialog"
    />
</template>

<script>
    import DialogForm from "@/components/DialogForm"
    import {
        editDictionaryItem, // 新增或者编辑合同信息
    } from "@/api/resource";

    export default {
        name: 'EditDictionaryDialog',
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
            namespaceOptions: {
                type: Array,
                default: () => []
            }
        },
        data() {
            const {formData, namespaceOptions, isEdit} = this.$props;
            // console.error(formData, 'formData    selectedTenant')
            // const isDisableName = formData.c_name && true || false;
            const forms = [ {
                    prop: 'c_namespace_id',
                    label: '所属类型',
                    itemType: 'select',
                    disabled: true,
                    options: namespaceOptions,
                }, {
                    prop: 'c_name',
                    label: '选项名称',
                    // disabled: isDisableName,
                }, {
                    prop: 'c_desc',
                    label: '备注',
                    itemType: 'textarea',
                    autosize: {minRows: 3, maxRows: 6},
                    span: 24,
                },
            ],
                title = isEdit && '编辑选项' || '添加选项';
            return {
                // 配置弹窗
                dialogOption: {
                    title,
                    width: '500px',
                    formOptions: {
                        loading: false,
                        submitBtnText: '提交',
                        showCancelBtn: true,
                        labelWidth: 80,
                        // span: 24,
                        forms
                    },
                },
            }
        },
        watch: {
        },
        methods: {
            changeDialog(bool) {
                // console.log(bool, 'changeDialog 操作弹窗的 展示 和 隐藏');
                this.$emit("update:visible", bool)
            },
            // 表单弹窗 提交
            formDialogSubmit(params) {
                // console.log('test formDialogSubmit submit', params); // 具体操作  请添加...
                this.$set(this.dialogOption.formOptions, 'loading', true); // 更改提交按钮的状态值
                const submitParams = {...this.formData , ...params}
                // console.log(JSON.stringify(submitParams), 'submitParams')
                editDictionaryItem(submitParams).then((res) => {
                    this.$set(this.dialogOption.formOptions, 'loading', false); // 更改提交按钮的状态值
                    const {success, message} = res.data;
                    if (success) {
                        this.$message.success('请求处理成功');
                        this.changeDialog(false); // 关闭按钮
                        this.$emit('editSubmitCallBack'); // 触发操作成功的回调
                    } else {
                        this.$message.error(message);
                    }
                })
            },

        }
    }
</script>

<style lang='scss' scoped>

</style>
