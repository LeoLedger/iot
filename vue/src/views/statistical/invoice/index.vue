<!--
* @description  票据查询
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
    import Invoice from './Invoice'
    import Deposit from './Deposit'

    export default {
        components: {
            Invoice,
            Deposit
        },
        data() {
            return {
                options: [
                    { label: '发票', name: 'Invoice' },
                    { label: '押金条', name: 'Deposit' }
                ],
                activeName: 'Invoice'
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
