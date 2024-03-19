<!--
* @description 更新弹窗
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
                    <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit">保 存</el-button>
                </template>
                <template v-else-if="operType === 2">
                    <el-button v-prereclick :loading="loading" type="success" size="mini" @click="handleSubmit(0)">暂 存</el-button>
                    <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit">提 交</el-button>
                </template>
                <template v-else-if="operType === 3">
                    <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit">确认分配</el-button>
                </template>
                <template v-else-if="operType === 4">
                    <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit">确认完成</el-button>
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
            visible: { type: Boolean, default: false },
            dataId: { type: [Number, String] },
            isEdit: { type: Boolean, default: false },
            rowData: { type: Object },
            operType: { type: Number }
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
                    case 0: return '创建寄修单'
                    case 1: return '编辑寄修单'
                    case 2: return '寄修单-维修反馈'
                    case 3: return '寄修单-分配核验'
                    case 4: return '寄修单-核验确认'
                    }
                }
                return '寄修单详情'
            }
        },
        mounted() {
        },
        methods: {
            // 点击提交按钮时触发 isSubmit: 是否暂存，而不直接提交 0是1否
            handleSubmit(isSubmit = 1) {
                this.loading = true
                this.$refs.BaseInfo.submit(isSubmit).then(() => {
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
