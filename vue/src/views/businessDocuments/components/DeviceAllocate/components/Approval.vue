<!--
* @description 审批窗口
* @author yc
!-->
<template>
    <ApprovalDialog
        v-if="visible"
        :only-show="onlyShow"
        :visible="visible"
        :title="onlyShow ? '单据查看-设备调拨申请单' : '单据审批'"
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
                approvalType: 9
            }
        },
        methods: {
            handleBeforeSubmit(data) {
                if (this.processIndex === 2 && data.type === 0) {
                    let dataList = this.$refs.BaseInfo.dataList
                    if (dataList.findIndex(v => v.transferCount > 0) === -1) {
                        this.$message.warning('请至少配置一台调拨设备！')
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
