<template>
  <div class="sideBarTree-container">
    <el-input v-model="filterValue" placeholder="请输入关键字" size="mini">
      <template slot="append">
        <el-button
          v-waves
          class="filter-item"
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="search"
        />
      </template>
    </el-input>
    <div class="linebox" />
    <el-tree
      ref="appTree"
      class="tree"
      :data="treeData"
      highlight-current
      render-after-expand
      expand-on-click-node
      accordion
      check-strictly
      node-key="value"
      :props="defaultProps"
      :filter-node-method="filterNode"
      @node-click="handleNodeClick"
    >
      <span slot-scope="{ node }" class="span-ellipsis">
        <span :title="node.label" style="font-size:14px">{{ node.label }}</span>
      </span>
    </el-tree>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import prereclick from '@/directive/prereclick'
import { getSysTem } from '@/api/resource'

export default {
  name: 'AppSideBarTree',
  directives: { waves, prereclick },
  components: {},
  props: {
    isLoadFirst: {
      type: Boolean,
      default: () => true
    },
    id: {
      type: [String, Object]
    }
  },
  data() {
    const { id } = this.$props
    return {
      formData: {
        id: id || 0, // 总分类为 0
        label: ''
      },
      filterValue: '',
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      activeId: undefined
    }
  },
  created() {
    // this.getTree()
  },
  methods: {
    setCurrentKey(keyValue) {
      this.$nextTick().then(() => {
        this.$refs.appTree.setCurrentKey(keyValue) // treeBox 元素的ref   value 绑定的node-key
      })
    },
    // 节点点击事件
    handleNodeClick(data, node, component) {
      if (data.value && this.activeId !== data.value) {
        this.activeId = data.value
        this.$emit('updateAppId', data)
      }
    },
    // 获得树形结构
    async getTree() {
      let data = null
      await getSysTem(this.formData).then(res => {
        if (res.data.success) {
          this.treeData = res.data.data
          if (this.isLoadFirst) {
            if (!this.treeData.length) return
            const first = this.treeData[0]
            this.setCurrentKey(first.value)
            this.$emit('updateAppId', first)
          }
        } else {
          return this.$message.error('系统应用获取失败！')
          data = res.data.data
        }
      })
      return data || []
    },
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    search() {
      this.$refs.appTree.filter(this.filterValue)
    }
  }
}
</script>

<style lang='scss' scoped>
    .sideBarTree-container {
        height: 100%;
        display: flex;
        flex-direction: column;

        .linebox {
            height: 0;
            width: 100%;
            border: 1px solid #ececec;
            margin-top: 10px;
        }

        .tree {
            flex: 1;
            overflow-y: auto;
        }
    }

    .span-ellipsis {
        width: 100%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
</style>
