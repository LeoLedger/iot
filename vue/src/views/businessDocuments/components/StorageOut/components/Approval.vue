<!--
* @description 需求审批
* @author yc
!-->
<template>
    <ApprovalDialog
        v-if="visible"
        :only-show="onlyShow"
        :visible="visible"
        :title="onlyShow ? '单据查看-出库申请单' : '单据审批'"
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
                :row-data="rowData"
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
                approvalType: 2
            }
        },
        methods: {
            // 提交前触发
            handleBeforeSubmit(data) {
                return this.$refs.BaseInfo.$refs.BaseForm.validate().then(resolve => {
                    switch (this.processIndex) {
                    case 4:
                        if (data.type === 0) {
                            if (this.jsonData.products.length && this.jsonData.products.findIndex(item => item.countConf) > -1) {
                                if (this.jsonData.products.findIndex(item => item.countConf !== item.countApply) > -1) {
                                    this.$message.warning('配置出库数量不能小于申请出库数量！')
                                    throw false
                                }
                            } else {
                                this.$message.warning('请至少配置一台出库设备！')
                                throw false
                            }
                            return this.$refs.BaseInfo.$refs.ElectronicSignature.submit()
                        }
                        break
                    }
                    return true
                })
            }
        }
    }
</script>

<style lang='scss' scoped>

</style>
