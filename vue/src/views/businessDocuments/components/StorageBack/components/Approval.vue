<!--
* @description 入库审批(查看和审批模式)
* @author yc
!-->
<template>
    <ApprovalDialog
        v-if="visible"
        :only-show="onlyShow"
        :visible="visible"
        :title="onlyShow ? '单据查看-退库申请单' : '单据审批'"
        :before-submit="handleBeforeSubmit"
        :extend-params="extendParams"
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
                :json-data.sync="jsonData"
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
        components: {
            BaseInfo
        },
        mixins: [approvalMixin],
        data() {
            return {
                approvalType: 3
            }
        },
        methods: {
            // 流程列表更新时触发
            handleProcessUpdate(list) {
                const identifier = [
                    'ceecd135-8503-4a03-8bd9-82e97510d93e', // 开始
                    '21c71ea2-0cb7-f3b8-9a5c-91fdeca07188', // 清点
                    '6e9a79d4-9b56-6b6b-fe0b-e3d2f4462295', // 核对
                    '4cee3547-299e-48d7-87fb-4cad12b91891' // 结束环节
                ]
                if (list.length) {
                    this.processIndex = identifier.indexOf(list.slice(-1)[0].activityIdentifier)
                }
            },
            // 提交前触发
            handleBeforeSubmit(data) {
                // 清点或核对时检查
                if (data.type === 0 && (this.processIndex === 1 || this.processIndex === 2)) {
                    if (this.jsonData) {
                        // 清单列表不得为空
                        if (this.jsonData.length < 1) {
                            this.$message.warning('至少需要一条退库清单！')
                            return false
                        }
                        // 清单列表的清点退库数量等于申请退库数量
                        const countApplyIsWrong = this.jsonData.findIndex(item => { return item.countApply > 0 && item.countApply_ !== item.countApply }) > -1
                        if (countApplyIsWrong) {
                            this.$message.warning('配置的退库设备数量与申请退库数量不一致！')
                            return false
                        }
                    } else {
                        this.$message.warning('未找到退库清单数据！')
                        return false
                    }
                }
                return true
            }
        }
    }
</script>

<style lang='scss' scoped>

</style>
