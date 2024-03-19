// template.js
const getUpperCaseName = (componentName) => componentName.replace(/^(\w)/, (match, s) => s.toUpperCase())

  /* */

module.exports = {
    vueTemplate: componentName => {
        const upperCaseName = getUpperCaseName(componentName)
        return `<!--
* @description 添加描述@todo
* @fileName list.vue
* @author 添加作者@todo
!-->
<template>
  <div class="${componentName}">
  testList
  </div>
  </template>
  <script>
export default {
  name: '${upperCaseName}',
  components: {},
}
</script>
<style lang="scss" scoped>
.${componentName} {
}
</style>`
    },

    routeEntryTemplate: componentName => {
        return `export default {
    path: '/${componentName}/list',
    name: '${componentName}',
    component: () => import(/* webpackChunkName: "${componentName}" */ '@/views/${componentName}/list'),
    meta: {
        title: '请输入Title'
    }
}`
    },

    columnConfigTemplate: columns => {
        return `export default {
    columns: ${JSON.stringify(columns, '', '\t')}
}`
    }
}
