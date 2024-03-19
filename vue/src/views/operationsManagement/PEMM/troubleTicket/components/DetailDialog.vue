<!--
* @description 故障单详情
* @author yc
!-->
<template>
    <div>
        <el-dialog
            :visible="visible"
            :close-on-click-modal="false"
            title="故障单详情"
            width="1300px"
            class="not-padding"
            append-to-body
            @close="$emit('update:visible', false)"
        >
            <div class="container">
                <BaseInfo
                    ref="BaseInfo"
                    :data-id="dataId"
                    :oper-type="_operType"
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
            dataId: { type: [Number, String] },
            visible: { type: Boolean, default: false },
            rowData: { type: Object },
            operType: { type: Number, default: 0 }
        },
        data() {
            return {
            }
        },
        computed: {
            _operType() {
                if (this.rowData) {
                    switch (this.rowData.status) {
                    case 0: return 1
                    default: return 3
                    }
                }
                return this.operType
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
.container {
    height: 80vh;
    padding: 10px;
    box-sizing: border-box;
}
</style>
