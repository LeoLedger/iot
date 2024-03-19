<!--
* @description  故障单管理
* @fileName index.vue
* @author 易超
!-->
<template>
    <tabs-layout :options="options" v-model="activeName" not-margin>
        <component :is="activeName" />
    </tabs-layout>
</template>
<script>
    // 组件
    import FormList from './FormList'
    import DeviceList from './DeviceList'

    export default {
        components: {
            FormList,
            DeviceList
        },
        data() {
            return {
                options: [
                    { label: '故障单', name: 'FormList' },
                    { label: '故障设备', name: 'DeviceList' }
                ],
                activeName: 'FormList'
            }
        }
    }
</script>

<style lang='scss' scoped>
.container {
    /deep/ {
        .layout-filter {
            padding: 10px 10px 0 0;
        }
        .mark-button {
            position: relative;
            overflow: initial;
            .mark {
                position: absolute;
                top: -8px;
                right: -10px;
                color: #fff;
                font-size: 12px;
                line-height: 16px;
                padding: 0 5px;
                border-radius: 8px;
                background: rgb(245,108,108);
            }
        }
    }
}
</style>
