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
    import Total from './components/total'
    import Project from './components/project'
    import Section from './components/section'

    export default {
        components: {
            Total,
            Project,
            Section
        },
        data() {
            return {
                options: [
                    { label: '全部', name: 'Total' },
                    { label: '项目', name: 'Project' },
                    { label: '标段', name: 'Section' }
                ],
                activeName: 'Total'
            }
        }
    }
</script>

<style lang='scss' scoped>

</style>
