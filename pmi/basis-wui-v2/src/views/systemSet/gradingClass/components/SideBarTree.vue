<!--
* @description 树形控件
* @author 姜庆博
!-->
<template>
    <div class="sideBarTree-container">
        <el-input placeholder="请输入关键字" v-model="filterValue" size="mini">
            <template slot="append">
                <el-button
                        v-waves
                        class="filter-item"
                        type="primary"
                        icon="el-icon-search"
                        @click="search"
                        size="mini"
                />
            </template>
        </el-input>
        <div class="linebox"></div>
        <el-tree
                class="tree"
                ref="tree"
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
        <span class="span-ellipsis" slot-scope="{ node }">
		    <span :title="node.label" style="font-size:14px">{{ node.label }}</span>
	    </span>
    </el-tree>
    </div>
</template>

<script>
    import {getSysclassTree} from "@/api/systemSet/SysClass";
    import waves from "@/directive/waves";
    import prereclick from "@/directive/prereclick";

    export default {
        name: "SideBarTree",
        directives: {waves, prereclick},
        props: {
            id: {
                type: Number,
            }
        },
        data() {
            const {id} = this.$props;
            return {
                formData: {
                    id: id || 0, // 总分类为 0
                    label: ''
                },
                filterValue: '',
                treeData: [],
                defaultProps: {
                    children: "children",
                    label: "label"
                },
                activeId: undefined
            };
        },
        created() {
            // this.getTree()
        },
        components: {},
        methods: {
            setCurrentKey(keyValue) {
                this.$nextTick(() => {
                    this.$refs.tree.setCurrentKey(keyValue); // treeBox 元素的ref   value 绑定的node-key
                });
            },
            // 节点点击事件
            handleNodeClick(data, node, component) {
                // console.log('节点点击事件', JSON.stringify(data))
                if(data.value && this.activeId !== data.value) {
                    this.activeId = data.value
                    this.$emit('updateParentId', data.value)
                }
            },
            // 获得树形结构
            async getTree() {
                let data = null
                await getSysclassTree(this.formData).then(res => {
                    this.treeData = res.data;
                    data = res.data
                });
               return data || []
            },
            filterNode(value, data) {
                if (!value) return true;
                return data.label.indexOf(value) !== -1;
            },
            search() {
                this.$refs.tree.filter(this.filterValue);
            }
        }
    };
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
