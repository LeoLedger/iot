<!--
* @description
* @author 姜庆博
!-->
<template>
    <div class="app-container authMn">
        <div class="leftSide">
            <div class="box">
                <SideBarTree
                        ref="tree"
                        :id="PARENT_ID"
                        @updateParentId="updateParentId"/>
            </div>
        </div>

        <div class="rigthSide">
            <div class="detail">
                <div class="Mentitle">
                    基础信息
                </div>
                <div class="content"
                     v-loading="baseFormLoading"
                     element-loading-text="加载中..."
                     element-loading-background="rgba(0, 0, 0, 0.1)">
                    <Form ref="baseInfo" class="formDetail"
                          :formData="baseData"
                          :selectedOption="selectedFormOption"
                          @editSubmitCallBack="updatePageInfo"
                          :isTopNode="isTopNode"
                          :isEdit="true"
                          :isFormBasic="true"
                          :treeData="treeData"
                    />
                    <div class="handlerBox">
                        <el-button
                                type="primary"
                                v-waves
                                @click="editInfo"
                                size="mini"
                                :disabled="isTopNode"
                        >保存</el-button>
                        <el-button
                                type="danger"
                                v-waves
                                title="删除"
                                icon="el-icon-delete"
                                @click="deleteInfo"
                                size="mini"
                                :disabled="isTopNode"
                        />
                    </div>
                </div>
            </div>

            <!-- 列表 -->
            <DetailList
                    ref="detailList"
                    :columns="[]"
                    :parentId="parentId"
                    :parentInfo="baseData"
                    :treeData="treeData"
                    @editSubmitCallBack="editSubmitCallBack"
            />
        </div>
    </div>
</template>


<script>
import waves from "@/directive/waves"; // Waves directive;
import prereclick from "@/directive/prereclick"; // prereclick directive;
import SideBarTree from "../components/SideBarTree";
import Form from "./Form";
import DetailList from "./DetailList";
import { PARENT_ID, classLevel } from './config'
const [bigClass, smallClass] = classLevel

import {
    getSysClassDetail, // 详情
    deleteSysClassDetail, // 删除
} from "@/api/systemSet/SysClass";

export default {
    name: "ProblemAnList",
    directives: { waves, prereclick },
    props: {},
    components: {
        Form,
        SideBarTree,
        DetailList
    },
    data() {
        return {
            parentId: PARENT_ID, // 父级id
            PARENT_ID,
            baseFormLoading: false, // 基本信息编辑
            baseData: {
                // id: PARENT_ID,
            },
            selectedFormOption: [],
            treeData: []
        };
    },
    created() {
        if (PARENT_ID.toString() === 'NaN') {
            this.$message.error('获取市政考核失败，请联系平台 初始化数据')
        }
    },
    mounted() {
        // this.updateBaseInfo()
        this.updatePageInfo()
    },
    watch: {
        xxxxx: {
            immediate: true,
            handler(val) {}
        }
    },
    computed: {
        isTopNode() {
            return this.parentId === PARENT_ID
            // return false
        }
    },
    methods: {
        // 权限列表
        updateParentId(value) {
            // console.log(JSON.stringify(data), 'updateParentId')
            this.parentId = value;
            this.updateBaseInfo()
        },
        // 强制更新 列表数据
        forceUpdateDetailList() {
            this.$refs.detailList.queryList()
        },
        async forceUpdateTree() {
            let treeData = await this.$refs.tree.getTree()
            this.treeData = treeData;
            if(typeof this.parentId !== 'undefined'){
                // 若存在 parentId 等  tree更新完成  设置 当前 高亮行
                this.$refs.tree &&
                this.$refs.tree.setCurrentKey &&
                this.$refs.tree.setCurrentKey(this.parentId)
            }
        },
        async updateBaseInfo() {
            const data = await this.querySysClassDetail(this.parentId);
            // this.selectedFormOption = [{value: data.parentId, label: data.parent}]
            if(typeof data.type === 'undefined') {
                data.type = bigClass // 若没有类型字段 默认为大类  classLevelEnum: 大类
            }
            this.baseData = data;
        },
        updatePageInfo() { // 操作完相关数据更新列表
            this.forceUpdateDetailList()
            this.forceUpdateTree();
            this.updateBaseInfo();
        },
        editSubmitCallBack() {
            this.updatePageInfo()
        },
        // 编辑权限
        editInfo() {
            // this.$refs.baseInfo.submitHandler(this.baseFormSubmit)
            this.$refs.baseInfo.submitHandler()
        },
        // 删除
        deleteInfo() {
            const {id, parentId} = this.baseData; // 当前详情的数据
            if(typeof id === 'undefined') {
                return this.$message.error('请先选择父级分类');
            }
            this.$confirm("此操作将删除此记录, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
                center: true
            }).then(() => {
                deleteSysClassDetail(id).then(res => {
                    const {success, message} = res.data;
                    if (success) {
                        this.$message({
                            type: "success",
                            message: "删除成功!"
                        });
                        this.parentId = parentId // 重置 将 parentId设置为 当前id的父级
                        this.updatePageInfo()
                    } else {
                        this.$message.error(message);
                    }
                });
            }).catch(() => {});
        },
        querySysClassDetail(id) {
            return getSysClassDetail(id).then((res) => {
                const {success, data, message} = res.data;
                // console.log(res.data, '详情请求成功....')
                if (success) {
                    return data || {}
                } else {
                    this.$message.error(message);
                }
            })
        },

    }
};
</script>

<style lang="scss" scoped>
.authMn {
    display: flex;
    height: calc(100vh - 50px);
    .leftSide {
        width: 18%;
        float: left;
        overflow: hidden;
        position: relative;
        .box {
            border: 1px solid #ebeef5;
            width: 100%;
            padding: 10px;
            border-radius: 5px;
            position: absolute;
            height: calc(100vh - 125px);
            top: 0;
            bottom: 0;
        }
    }
    .rigthSide {
        width: 80%;
        float: left;
        overflow: scroll;
        margin-left: .5%;
        @at-root {
            .content {
                display: flex;
                padding-top: 10px;
                border: 1px solid #ebeef5;
                border-top: 0;
                .formDetail {
                    flex: 7;
                }
                .handlerBox {
                    flex: 4;
                    display: flex;
                    justify-content: flex-end;
                    align-items: self-end;
                    padding-right: 20px;
                }
            }
        }

    }
}
</style>
