<!--
* @description  收款记录 - 列表
* @author 望浩然
!-->
<template>
  <layout-container>
    <layout-row height="100%">
      <layout-box padding-top="0">
        <layout-row height="100%">
          <el-tabs v-model="activeTab" class="layout-tabs">
            <el-tab-pane name="1" label="收款记录">
              <collection v-if="activeTab==='1'"/>
            </el-tab-pane>
            <el-tab-pane name="2" label="认领信息">
              <claim v-if="activeTab === '2'"/>
            </el-tab-pane>
          </el-tabs>
        </layout-row>
      </layout-box>
    </layout-row>
  </layout-container>
</template>
<script>
    import Collection from '@/views/businessAccounting/AR/collectionRecord/components/collection'
    import Claim from '@/views/businessAccounting/AR/collectionRecord/components/claim'
    export default {
        components: {
            Claim,
            Collection
        },
        props: {},
        data() {
          return {
            activeTab: '1'
          }
        },
        computed: {},
        watch: {},
        mounted() { },
        methods: {
            /** 初始化 */
            /** 加载数据 */
            /** 点击事件类 */
            /** 事件处理 */
        }
    }
</script>

<style lang='scss' scoped>
</style>
