<!--
* @description 基础信息
* @author 姜庆博
!-->
<template>
    <div class="table">
        <div class="Mentitle" style="margin-bottom: 2px;">
            包含下级分类（{{total}}）
            <el-input
                    v-model="formData.name"
                    placeholder="分类名称"
                    clearable
                    class="filter-item"
                    style="width:200px"
                    size="mini"
            ></el-input>
            <!-- 搜索 -->
            <el-button
                    v-waves
                    class="filter-item"
                    type="primary"
                    icon="el-icon-search"
                    @click="filterHandler"
                    size="mini"
                    v-prereclick
            >搜索</el-button>
            <!-- 导出 -->
            <el-button
                    v-waves
                    class="filter-item"
                    type="warning"
                    icon="el-icon-download"
                    @click="exportHandler"
                    size="mini"
            >导出</el-button>
            <!-- 新增 -->
            <el-button
                    v-waves
                    class="filter-item"
                    type="success"
                    icon="el-icon-plus"
                    @click="addInfo"
                    size="mini"
            >新增</el-button>
        </div>
        <!-- 列表 -->
        <TableComponent :list="list"
                        :total="total"
                        v-bind:pageSize.sync="pageSize"
                        v-bind:pageIndex.sync="pageIndex"
                        :options="options"
                        :columns="columns"
                        :operates="operates"
        />

        <EditDialog
                v-if="editDialogVisible"
                v-bind:visible.sync="editDialogVisible"
                :formData="detailData"
                :treeData="treeData"
                :isEdit="isEdit"
                @editSubmitCallBack="editSubmitCallBack"
        />
        <!--:selectedOption="selectedFormOption"-->
    </div>
</template>

<script>
    import waves from "@/directive/waves";
    import prereclick from "@/directive/prereclick";
    import FormConfig from "@/components/FormConfig";
    import TableComponent from "@/components/TableComponent";
    import EditDialog from "./EditDialog";
    import { PARENT_ID, classLevel } from './config'
    const [bigClass] = classLevel
    import {
        getSysClass,
        exportSysClass, // 导出
        deleteSysClassDetail, // 删除
        getSysClassDetail, // 详情
        editSysClass, // 编辑 / 新增
    } from "@/api/systemSet/SysClass";

    export default {
        name: "DetailList",
        directives: {waves, prereclick},
        components: {
            FormConfig,
            TableComponent,
            EditDialog
        },
        props: {
            parentId: {
                type: Number,
            },
            parentInfo: {
                type: Object,
            },
            treeData: {
                type: Array,
            }
        },
        data() {
            const _this = this;
            return {
                editDialogVisible: false,
                detailData: {
                },
                isEdit: false, // 判断弹窗类型
                selectedFormOption: [],

                list: [],
                total: 0, // table数据总条数
                pageIndex: 1, // 当前页码
                pageSize: 15, // 每页数量
                options: {
                    // stripe: true, // 是否为斑马纹 table
                    loading: false, // 是否添加表格loading加载动画
                    height: 494
                },
                formData: {
                    name: '',
                },
                columns: [
                    {
                        prop: 'code',
                        label: '编号',
                        width: 260,
                    }, {
                        prop: 'name',
                        label: '分类名称',
                        width: 110
                    }, /*{
                        prop: 'parent',
                        label: '分类级别',
                        width: 100,
                    }, */{
                        prop: 'remark',
                        label: '备注',
                        minWidth: 200,
                    },
                ],
                // 列操作按钮
                operates: {
                    width: 160,
                    fixed: 'right',
                    type: 'btn',
                    list: [{
                            label: '编辑',
                            icon: 'el-icon-edit',
                            show: true,
                            method: _this.editRowInfo
                        }, {
                            label: '删除',
                            type: 'danger',
                            icon: 'el-icon-delete',
                            show: true,
                            disabled: false,
                            method: async (index, row) => {
                                this.deleteRowInfo(row.id)
                            }
                        }
                    ]
                },
            };
        },
        watch: {
            pageIndex(newData, oldDate) {
                this.queryList();
            },
            pageSize(newData, oldDate) {
                this.queryList();
            },
            parentId(newData, oldData) {
                this.queryList();
            }
        },
        created() {
            this.queryList();
        },
        methods: {
            // 请求数据列表
            queryList() {
                const _this = this,
                    {
                        pageSize,
                        pageIndex,
                        options,
                        formData,
                        parentId
                    } = this;
                if(typeof parentId === 'undefined') return;
                options.loading = true;
                const params = {
                    pageIndex, // 当前页码
                    pageSize, // 每页数量
                    parentId, // 父级节点
                    ...formData
                };
                getSysClass(params).then(res => {
                    const {data} = res.data;
                    _this.options.loading = false; // 更改加载中的 loading值
                    _this.list = data.rows || [];
                    _this.total = data.records;
                });
            },
            filterHandler() {
                this.pageIndex = 1; // 初始为1
                if(typeof this.parentId === 'undefined') {
                    return this.$message.error('请先选择父级分类');
                }
                this.queryList();
            },
            // 导出
            exportHandler() {
                const {
                    pageSize, // 当前页码
                    pageIndex, // 每页数量
                    formData, // name
                    parentId
                } = this;
                const params = {
                    pageIndex,
                    pageSize,
                    ...formData,
                    parentId
                };
                if(typeof parentId === 'undefined') {
                    return this.$message.error('请先选择父级分类');
                }
                exportSysClass(params)
            },
            // 删除
            deleteRowInfo(id) {
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
                            // 删除成功 将页数减去1 避免bugger
                            if(this.list.length === 1 && this.pageIndex > 1) {
                                this.pageIndex--
                            }
                            this.editSubmitCallBack()
                        } else {
                            this.$message.error(message);
                        }
                    });
                }).catch(() => {});
            },
            // 编辑
            async editRowInfo(index, row) {
                const info = await this.querySysClassDetail(row.id)
                const {parentId, parent} = info
                this.detailData = info
                // this.selectedFormOption = [{value: parentId, label: parent}]
                this.editDialogVisible = true;
                this.isEdit = true;
            },
            // 新增
            addInfo() {
                if(typeof this.parentId === 'undefined') {
                    return this.$message.error('请先选择父级分类');
                }
                this.editDialogVisible = true;
                this.isEdit = false;
                // 在列表中 新增 对应父级应该是 自己本身
                const {id, parentIdStr} = this.parentInfo
                let newParentIdStr = JSON.parse(JSON.stringify(parentIdStr))
                if(id === PARENT_ID) { // 市政项目巡检考核标准
                    newParentIdStr = []
                } else {
                    newParentIdStr.push(id)
                }
                this.detailData = {
                    parentIdStr: newParentIdStr, // 把当前的这个分支交给新建
                    type: bigClass, // 默认大类
                    typeEnum: 2
                }
                // this.selectedFormOption = [{value: id, label: name}]
            },
            querySysClassDetail(id) {
                return getSysClassDetail(id).then((res) => {
                    const {success, data, message} = res.data;
                    if (success) {
                        return data || {}
                    } else {
                        this.$message.error(message);
                    }
                })
            },
            editSubmitCallBack() {
                this.$emit("editSubmitCallBack"); // 触发刷新 树/详情/列表数据
            }
        }
    };
</script>

<style lang='scss' scoped>
    .table {
        margin-top: 10px;
    }
</style>
