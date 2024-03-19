<!--
* @description 已安装设备列表窗口
* @author yc
!-->
<template>
    <div>
        <el-dialog
            :visible="visible"
            title="安装完成设备"
            width="1000px"
            class="not-padding"
            append-to-body
            @close="$emit('update:visible', false)"
        >
            <div class="container">
                <DeviceList
                    ref="DeviceList"
                    :extend-params="extendParams"
                />
            </div>
        </el-dialog>
    </div>
</template>

<script>
    // API
    // 方法
    // 组件
    import DeviceList from '../DeviceList'

    export default {
        components: {
            DeviceList
        },
        props: {
            visible: { type: Boolean, default: false },
            extendParams: Object
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
    padding: 10px;
    height: 70vh;
}
</style>
