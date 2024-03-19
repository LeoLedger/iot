<!--
* @description  寄修单管理
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
    import BillList from './BillList'
    import ClosingList from './ClosingList'

    export default {
        components: {
            BillList,
            ClosingList
        },
        data() {
            return {
                options: [
                    { label: '维修费结算', name: 'ClosingList' },
                    { label: '设备维修费清单', name: 'BillList' }
                ],
                activeName: 'ClosingList'
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
