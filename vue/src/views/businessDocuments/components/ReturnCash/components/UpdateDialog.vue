<!--
* @description 退还押金申请单(新建和修改模式)
* @author 望浩然
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
            <div class="layout-detail-container">
                <BaseInfo
                    ref="BaseInfo"
                    :data-id="dataId"
                    :is-update="isUpdate"
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
            dataId: { type: [Number, String], default: null },
            isUpdate: { type: Boolean, default: false },
            visible: { type: Boolean, default: false },
            extendParams: { type: Object }
        },
        data() {
            return {
                loading: false
            }
        },
        computed: {
            isCreate() {
                return !this.dataId
            },
            title() {
                if (this.dataId) {
                    return '单据编辑-退还押金申请单'
                }
                return '新建退还押金申请单'
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
</style>
