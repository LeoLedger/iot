<!--
* @description  故障
* @fileName index.vue
* @author whr
!-->
<template>
    <tabs-layout :options="options" v-model="activeName">
        <component :is="activeName" />
    </tabs-layout>
</template>
<script>
  // 组件
    import Product from './components/product'
    import Project from './components/project'

    export default {
        components: {
            Product,
            Project
        },
        data() {
            return {
                options: [
                    { label: '项目', name: 'Project' },
                    { label: '产品', name: 'Product' }
                ],
                activeName: 'Project'
            }
        }
    }
</script>

<style lang='scss' scoped>

</style>
