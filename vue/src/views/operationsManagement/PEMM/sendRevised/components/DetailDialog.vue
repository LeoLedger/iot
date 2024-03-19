<!--
* @description 寄修单详情
* @author yc
!-->
<template>
    <div>
        <el-dialog
            :visible="visible"
            title="寄修单详情"
            width="1300px"
            class="not-padding"
            append-to-body
            @close="$emit('update:visible', false)"
        >
            <div class="container">
                <BaseInfo
                    ref="BaseInfo"
                    :data-id="dataId"
                />
            </div>
        </el-dialog>
    </div>
</template>

<script>
    // API
    // 方法
    // 组件
    import BaseInfo from './BaseInfo'

    export default {
        name: 'DetailDialog',
        components: {
            BaseInfo
        },
        props: {
            visible: { type: Boolean, default: false },
            dataId: { type: [Number, String] },
            rowData: { type: Object }
        },
        data() {
            return {
            }
        },
        computed: {
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
.container {
    height: 80vh;
    padding: 10px;
    box-sizing: border-box;
}
</style>
