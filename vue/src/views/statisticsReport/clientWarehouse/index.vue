<!--
* @description  客户仓库
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
    import Company from './components/Company'
    import Project from './components/Project'
    import Section from './components/Section'

    export default {
        components: {
            Company,
            Project,
            Section
        },
        data() {
            return {
                options: [
                    { label: '项目', name: 'Project' },
                    { label: '标段', name: 'Section' },
                    { label: '企业', name: 'Company' }
                ],
                activeName: 'Project'
            }
        }
    }
</script>

<style lang='scss' scoped>

</style>
