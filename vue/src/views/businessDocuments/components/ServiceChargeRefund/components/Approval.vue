<!--
* @description 审批窗口
* @author yc
!-->
<template>
    <ApprovalDialog
        v-if="visible"
        :only-show="onlyShow"
        :visible="visible"
        :title="onlyShow ? '单据查看-服务费退款申请单' : '单据审批'"
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
        name: 'Approval',
        components: {
            BaseInfo
        },
        mixins: [approvalMixin],
        data() {
            return {
                approvalType: 6
            }
        },
        methods: {
        }
    }
</script>

<style lang='scss' scoped>

</style>
