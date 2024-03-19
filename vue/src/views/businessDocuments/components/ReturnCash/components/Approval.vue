<!--
* @description 退还押金(查看和审批模式)
* @author yc
!-->
<template>
    <ApprovalDialog
        v-if="visible"
        :only-show="onlyShow"
        :visible="visible"
        :title="onlyShow ? '单据查看-退还押金申请单' : '单据审批'"
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
    // 组件
    import BaseInfo from './BaseInfo'
    import approvalMixin from '@/views/businessDocuments/components/approvalMixin'

    export default {
        name: 'Approval',
        components: {
            BaseInfo
        },
        mixins: [approvalMixin],
        data() {
            return {
                approvalType: 5
            }
        },
        watch: {
        },
        mounted() {
        },
        methods: {
          // 流程列表更新时触发
          handleProcessUpdate(list) {
            const identifier = [
              'a7791713-d4b7-4591-bc8b-3005d1a5f38f', // 开始
              '56184925-5808-1125-4810-62e415dda6db', // 清点
              'ff4f8e24-3d6e-4dfc-abd2-8553641aa0c7', // 核对
              '091ff72e-0513-4368-9037-07efc1a1de7f' // 结束环节
            ]
            if (list.length) {
              this.processIndex = identifier.indexOf(list.slice(-1)[0].activityIdentifier)
            }
          }
        }
    }
</script>

<style lang='scss' scoped>

</style>
