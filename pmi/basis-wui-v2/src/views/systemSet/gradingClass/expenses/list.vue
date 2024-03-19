<!--
* @description
* @author 姜庆博
!-->
<template>
    <div class="app-container problemAn">
        <div class="leftSide">
            <div class="box">
                <!-- // 支出类型 id: PARENT_ID -->
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
                    <BasicInfo class="formDetail" ref="baseInfo"
                               :formData="baseData"
                               :treeData="treeData"
                               :isTopNode="isTopNode"
                               :isEdit="true"
                    />
                    <!--:selectedOption="selectedFormOption"-->
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
import DetailList from "./DetailList";
import SideBarTree from "../components/SideBarTree";
import BasicInfo from "./BasicInfo";
import {PARENT_ID} from './basicInfoConfig'

import {
    getSysClassDetail, // 详情
    editSysClass, // 编辑 / 新增
    deleteSysClassDetail, // 删除
} from "@/api/systemSet/SysClass";

export default {
    name: "ProblemAnList",
    directives: { waves, prereclick },
    props: {},
    components: {
        BasicInfo,
        SideBarTree,
        DetailList
    },
    data() {
        return {
            parentId: PARENT_ID, // 父级id // 支出类型 id: PARENT_ID
            PARENT_ID,
            baseFormLoading: false, // 基本信息编辑
            baseData: { // 支出项目 新建类型（项目初始化 新建用）
                /*id: PARENT_ID,
                name: '项目支出类型',
                type: 0*/
            },
            selectedFormOption: [],
            treeData: []
        };
    },
    mounted() {
        // this.updateBaseInfo()
        this.updatePageInfo()
    },
    computed: {
        isTopNode() {
            return this.parentId === PARENT_ID // 若为 项目支出类型  不许删除
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
            // console.warn(treeData, 'New treeData')
            if(typeof this.parentId !== 'undefined'){
                // 若存在 parentId 等  tree更新完成  高亮当前行
                this.$refs.tree &&
                this.$refs.tree.setCurrentKey &&
                this.$refs.tree.setCurrentKey(this.parentId)
            }
        },
        async updateBaseInfo() {
            const data = await this.querySysClassDetail(this.parentId);
            // this.selectedFormOption = [{value: data.parentId, label: data.parent}]
            if(typeof data.type === 'undefined') {
                data.type = 0; // 若没有类型字段 默认为大类
            }
            this.baseData = data;
        },
        updatePageInfo() { // 操作完相关数据更新列表
            this.updateBaseInfo();
            this.forceUpdateTree();
            this.forceUpdateDetailList();
        },
        editSubmitCallBack() {
            this.updatePageInfo()
        },
        baseFormSubmit(params) {
            const submitParams = {
                ...this.baseData,
                ...params,
                typeEnum: 2, // 目前这个字段写死 之前这个字段用于 提交 车类型用的
            }
            // 调整上级分类
            submitParams.parentId = params.parentIdStr.slice(-1)[0] || PARENT_ID
            if (params.parentIdStr.includes(submitParams.id)) {
                this.$message.error('修改的上级分类不可以是自己本身 或 本身的子级')
                return
            }
            this.baseFormLoading = true;
            editSysClass(submitParams).then((res) => {
                const {success, message} = res.data;
                if (success) {
                    this.$message.success('请求处理成功');
                    this.updatePageInfo()
                } else {
                    this.$message.error(message);
                }
            }).finally(() => {
                this.baseFormLoading = false; // 更改提交按钮的状态值
            })
        },
        // 编辑权限
        editInfo() {
            this.$refs.baseInfo.formSubmit(this.baseFormSubmit)
        },
        // 删除
        deleteInfo() {
            const {id, parentId} = this.baseData; // 当前详情的数据
            if(typeof id === 'undefined') {
                return this.$message.error('请先选择父级分类');
            }
            // console.log(parentId, 'this.PARENTID')
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
.problemAn {
    display: flex;
    height: calc(100vh - 50px);
    .leftSide {
        /*flex: 18;*/
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
        /*flex: 80;*/
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
                    display: flex;
                    flex: 4;
                    justify-content: flex-end;
                    align-items: self-end;
                    padding-right: 20px;
                }
            }

        }

    }
}
</style>
