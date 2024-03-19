<!--
 * @Author: shiliangL
 * @Date: 2020-09-16 21:02:33
 * @LastEditTime: 2020-09-17 17:46:39
 * @LastEditors: Do not edit
 * @Description:
 * @FilePath: /basis-wui/src/views/workflow/components/FlowNode.vue
-->
<template>
    <div
        ref="node"
        :style="nodeContainerStyle"
        :class="nodeContainerClass"
        @dblclick="clickNode"
        @mouseup="changeNodeSite"
    >
        <!-- 最左侧的那条竖线 -->
        <div class="ef-node-left" />
        <!-- 节点类型的图标 -->
        <div class="ef-node-left-ico flow-node-drag">
            <i :class="nodeIcoClass" />
        </div>
        <!-- 节点名称 -->
        <div
            class="ef-node-text"
            :show-overflow-tooltip="true"
        >
            {{ node.name }}
        </div>

        <VueContextMenu
            class="contextmenu"
            :target="contextMenuTarget"
            :show="contextMenuVisible"
            @update:show="(show) => contextMenuVisible = show"
        >
            <div
                class="li"
                @click="rightClickDel"
            >
                删除
            </div>
        </VueContextMenu>
    </div>
</template>

<script>

    import { component as VueContextMenu } from '@xunlei/vue-context-menu'

    export default {
        name: 'FlowNode',
        components: {
            VueContextMenu
        },
        props: {
            node: { type: Object, default: null },
            activeElement: { type: Object, default: null }
        },
        data() {
            return {
                contextMenuVisible: false,
                contextMenuTarget: null
            }
        },
        computed: {
            nodeContainerClass() {
                return {
                    'ef-node-container': true,
                    'ef-node-active':
                        this.activeElement.type === 'node'
                            ? this.activeElement.nodeId === this.node.id
                            : false
                }
            },
            // 节点容器样式
            nodeContainerStyle() {
                let style = {}
                let { top, left, type } = this.node
                if (type === 1) {
                    style = {
                        color: '#fff',
                        background: '#409EFF'
                    }
                } else if (type === 9) {
                    style = {
                        color: '#fff',
                        background: '#F56C6C'
                    }
                }
                return {
                    top,
                    left,
                    ...style
                }
            },
            nodeIcoClass() {
                const nodeIcoClass = {}
                nodeIcoClass[this.node.ico] = true
                // 添加该class可以推拽连线出来，viewOnly 可以控制节点是否运行编辑
                nodeIcoClass['flow-node-drag'] = !this.node.viewOnly
                return nodeIcoClass
            }
        },
        mounted() {
            this.$nextTick().then(() => {
                this.contextMenuTarget = this.$refs['node']
            })
        },
        methods: {
            // 删除节点
            rightClickDel() {
                this.$emit('rightClickDel', this.node.identifier, this.node.name)
            },
            // 点击节点
            clickNode() {
                this.$emit('clickNode', this.node.id)
            },
            // 鼠标移动后抬起
            changeNodeSite() {
                // 避免抖动
                if (
                    this.node.left === this.$refs.node.style.left &&
                    this.node.top === this.$refs.node.style.top
                ) {
                    return
                }
                this.$emit('changeNodeSite', {
                    identifier: this.node.identifier,
                    left: this.$refs.node.style.left,
                    top: this.$refs.node.style.top
                })
            }
        }
    }
</script>

<style scoped lang="scss">
.ef-node-container {
  user-select: none;
}

.contextmenu {
  margin: 0;
  background: #fff;
  list-style-type: none;
  border-radius: 2px;
  font-size: 12px;
  font-weight: 400;
  color: #333;
  z-index: 99999999;
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
  position: fixed;
  width: 80px;
  text-align: left;
  .li {
    margin: 0;
    text-align: center;
    cursor: pointer;
    &:hover {
      color: #f56c6c;
    }
  }
}
</style>
