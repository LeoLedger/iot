
<template>
    <tabs-layout :options="options" v-model="activeName">
        <component :is="activeName" :extend-params="{}"/>
    </tabs-layout>
</template>
<script>
    // 组件
    import BillsList from './BillsList'
    import DeviceList from './DeviceList'

    export default {
        components: {
            BillsList,
            DeviceList
        },
        data() {
            return {
                options: [
                    { label: '安装单据', name: 'BillsList' },
                    { label: '已安装设备', name: 'DeviceList' }
                ],
                activeName: 'BillsList'
            }
        }
    }
</script>
