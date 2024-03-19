<!--
* @description 更新产品及服务内容
* @author yc
!-->
<template>
    <div>
        <el-dialog
            :visible="visible"
            :title="title"
            :before-close="handleDialogClose"
            :close-on-click-modal="!isEdit"
            width="720px"
            class="not-padding"
            append-to-body
        >
            <div v-loading="loading" class="form-info">
                <BuyInForm
                    v-if="type === 2"
                    ref="BuyInForm"
                    :is-edit="isEdit"
                    :is-create="isCreate"
                    :form-data="formData"
                    :extend-params="extendParams"
                />
                <RenewForm
                    v-else-if="type === 3"
                    ref="RenewForm"
                    :is-edit="isEdit"
                    :is-create="isCreate"
                    :form-data="formData"
                    :extend-params="extendParams"
                />
                <DefaultForm
                    v-else
                    ref="DefaultForm"
                    :is-edit="isEdit"
                    :is-create="isCreate"
                    :excludes="excludes"
                    :form-data="formData"
                    :sales-type="salesType"
                    :extend-params="extendParams"
                />
            </div>
            <span v-if="isEdit" slot="footer">
                <el-button :loading="loading" size="mini" @click="$emit('update:visible', false)">取 消</el-button>
                <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit">保 存</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    // API
    // 方法
    // 组件
    import BuyInForm from './BuyInForm'
    import RenewForm from './RenewForm'
    import DefaultForm from './DefaultForm'

    export default {
        name: 'Update',
        components: {
            BuyInForm,
            RenewForm,
            DefaultForm
        },
        props: {
            type: { type: [Number, String], default: 1 },
            isEdit: { type: Boolean, default: false },
            isCreate: { type: Boolean, default: false },
            visible: { type: Boolean, default: false },
            formData: { type: Object },
            excludes: Array,
            salesType: { type: Number, default: 0 },
            extendParams: { type: Object }
        },
        data() {
            return {
                loading: false
            }
        },
        computed: {
            title() {
                var title = ''
                if (this.type === 3) {
                    title = this.isEdit ? '配置续费内容' : '查看续费内容'
                } else if (this.type === 2) {
                    title = this.isEdit ? '配置补购内容' : '查看补购内容'
                } else {
                    title = (this.isEdit ? (this.formData ? '编辑' : '添加') : '查看') + '产品及服务内容'
                }
                return title
            }
        },
        watch: {
        },
        mounted() {
        },
        methods: {
            // 点击提交按钮时触发
            handleSubmit() {
                var ref
                switch (this.type) {
                case 2:
                    // 补购
                    ref = this.$refs.BuyInForm
                    break
                case 3:
                    // 续费
                    ref = this.$refs.RenewForm
                    break
                default:
                    ref = this.$refs.DefaultForm
                    break
                }
                ref.submit((data) => {
                    this.$emit('update', data)
                    this.$emit('update:visible', false)
                })
            },
            // 弹窗关闭时触发
            handleDialogClose() {
                if (this.isEdit) {
                    this.$confirm('确认放弃本次操作？').then(_ => {
                        this.$emit('update:visible', false)
                    }).catch(_ => {
                        return false
                    })
                } else {
                    this.$emit('update:visible', false)
                }
            }
        }
    }
</script>

<style lang='scss' scoped>
.form-info {
    padding: 16px 26px;
}
</style>
