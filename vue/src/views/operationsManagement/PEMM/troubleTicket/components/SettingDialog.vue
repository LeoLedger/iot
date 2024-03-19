<!--
* @description 功能设置窗口
* @author yc
!-->
<template>
    <el-dialog
        :visible="visible"
        :close-on-click-modal="false"
        title="设置"
        width="400px"
        class="not-padding"
        append-to-body
        @close="$emit('update:visible', false)"
    >
        <div v-loading="loading" class="container">
            <div>
                <!-- <el-checkbox
                    v-model="formData.isFaultReplaceAuto"
                    :true-label="1"
                    :false-label="0"
                >单据内所有设备完成替换后，自动提交单据至下一阶段。</el-checkbox> -->
                <el-checkbox
                    v-model="formData.isFaultVerifyAuto"
                    :true-label="1"
                    :false-label="0"
                >单据内所有设备检测完成后，自动提交完成单据处理。</el-checkbox>
            </div>
        </div>
        <span slot="footer">
            <el-button :loading="loading" size="mini" @click="$emit('update:visible', false)">取 消</el-button>
            <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit">保 存</el-button>
        </span>
    </el-dialog>
</template>

<script>
    // API
    import troubleTicketApi from '@/api/operationsManagement/troubleTicket'
    // 方法
    // 组件

    export default {
        name: 'SettingDialog',
        props: {
            visible: { type: Boolean, default: false }
        },
        data() {
            return {
                loading: false,
                formData: {
                    isFaultReplaceAuto: 0,
                    isFaultVerifyAuto: 0
                }
            }
        },
        mounted() {
            this.queryConfig()
        },
        methods: {
            // 获取配置信息
            async queryConfig() {
                this.loading = true
                troubleTicketApi.getConfig().then(res => {
                    this.formData = {
                        ...this.formData,
                        ...res.data
                    }
                }).finally(() => {
                    this.loading = false
                })
            },
            // 点击提交按钮时触发
            handleSubmit() {
                this.loading = true
                troubleTicketApi.setConfig(this.formData).then(res => {
                    this.$notify({
                        title: '保存成功',
                        message: res.msg,
                        type: 'success',
                        duration: 2000
                    })
                    this.$emit('update:visible', false)
                    this.$emit('update')
                }).catch(() => {
                    this.loading = false
                })
            }
        }
    }
</script>

<style lang='scss' scoped>
.container {
    display: flex;
    align-items: center;
    padding: 20px 30px;
    min-height: 120px;
    .el-checkbox {
        display: flex;
        white-space:initial;
        & + .el-checkbox {
            margin-top: 20px;
        }
        /deep/ {
            .el-checkbox__input {
                margin-top: .2em;
            }
            .el-checkbox__label {
                font-size: 15px;
                line-height: 1.4em;
            }
        }
    }
}
</style>
