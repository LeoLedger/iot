<!--
* @description 故障单信息
* @author yc
!-->
<template>
    <div>
        <el-dialog
            :visible="visible"
            :title="title"
            :before-close="handleDialogClose"
            :close-on-click-modal="false"
            width="1300px"
            class="not-padding"
            append-to-body
            @close="$emit('update:visible', false)"
        >
            <div v-loading="loading" class="container">
                <BaseInfo
                    ref="BaseInfo"
                    :data-id="dataId"
                    :is-edit="isEdit"
                    :oper-type="operType"
                />
            </div>
            <span v-if="isEdit" slot="footer">
                <el-button :loading="loading" size="mini" @click="$emit('update:visible', false)">取 消</el-button>
                <template v-if="[0,1].includes(operType)">
                    <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit()">保 存</el-button>
                </template>
                <template v-else-if="operType === 3">
                    <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit()">提交处理结果</el-button>
                </template>
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
            rowData: { type: Object },
            operType: { type: Number, default: 0 }
        },
        data() {
            return {
                loading: false
            }
        },
        computed: {
            title() {
                if (this.isEdit) {
                    switch (this.operType) {
                    case 0:
                        return '登记故障单'
                    case 1:
                        return '编辑故障单'
                    case 3:
                        return '故障单处理'
                    }
                }
                return '故障单详情'
            }
        },
        watch: {
        },
        mounted() {
        },
        methods: {
            // 点击提交按钮时触发
            handleSubmit(isTemp) {
                this.loading = true
                this.$refs.BaseInfo.submit(isTemp).then(() => {
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
.container {
    height: 80vh;
    padding: 10px;
    box-sizing: border-box;
}
</style>
