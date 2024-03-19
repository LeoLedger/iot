<!--
* @description  续费统计
* @fileName index.vue
* @author 易超
!-->
<template>
    <tabs-layout :options="options" v-model="activeName">
        <component :is="activeName"/>
    </tabs-layout>
</template>
<script>
    // 组件
    import All from './components/All'
    import SIM from './components/SIM'
    import ExtendEarranty from './components/ExtendEarranty'

    export default {
        components: {
            All,
            SIM,
            ExtendEarranty
        },
        data() {
            return {
                options: [
                    { label: '汇总', name: 'All' },
                    { label: 'SIM卡', name: 'SIM' },
                    { label: '设备延保', name: 'ExtendEarranty' }
                ],
                activeName: 'All'
            }
        }
    }
</script>

<style lang='scss' scoped>

</style>
