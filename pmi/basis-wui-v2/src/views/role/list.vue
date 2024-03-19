<template>
    <layout-row height="100%" class="content">
        <layout-col class="leftSide">
            <layout-row auto class="box">
                <SideBarTree
                    :id="deptId"
                    ref="tree"
                    @updateDeptId="updateDeptId"
                />
            </layout-row>
        </layout-col>
        <layout-col auto class="rigthSide">
            <!-- 列表 -->
            <DetailList
                ref="detailList"
                :dept-id="deptId"
                :parent-info="baseData"
                :tree-data="treeData"
                @editSubmitCallBack="editSubmitCallBack"
            />
        </layout-col>
    </layout-row>
</template>

<script>

    import DetailList from './DetailList'
    import SideBarTree from './components/SideBarTree'
    import { DEPT_ID } from './Config'

    export default {
        name: 'RoleList',
        components: {
            SideBarTree,
            DetailList
        },
        props: {},
        data() {
            return {
                deptId: DEPT_ID,
                baseFormLoading: false, // 基本信息编辑
                baseData: {
                },
                selectedFormOption: [],
                treeData: []
            }
        },
        computed: {
            isTopNode() {
                return this.deptId === DEPT_ID
            }
        },
        mounted() {
            // this.updateBaseInfo()
            this.updatePageInfo()
        },
        methods: {
            // 点击左边树更新部门
            updateDeptId(value) {
                this.deptId = value
                this.forceUpdateDetailList()
            },
            // 强制更新 列表数据
            forceUpdateDetailList() {
                this.$refs.detailList.queryList()
            },
            async forceUpdateTree() {
                const treeData = await this.$refs.tree.getTree()
                this.treeData = treeData
                if (typeof this.deptId !== 'undefined') {
                    // 若存在 deptId 等  tree更新完成  高亮当前行
                    this.$refs.tree &&
                        this.$refs.tree.setCurrentKey &&
                        this.$refs.tree.setCurrentKey(this.deptId)
                }
            },

            updatePageInfo() { // 操作完相关数据更新列表
                this.forceUpdateTree()
                this.forceUpdateDetailList()
            },
            editSubmitCallBack() {
                this.updatePageInfo()
            }
        }
    }
</script>

<style lang="scss" scoped>
.content {
    padding: 20px;
    .leftSide {
        margin-right: 20px;
        .box {
            border: 1px solid #ebeef5;
            padding: 10px;
            border-radius: 5px;
        }
    }
}
</style>
