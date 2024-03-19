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
        editSysClass, // 编辑 / 新增
    } from "@/api/systemSet/SysClass";
    import {basicForms, PARENT_ID} from './basicInfoConfig'

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
                type: Array,
            },
            treeData: {
                type: Array,
                default: () => []
            },
        },
        data() {
            const {formData, isEdit, forms} = this.$props;
            // console.error(formData, 'formData    selectedTenant')
            const title = isEdit && '编辑分类' || '添加分类';
            return {
                // 配置弹窗
                dialogOption: {
                    title,
                    width: '600px',
                    formOptions: {
                        loading: false,
                        submitBtnText: '提交',
                        showCancelBtn: true,
                        labelWidth: 80,
                        span: 12,
                        forms: basicForms
                        // forms: forms || basicForms
                    },
                },
            }
        },
        watch: {
            treeData:{
                immediate: true,
                handler(newData) {
                    this.$set(this.dialogOption.formOptions.forms[2], 'options', newData)
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
            },
            formData: {
                immediate: true,
                handler(newData) {
                    // console.log(JSON.stringify(newData), 'newData.parentIdStr.........')
                }
            },
        },
        created() {
        },
        methods: {
            changeDialog(bool) {
                // console.log(bool, 'changeDialog 操作弹窗的 展示 和 隐藏');
                this.$emit("update:visible", bool)
            },
            // 表单弹窗 提交
            formDialogSubmit(params) {
                const submitParams = {...this.formData , ...params, typeEnum: 2}
                // console.log(JSON.stringify(submitParams), 'submitParams')
                submitParams.parentId = params.parentIdStr.slice(-1)[0] || PARENT_ID; // 若没有父级id 传递PARENT_ID添加 平级
                console.log(submitParams, 'submitParams')
                if (params.parentIdStr.includes(submitParams.id)) {
                    this.$message.error('修改的上级分类不可以是自己本身 或 本身的子级')
                    return
                }
                this.$set(this.dialogOption.formOptions, 'loading', true) // 更改提交按钮的状态值
                console.log(submitParams, 'submitParams')
                editSysClass(submitParams).then((res) => {
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
