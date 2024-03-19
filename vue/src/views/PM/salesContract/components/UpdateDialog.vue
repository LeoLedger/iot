<!--
* @description 项目信息
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
                    :history-renew="historyRenew"
                    :permission-props="permissionProps"
                    is-edit
                    :is-import="isImport"
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
            visible: Boolean,
            isEdit: Boolean,
            dataId: { type: [Number, String] },
            historyRenew: Boolean,
            permissionProps: Array,
            isImport: Boolean
        },
        data() {
            return {
                loading: false
            }
        },
        computed: {
            title() {
                return this.dataId ? '编辑合同' : '新增合同'
            }
        },
        watch: {},
        mounted() {},
        methods: {
            // 点击提交按钮时触发
            handleSubmit() {
                this.loading = true
                this.$refs.BaseInfo.submit().then(() => {
                    this.$emit('update')
                    this.$emit('update:visible', false)
                }).catch(() => {
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
