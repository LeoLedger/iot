<template>
    <div class="dialog-container classSfix">
        <el-dialog :visible.sync="addInTreeVisible"
                   :title="title"
                   :before-close="simpleClose"
                   width="600px"
                   height="300px">
            <el-tabs style="margin-right: 50px;">
                <el-form ref="form"
                         :model="formData"
                         :rules="formRules"
                         label-width="100px"
                         class="form-container"
                         :inline="true"
                         size="mini">
                    <el-row type="flex" justify="center">
                        <el-col :xs="24" :lg="24">
                            <el-row>
                                <el-col :xs="24" :lg="24">
                                    <el-form-item label="节点" prop="classId">
                                        <el-cascader v-model="formData.classId" :options="NotInTreeData"
                                                     :props="{checkStrictly: true,emitPath:false,expandTrigger:'hover'}"
                                                     clearable filterable style="width: 90%"></el-cascader>
                                    </el-form-item>
                                    <el-checkbox v-model="formData.isHaveChild">包括子节点</el-checkbox>
                                </el-col>
                            </el-row>
                            <el-row>
                                <el-form-item label="父节点" prop="parentId">
                                    <el-cascader v-model="formData.parentId" :options="inTreeData"
                                                 :props="{checkStrictly: true,emitPath:false,expandTrigger:'hover'}"
                                                 clearable filterable style="width: 100%"></el-cascader>
                                </el-form-item>
                            </el-row>
                            <el-row>
                                <el-form-item label="排序" prop="orderNum">
                                    <el-input v-model="formData.orderNum" clearable></el-input>
                                </el-form-item>
                            </el-row>
                        </el-col>
                    </el-row>
                </el-form>
            </el-tabs>
            <span slot="footer">
                <el-button @click="simpleClose" size="mini">取 消</el-button>
                <el-button type="primary" @click="addCT" size="mini">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import {
        getInTreeList,
        getNotInTreeList,
        addCT
    } from "@/api/systemSet/class/index";

    export default {
        name: 'addInTree',
        props: {
            addInTreeVisible: {
                type: Boolean,
                default: false
            },
            treeId: {type: String}
        },
        data() {
            const {formData} = this.$props;
            return {
                // 配置弹窗
                title: '调入',
                //节点列表
                NotInTreeData: [],
                //父节点列表
                inTreeData: [],
                formOptions: {
                    submitBtnText: '提交',
                    showCancelBtn: true,
                },
                formData: {
                    classId: "",
                    parentId: "",
                    orderNum: 0,
                    isHaveChild: false,
                    optionType:"add",
                    treeId: this.treeId
                },
                formRules: {
                    classId: [
                        {
                            required: true,
                            trigger: "change",
                            message: "请选择节点"
                        }
                    ]
                }
            }
        },
        created() {
            this.getNotInTreeList();
            this.getInTreeList();
        },
        watch: {
            formData: {
                handler: function (newData, oldData) {
                    this.changeFormData(newData)
                }
            },
        },
        components: {},
        methods: {
            // 直接关闭
            simpleClose() {
                this.$emit("closeAddInTree", false);
            },
            getNotInTreeList() {
                getNotInTreeList({treeId: this.treeId}).then(res => {
                    this.NotInTreeData = res.data.data;
                });
            },
            getInTreeList() {
                getInTreeList({treeId: this.treeId}).then(res => {
                    this.inTreeData = res.data.data;
                });
            },
            addCT() {
                this.$refs["form"].validate(valid => {
                    if (valid) {
                        addCT(this.formData).then(res => {
                            const {success, message} = res.data
                            if (success) {
                                this.$notify({
                                    title: "成功",
                                    message: "操作成功",
                                    type: "success",
                                    duration: 2000
                                });
                                this.$emit("closeAddInTree", true);
                            } else {
                                this.$notify({
                                    title: "失败",
                                    message: "数据验证失败",
                                    type: "warning",
                                    duration: 2000
                                });
                            }
                        })
                    }
                });
            }
        }
    }
</script>

<style lang='scss' scoped>
    .FormConfig {
        .el-input-number {
            width: 100%;
        }
        .footer {
            padding-top: 10px;
            border-top: 1px solid #dcdfe6;
            text-align: right;
        }
        .el-col {
            border-bottom: 0;
        }
    }

    .tip {
        padding-left: 80px;
        color: #aaa;
    }
</style>
