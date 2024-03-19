<!--
* @description 审批窗口
* @author yc
!-->
<template>
    <ApprovalDialog
        v-if="visible"
        :only-show="onlyShow"
        :visible="visible"
        :title="onlyShow ? '单据查看-库存盘点申请单' : '单据审批'"
        :extend-params="extendParams"
        :before-submit="handleBeforeSubmit"
        @update="$emit('update')"
        @update:visible="$emit('update:visible', $event)"
        @process-update="handleProcessUpdate"
    >
        <template slot="info">
            <BaseInfo
                ref="BaseInfo"
                :data-id="dataId"
                :is-approval="!onlyShow"
                :process-index="processIndex"
                @data-update="handleBaseUpdate"
            />
        </template>
    </ApprovalDialog>
</template>

<script>
    // API
    // 方法
    import approvalMixin from '../../approvalMixin'
    // 组件
    import BaseInfo from './BaseInfo'

    export default {
        name: 'Approval',
        components: {
            BaseInfo
        },
        mixins: [approvalMixin],
        data() {
            return {
                approvalType: 13
            }
        },
        methods: {
            // 提交前触发
            handleBeforeSubmit(data) {
                if (this.processIndex === 2 && data.type === 0) {
                    return new Promise((resolve, reject) => {
                        this.$refs.BaseInfo.validate().then(() => {
                            this.jsonData = this.$refs.BaseInfo.formData
                            resolve()
                        }).catch(reject)
                    })
                }
                return true
            }
        }
    }
</script>

<style lang='scss' scoped>

</style>
