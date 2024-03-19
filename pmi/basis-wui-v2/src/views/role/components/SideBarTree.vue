
<template>
    <layout-col auto class="sideBarTree-container">
        <layout-row not-flex>
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
        </layout-row>
        <layout-row not-flex auto scroll class="body-wrap">
            <el-tree
                ref="tree"
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
        </layout-row>
    </layout-col>
</template>

<script>
    import { getDeptTree } from '@/api/dept'
    import waves from '@/directive/waves'
    import prereclick from '@/directive/prereclick'

    export default {
        name: 'SideBarTree',
        directives: { waves, prereclick },
        components: {},
        props: {
            id: {
                type: String
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
                this.$nextTick(() => {
                    this.$refs.tree.setCurrentKey(keyValue) // treeBox 元素的ref   value 绑定的node-key
                })
            },
            // 节点点击事件
            handleNodeClick(data, node, component) {
                if (data.value && this.activeId !== data.value) {
                    this.activeId = data.value
                    this.$emit('updateDeptId', data.value)
                }
            },
            // 获得树形结构
            async getTree() {
                let data = null
                await getDeptTree(this.formData).then(res => {
                    this.treeData = res.data.data
                    data = res.data.data
                })
                return data || []
            },
            filterNode(value, data) {
                if (!value) return true
                return data.label.indexOf(value) !== -1
            },
            search() {
                this.$refs.tree.filter(this.filterValue)
            }
        }
    }
</script>

<style lang='scss' scoped>
.sideBarTree-container {
    display: flex;
    flex-direction: column;
    .body-wrap {
        padding-top: 5px;
        border-top: 2px solid #ececec;
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
