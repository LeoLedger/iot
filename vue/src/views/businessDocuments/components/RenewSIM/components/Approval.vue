<!--
* @description SIM卡续费申请单(审批和详情)
* @author 望浩然
!-->
<template>
    <ApprovalDialog
        v-if="visible"
        :only-show="onlyShow"
        :visible="visible"
        :title="onlyShow ? '单据查看-SIM卡续费申请单' : '单据审批'"
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
                approvalType: 8
            }
        },
        watch: {
        },
        mounted() {
        },
        methods: {
            // 流程列表更新时触发
            handleProcessUpdate(list) {
                if (list.length) {
                    var identifier = []
                    this.processIndex = identifier.indexOf(list.slice(-1)[0].activityIdentifier)
                }
            },
            handleBeforeSubmit() {
              return true
            }
        }
    }
</script>

<style lang='scss' scoped>

</style>
