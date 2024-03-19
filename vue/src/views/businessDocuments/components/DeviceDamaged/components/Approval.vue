<!--
* @description 设备报损(查看和审批模式)
* @author 望浩然
!-->
<template>
    <ApprovalDialog
        v-if="visible"
        :only-show="onlyShow"
        :visible="visible"
        :title="onlyShow ? '单据查看-设备报损申请单' : '单据审批'"
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
        props: {
            dataId: { type: String },
            rowData: { type: Object },
            visible: { type: Boolean, default: false },
            onlyShow: { type: Boolean, default: false }
        },
        data() {
            return {
                approvalType: 10
            }
        },
        watch: {
        },
        mounted() {
        },
        methods: {
        }
    }
</script>

<style lang='scss' scoped>

</style>
