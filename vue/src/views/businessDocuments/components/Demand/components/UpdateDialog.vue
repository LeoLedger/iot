<!--
* @description 需求申请单
* @author yc
!-->
<template>
    <div>
        <el-dialog
            :visible="visible"
            :title="title"
            :before-close="handleDialogClose"
            :close-on-click-modal="false"
            width="800px"
            class="not-padding"
            append-to-body
        >
            <div v-loading="loading" class="layout-detail-container">
                <BaseInfo
                    ref="BaseInfo"
                    :data-id="dataId"
                    :is-edit="isEdit"
                    :other-info="otherInfo"
                />
            </div>
            <span v-if="isEdit" slot="footer">
                <el-button :loading="loading" size="mini" @click="$emit('update:visible', false)">取 消</el-button>
                <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit">提 交</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    // API
    // 方法
    // 组件
    import BaseInfo from './BaseInfo'

    export default {
        name: 'UpdateDialog',
        components: {
            BaseInfo
        },
        props: {
            dataId: { type: [Number, String] },
            visible: { type: Boolean, default: false },
            isEdit: { type: Boolean, default: false },
            otherInfo: { type: Boolean, default: false }
        },
        data() {
            return {
                loading: false
            }
        },
        computed: {
            title() {
                if (this.dataId) {
                    return this.isEdit ? '单据编辑-需求申请单' : '单据查看-需求申请单'
                }
                return '添加需求申请单'
            }
        },
        watch: {
        },
        mounted() {
        },
        methods: {
            // 点击提交按钮时触发
            handleSubmit() {
                this.loading = true
                this.$refs.BaseInfo.submit(() => {
                    this.$emit('update')
                    this.$emit('update:visible', false)
                }, () => {
                    this.loading = false
                })
            },
            // 弹窗关闭时触发
            handleDialogClose() {
                this.$confirm('确认放弃本次操作？').then(_ => {
                    this.$emit('update:visible', false)
                }).catch(_ => {
                    return false
                })
            }
        }
    }
</script>

<style lang='scss' scoped>
.layout-detail-container {
    height: 50vh;
}
</style>
