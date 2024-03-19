<!--
* @description  安装费结算
* @fileName index.vue
* @author 易超
!-->
<template>
    <tabs-layout :options="options" v-model="activeName">
        <component :is="activeName" />
    </tabs-layout>
</template>
<script>
    // 组件
    import DeviceList from './DeviceList'
    import ClosingList from './ClosingList'

    export default {
        components: {
            DeviceList,
            ClosingList
        },
        data() {
            return {
                options: [
                    { label: '安装费结算', name: 'ClosingList' },
                    { label: '安装设备清单', name: 'DeviceList' }
                ],
                activeName: 'ClosingList'
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
