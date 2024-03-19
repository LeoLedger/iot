<!--
* @description
* @author 姜庆博
!-->
<template>
    <!-- 列表添加/编辑 -->
    <DialogForm ref="addDialogForm"
                v-bind="dialogOption"
                :submit="formDialogSubmit"
                :formData="formData"
                :formDialogVisible="visible"
                @changeDialog="changeDialog"
    />
</template>

<script>
    import {
        changeServicePackage, // 新增或者编辑客户信息
    } from "@/api/clientMn";
    import DialogForm from "@/components/DialogForm"

    export default {
        name: 'PackageDialog',
        components: {
            DialogForm,
        },
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            formData: {
                type: Object,
                default: () => {
                    return {}
                }
            }
        },
        data() {
            const {formData} = this.$props;
            const title = (Object.keys(formData).length ? '编辑' : '添加') + '服务套餐';
            return {
                dialogOption: {
                    title,
                    width: '500px',
                    formOptions: {
                        loading: false,
                        submitBtnText: '提交',
                        showCancelBtn: true,
                        labelWidth: 150,
                        span: 24,
                        forms: [
                            {
                                prop: 'name',
                                label: '套餐名称',
                            }, {
                                prop: 'userCount',
                                label: '用户数量（人）',
                                itemType: 'inputNumber',
                                unPrecision: true,
                            }, {
                                prop: 'smsCount',
                                label: '短信数量（条）',
                                itemType: 'inputNumber',
                                unPrecision: true,
                            }, {
                                prop: 'storageSize',
                                label: '存储空间（GB）',
                                itemType: 'inputNumber',
                            }, {
                                prop: 'remarks',
                                label: '备注说明',
                                itemType: 'textarea',
                                autosize: {minRows: 3, maxRows: 6},
                            }, {
                                prop: 'referenceAmount',
                                label: '年服务费参考金额（元）',
                                itemType: 'inputNumber',
                            },
                        ],
                    },
                },
            }
        },
        methods: {
            changeDialog(bool) {
                this.$emit("update:visible", bool)
            },
            // 表单弹窗 提交 (包含 编辑 和 新增)
            formDialogSubmit(params) {
                const submitParams = {
                    ...this.formData,
                    ...params
                }
                // console.log(JSON.stringify(submitParams), 'submitParams  ')
                this.$set(this.dialogOption.formOptions, 'loading', true);
                changeServicePackage(submitParams).then(res => {
                    const {data, success, message} = res.data;
                    if (success) {
                        this.$message.success('请求处理成功');
                        this.changeDialog(false); // 关闭按钮
                        this.$emit('packageSubmitCallBack')
                    } else {
                        this.$message.error(message);
                    }
                    this.$set(this.dialogOption.formOptions, 'loading', false);
                });
            },
        }
    }
</script>

<style lang='scss' scoped>
</style>
