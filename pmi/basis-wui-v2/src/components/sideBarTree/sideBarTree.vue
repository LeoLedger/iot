<!--
* @description 树形控件--筛选结构
* @fileName sideBarTree.vue
* @author 叶金龙
* @date 2019/06/17 11:05:37
* @version V1.0.0
!-->
<template>
    <div class="sideBarTree-container">

        <el-tree
            ref="attrList"
            :data="treeData"
            :default-expanded-keys="[0]"
            :default-expand-all="defaultExpandAll"
            check-strictly
            accordion
            :props="defaultProps"
            :render-content="renderContent"
            :filter-node-method="filterNode"
            @node-click="handleNodeClick"
        ></el-tree>
    </div>
</template>

<script>
    import waves from "@/directive/waves";
    import prereclick from "@/directive/prereclick";
export default {
    name: "sideBarTree",
    directives: {waves, prereclick},
    data() {
        return {
            defaultProps: {
                children: "children",
                label: "label"
            },
            filterValue:''
        };
    },
    props: {
        treeData: {
            type: Array
        },
        defaultExpandAll:{
            type: Boolean,
            default: false
        }
    },
    created() {},
    watch: {},
    components: {},
    methods: {
        // 节点点击事件
        handleNodeClick(obj, node, self) {
            if (obj.parentId == 0) {
                obj.value = null;
            }
            node.expanded = true;
            this.$emit("getNodeObj", obj);
        },
        // 自定义树的图标
        renderContent(h, { node, data, store }) {
            return (
                <span style="font-size:14px">
                    <svg-icon icon-class="tree" style="color:#409eff;" />
                    <span>{node.label}</span>
                </span>
            );
        },
        filterNode(value, data) {
            if (!value) return true;
            return data.label.indexOf(value) !== -1;
        },
        search() {
            this.$refs.attrList.filter(this.filterValue);
        }
    }
};
</script>

<style lang='scss'>
.sideBarTree-container {
    .el-tree--highlight-current
        .el-tree-node.is-current
        > .el-tree-node__content {
        background-color: #ecf5ff;
    }
}
</style>
