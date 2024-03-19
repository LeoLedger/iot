<template>
    <!--
        申明：  弹窗的展示 formDialogVisible 在父级定义
                弹窗的展示和隐藏 调用 @changeDialog='changeDialog' // 传参true/false 作为显示隐藏
                测试用例见： testForm的操作
     -->
    <el-dialog class="formDialog"
               :title="title"
               :visible="formDialogVisible"
               :close-on-click-modal="false"
               :width="width"
               @close="closeDialog">
            <FormConfig
            v-if="formDialogVisible"
            ref="configForm"
            :forms="formOptions.forms"
            :formData="formData || formOptions.formData"
            :size="formOptions.size"

            :label-width="formOptions.labelWidth"
            :item-width="formOptions.itemWidth"
            :span="formOptions.span"
            :xs="formOptions.xs"
            :submit="submit"
            :cancel="closeDialog"
            :submitLoading="formOptions.loading"
            :showResetBtn="formOptions.showResetBtn"
            :showCancelBtn="formOptions.showCancelBtn"
            :submitBtnText="formOptions.submitBtnText"
            :resetBtnText="formOptions.resetBtnText"
        />
    </el-dialog>
</template>

<script>
    import FormConfig from './FormConfig'

    export default {
        name: 'DialogForm',
        components: {
            FormConfig
        },
        props: {
            title: {
                type: String,
                default: '请输入 title 标题'
            },
            formOptions: {
                type: Object,
                default: () => {
                },
                required: true
            },
            formData: Object,
            submit: {
                type: Function,
                default: function () {
                }
            },
            formDialogVisible: {
                type: Boolean,
                required: true
            },
            width: {
              type: String
            },
        },
        data() {
            return {
            }
        },
        computed: {
        },
        created() {
            // console.log(this.$props, this.attrs, 'test..............')
        },
        mounted() {
        },
        methods: {
            closeDialog() {
                this.$emit('changeDialog', false)
            }
        }
    }

</script>

<style scoped lang="scss">
    .formDialog /deep/ {
        .el-dialog__body {
            height: auto;
            padding-bottom: 10px;
        }
    }
</style>
