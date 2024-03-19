<!--
* @description 销售合同详情
* @author yc
!-->
<template>
    <el-dialog
        :visible="visible"
        title="销售合同详情"
        width="800px"
        class="not-padding"
        append-to-body
        @close="$emit('update:visible', false)"
    >
        <div class="layout-detail-container">
            <BaseInfo
                ref="BaseInfo"
                :data-id="dataId"
                other-info
            />
        </div>
    </el-dialog>
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
            dataId: { type: [Number, String] }
        },
        data() {
            return {
                loading: false
            }
        },
        computed: {},
        watch: {},
        mounted() {},
        methods: {
        }
    }
</script>

<style lang='scss' scoped>
</style>
