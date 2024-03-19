
<template>
    <tabs-layout :options="options" v-model="activeName">
        <component :is="activeName" />
    </tabs-layout>
</template>
<script>
    // 组件
    import ContractList from './ContractList'
    import PurchasingList from './PurchasingList'

    export default {
        components: {
            ContractList,
            PurchasingList
        },
        data() {
            return {
                options: [
                    { label: '合同列表', name: 'ContractList' },
                    { label: '采购清单', name: 'PurchasingList' }
                ],
                activeName: 'ContractList'
            }
        }
    }
</script>
