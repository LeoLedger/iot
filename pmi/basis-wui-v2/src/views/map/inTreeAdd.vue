<template>
    <div class="dialog-container menusfix">
        <el-dialog :before-close="beforeClose"
                   :title="str+'区域'"
                   :visible.sync="addInMapTreeVisible"
                   width="800px">
            <el-form :model="formData"
                     :rules="formRules"
                     class="form-container"
                     label-width="100px"
                     ref="form"
                     size="mini">
                <el-row justify="center"
                        type="flex">
                    <el-col :lg="24"
                            :xs="24">
                        <el-row>
                            <el-col :span="12"
                                    :xs="24">
                                <el-form-item label="节点"
                                              prop="mapId">
                                    <el-cascader :options="treeData"
                                                 :props="{ checkStrictly: true,emitPath:false,expandTrigger:'hover' }"
                                                 clearable
                                                 filterable
                                                 size="mini"
                                                 style="width:100%"
                                                 v-model="formData.mapId"></el-cascader>
                                </el-form-item>

                            </el-col>
                            <el-col :span="12"
                                    :xs="24">
                                &nbsp;&nbsp;
                                <el-checkbox v-model="formData.checkedSubMap">包含子节点</el-checkbox>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12"
                                    :xs="24">
                                <el-form-item label="父节点"
                                              prop="mapPid">
                                    <el-cascader :options="inMapTreeData"
                                                 :props="{ checkStrictly: true,emitPath:false,expandTrigger:'hover' }"
                                                 clearable
                                                 filterable
                                                 size="mini"
                                                 style="width:100%"
                                                 v-model="formData.mapPid"></el-cascader>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12"
                                    :xs="24">
                                <el-form-item label="排序"
                                              prop="orderNum">
                                    <el-input-number :min="0"
                                                     style="width:100%"
                                                     v-model="formData.orderNum"></el-input-number>
                                </el-form-item>
                            </el-col>

                        </el-row>

                    </el-col>
                </el-row>
            </el-form>

            <span slot="footer">
<el-button @click="simpleClose"
           size="mini"
           v-waves>取 消</el-button>
<el-button @click="submitMap"
           size="mini"
           type="primary"
           v-prereclick
           v-waves>确 定</el-button>
      </span>
        </el-dialog>
    </div>
</template>
<script>
    import waves from "@/directive/waves"; // Waves directive;
    import prereclick from "@/directive/prereclick"; // prereclick directive;
    import {
        handlerMapInTree,
        getMapInTreeListById
    } from "@/api/map/index";


    export default {
        name: "inTreeAddBox",
        directives: {waves, prereclick},
        data() {
            return {
                formData: {
                    mapId: null,
                    mapPid: null,
                    mapTreeId: null,
                    orderNum: null,
                    checkedSubMap: false
                },
                formRules: {
                    mapId: [{
                        required: true,
                        trigger: "change",
                        message: "请选择区域节点"
                    }],
                    // mapPid: [
                    //     {
                    //         required: true,
                    //         trigger: "change",
                    //         message: "请选择区域父节点"
                    //     }
                    // ],

                },
                map_in_tree_list: [],
            }
        },
        props: {
            addInMapTreeVisible: {
                type: Boolean,
                default: false
            },
            str: {
                type: String
            },
            treeId: {
                type: [String, Number]
            },
            treeData: {
                type: Array
            },
            inMapTreeData: {
                type: Array
            }
        },
        created() {
            this.getMapinTreeList();
        },
        watch: {},
        components: {},
        methods: {
            getMapinTreeList() {
                getMapInTreeListById({treeId: this.treeId}).then(res => {
                    if (res.data.success) {
                        this.map_in_tree_list = res.data.data;
                    }
                });
            },
            // 确认关闭
            beforeClose() {
                this.$confirm("确认放弃本次操作？")
                    .then(_ => {
                        //done();  不能使用done 否则会直接操作模态框
                        this.$nextTick(() => {
                            this.$emit("closeCallInMapTree", false);
                            // this.$refs.form.resetFields();
                        });
                    })
                    .catch(_ => {
                        return false;
                    });
            },
            // 直接关闭
            simpleClose() {
                this.$emit("closeCallInMapTree", false);
            },
            // 提交
            submitMap() {

                let curMapTree = this.map_in_tree_list.find(({mapId}) => {
                    return mapId === this.formData.mapId;
                }) || null;
                this.$refs["form"].validate(valid => {

                    if (valid) {
                        this.formData.mapTreeId = this.treeId;
                        this.formData = Object.assign(this.formData);

                        if (curMapTree == null) {
                            handlerMapInTree(this.formData).then(res => {
                                if (res.data.success) {
                                    this.$notify({
                                        title: "成功",
                                        message: this.str + "成功",
                                        type: "success",
                                        duration: 2000
                                    });
                                    this.$emit("closeCallInMapTree", true);
                                } else {
                                    this.$notify({
                                        title: "失败",
                                        message: "数据操作失败",
                                        type: "warning",
                                        duration: 2000
                                    });
                                }
                            });

                        } else {
                            this.$message({
                                showClose: true,
                                message: '节点已经在树中',
                                type: 'warning'
                            });
                        }

                    } else {
                        return false;
                    }
                });
            }
        }
    };
</script>

<style lang='scss'>
    .menusfix {
        .el-tabs__header {
            margin-bottom: 8px;
        }

        .el-tabs__content {
            height: 400px;
            overflow-y: scroll;
        }
    }
</style>

