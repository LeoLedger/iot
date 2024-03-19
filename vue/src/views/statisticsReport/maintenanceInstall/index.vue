<!--
* @description  维修/安装费用
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
    import Express from './components/Express'
    import Maintenance from './components/Maintenance'
    import Install from './components/Install'

    export default {
        components: {
            All,
            Express,
            Maintenance,
            Install
        },
        data() {
            return {
                options: [
                    { label: '汇总', name: 'All' },
                    { label: '寄修费', name: 'Express' },
                    { label: '维修费', name: 'Maintenance' },
                    { label: '安装费', name: 'Install' }
                ],
                activeName: 'All'
            }
        }
    }
</script>

<style lang='scss' scoped>

</style>
