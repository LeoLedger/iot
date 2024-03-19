<template>
  <el-tabs v-model="activeName">
    <el-tab-pane label="默认部门" name="first">
      <SideBarTree ref="tree" :id="deptId"/>
    </el-tab-pane>

    <el-tab-pane label="部门树管理" name="second">

    </el-tab-pane>
  </el-tabs>
</template>

<script>
  import SideBarTree from "@/views/role/components/SideBarTree";
  import {DEPT_ID} from '@/views/role/Config'

  export default {
    name: "deptTreeItem",
    components: {
      SideBarTree
    },
    data() {
      return {
        activeName: 'first',
        deptId: DEPT_ID
      }
    },
    mounted() {
      this.updatePageInfo()
    },
    methods: {
      async forceUpdateTree() {
        this.treeData = await this.$refs.tree.getTree();
        if (this.deptId) {
          // 若存在 deptId 等  tree更新完成  高亮当前行
          this.$refs.tree &&
          this.$refs.tree.setCurrentKey &&
          this.$refs.tree.setCurrentKey(this.deptId)
        }
      },
      // 操作完相关数据更新列表
      updatePageInfo() {
        this.forceUpdateTree();
      }
    }
  }
</script>

<style scoped>

</style>
