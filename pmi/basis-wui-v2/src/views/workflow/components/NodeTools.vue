<template>
    <div
        ref="tool"
        class="flow-menu"
    >
        <el-row>
            <el-col
                v-for="node in nodeList"
                :key="node.id"
                :span="24"
                style="padding: 10px;"
            >
                <el-card shadow="hover" :body-style="node.style">
                    <draggable
                        :options="draggableOptions"
                        style="width: 100%"
                        @end="end"
                        @start="move"
                    >
                        <div
                            class="ef-node-menu-li"
                            :type="node.type"
                        >
                            <i :class="node.ico" /> {{ node.name }}
                        </div>
                    </draggable>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import draggable from 'vuedraggable'

    const mousePosition = { left: -1, top: -1 }
    export default {
        name: 'NodeTools',
        components: {
            draggable
        },
        data() {
            return {
                activeNames: '1',
                // draggable配置参数参考 https://www.cnblogs.com/weixin186/p/10108679.html
                draggableOptions: {
                    preventOnFilter: false,
                    sort: false,
                    disabled: false,
                    ghostClass: 'tt',
                    // 不使用H5原生的配置
                    forceFallback: true
                    // 拖拽的时候样式
                    // fallbackClass: 'flow-node-draggable'
                },
                nodeList: [
                    {
                        id: '1',
                        type: '1',
                        name: '开始节点',
                        ico: 'el-icon-time',
                        // 自定义覆盖样式
                        style: {
                            color: '#fff',
                            background: '#409EFF'
                        }
                    },
                    {
                        id: '2',
                        type: '0',
                        name: '流程环节',
                        ico: 'el-icon-odometer',
                        // 自定义覆盖样式
                        style: {}
                    },
                    {
                        id: '3',
                        type: '9',
                        name: '结束环节',
                        ico: 'el-icon-odometer',
                        // 自定义覆盖样式
                        style: {
                            color: '#fff',
                            background: '#F56C6C'
                        }
                    }
                ],
                nodeMenu: {}
            }
        },
        created() {
            /**
             * 以下是为了解决在火狐浏览器上推拽时弹出tab页到搜索问题
             * @param event
             */
            if (this.isFirefox()) {
                document.body.ondrop = function(event) {
                    // 解决火狐浏览器无法获取鼠标拖拽结束的坐标问题
                    mousePosition.left = event.clientX
                    mousePosition.top = event.clientY - 50
                    event.preventDefault()
                    event.stopPropagation()
                }
            }
        },
        methods: {
            // 根据类型获取左侧菜单对象
            getMenuByType(type) {
                for (let i = 0; i < this.nodeList.length; i++) {
                    if (this.nodeList[i].type === type) {
                        return this.nodeList[i]
                    }
                }
            },
            // 拖拽开始时触发
            move(evt) {
                const type = evt.item.attributes.type.nodeValue
                this.nodeMenu = this.getMenuByType(type)
            },
            // 拖拽结束时触发
            end(evt) {
                this.$emit('addNode', evt, this.nodeMenu, mousePosition)
            },
            // 是否是火狐浏览器
            isFirefox() {
                const userAgent = navigator.userAgent
                return userAgent.indexOf('Firefox') > -1
            }
        }
    }
</script>

<style scoped lang="scss">
.flow-menu {
  >>> .el-card__body {
    padding: 10px;
    cursor: move;
  }
  >>> .ef-node-menu-li {
    padding: 4px;
  }
}
</style>
