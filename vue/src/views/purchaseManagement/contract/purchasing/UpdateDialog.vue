<!--
* @description 更新采购清单
* @author yc
!-->
<template>
    <div>
        <el-dialog
            :visible="visible"
            :title="title"
            width="800px"
            append-to-body
            @close="$emit('update:visible', false)"
        >
            <div class="body-wrap">
                <BaseForm
                    ref="BaseForm"
                    :form-data="rowData"
                    :excludes="excludes"
                    :extend-params="extendParams"
                />
            </div>
            <span slot="footer">
                <el-button :loading="loading" size="mini" @click="$emit('update:visible', false)">取 消</el-button>
                <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit">提 交</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import BaseForm from './BaseForm'
    export default {
        components: {
            BaseForm
        },
        props: {
            visible: { type: Boolean, default: false },
            isEdit: { type: Boolean, default: false },
            rowData: { type: Object },
            excludes: { type: Array, default: () => [] },
            extendParams: { type: Object }
        },
        data() {
            return {
                loading: false
            }
        },
        computed: {
            title() {
                return this.rowData ? '编辑采购清单' : '添加采购清单'
            }
        },
        methods: {
            handleCloce() {
                this.$emit('close')
                this.$emit('update:visible', false)
            },
            handleSubmit() {
                this.$refs.BaseForm.submit((data) => {
                    this.$emit('update', data)
                    this.$emit('update:visible', false)
                })
            }
        }
    }
</script>

<style lang='scss' scoped>
.body-wrap {
    height: 450px;
}
</style>
