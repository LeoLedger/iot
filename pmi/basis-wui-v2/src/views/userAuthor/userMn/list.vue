<!--
* @description 用户管理
* @fileName list.vue
* @author 叶金龙
* @date 2019/06/13 17:11:13
* @version V1.0.0
!-->
<template>
    <div class="app-container userMn">
        <div class="filter-container">
            <el-input
                v-model="searchParam.tenantName"
                placeholder="关联客户"
                clearable
                class="filter-item"
                style="width:200px"
                size="mini"
            ></el-input>
            <el-input
                v-model="searchParam.loginName"
                placeholder="账号"
                clearable
                class="filter-item"
                style="width:200px"
                size="mini"
            ></el-input>
            <el-input
                v-model="searchParam.userName"
                placeholder="用户名"
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
                @click="resetgetList()"
                size="mini"
                v-prereclick
            >搜索</el-button>
            <!-- 导出 -->
            <el-button
                v-waves
                class="filter-item"
                type="warning"
                icon="el-icon-download"
                @click="exportList()"
                size="mini"
            >导出</el-button>
            <!-- 新增 -->
            <el-button
                v-waves
                class="filter-item"
                type="success"
                icon="el-icon-plus"
                @click="addItem()"
                size="mini"
            >新增</el-button>
        </div>
        <div class="mainLayoutBox">
            <div class="layoutLeft">
                <el-table
                    :data="list"
                    border
                    fit
                    resizable
                    cell-class-name="text_hidden"
                    highlight-current-row
                    height="75vh"
                    ref="singleTable"
                    style="display:inline-block;overflow-y: scroll;"
                    @row-click="handleCurrentChange"
                >
                    <el-table-column fixed align="center" width="50" label="序号">
                        <template slot-scope="scope">
                            <span>{{scope.$index+(searchParam.pageIndex-1) *searchParam.pageSize + 1}}</span>
                        </template>
                    </el-table-column>
                    <!-- sortable="custom" -->
                    <el-table-column align="center" label="客户名称" prop="tenantName">
                        <template slot-scope="scope">
                            <span :title="scope.row.tenantName">{{ scope.row.tenantName }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column align="center" label="用户名" prop="userName">
                        <template slot-scope="scope">
                            <span :title="scope.row.userName">{{ scope.row.userName }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column align="center" label="账号" prop="loginName"></el-table-column>
                    <el-table-column align="center" label="创建时间" prop="createDate"></el-table-column>
                    <el-table-column align="center" label="操作">
                        <template slot-scope="scope">
                            <el-button
                                type="danger"
                                v-waves
                                title="删除"
                                icon="el-icon-delete"
                                @click="deleItem(scope.row.id)"
                            ></el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <pagination
                    v-show="pagination.records>0"
                    :total="pagination.records"
                    :page.sync="searchParam.pageIndex"
                    :limit.sync="searchParam.pageSize"
                    @pagination="getList"
                />
            </div>
            <div class="layoutRight">
                <div class="available" v-if="list.length>0">
                    <el-form
                        ref="dataForm"
                        :model="formData"
                        :rules="formRules"
                        label-position="right"
                        label-width="100px"
                        align="left"
                        class="demo-form-inline"
                        size="mini"
                    >
                        <el-form-item label="用户名" prop="userName">
                            <el-input v-model="formData.userName" style="width:90%"></el-input>
                        </el-form-item>
                        <el-form-item label="关联客户" prop="tenantName">
                            <el-input
                                v-model="formData.tenantName"
                                style="width:80%"
                                :disabled="true"
                            ></el-input>
                            <el-button
                                type="primary"
                                size="mini"
                                @click="selectRelation"
                                style="width:9.5%"
                            >选</el-button>
                        </el-form-item>
                        <el-form-item label="账号" prop="loginName">
                            <el-input v-model="formData.loginName" style="width:90%"></el-input>
                        </el-form-item>
                        <el-form-item label="密码" prop="passWord">
                            <el-input v-model="formData.passWord" style="width:90%"></el-input>
                        </el-form-item>
                        <el-form-item label="用户角色">
                            <el-checkbox
                                v-for="(item,index) in rolesList"
                                v-model="item.isCheck"
                                :key="index"
                                :label="item.roleName"
                                @change="getChange(item)"
                                border
                            ></el-checkbox>
                        </el-form-item>
                    </el-form>
                    <div class="boxBottomSec">
                        <el-button
                            type="primary"
                            @click="saveUser()"
                            size="mini"
                            v-waves
                            v-prereclick
                        >保 存</el-button>
                    </div>
                </div>
                <div class="notice" v-else>暂不能操作</div>
            </div>
        </div>
        <add
            v-if="createUserShow"
            :createUserVisible="createUserVisible"
            @closeCreateUser="closeCreateUser"
        ></add>
        <select-relation
            v-if="selectShow"
            :selectVisible="selectVisible"
            @closeSelect="closeSelect"
            @getRelationObject="getRelationObject"
        ></select-relation>
    </div>
</template>
<script>
import waves from "@/directive/waves"; // Waves directive;
import prereclick from "@/directive/prereclick"; // prereclick directive;
import Pagination from "@/components/Pagination";
import add from "./add";
import selectRelation from "./components/selectRelation";
import {
    getUserMnList,
    exportUserList,
    handelUser,
    getUserInfo,
    removeUser
} from "@/api/userAuthor/userMn/index";
import { getRolesSimpleList } from "@/api/resource";
export default {
    name: "userMnList",
    directives: { waves, prereclick },
    data() {
        return {
            pagination: {
                records: 0,
                pageIndex: 0,
                ageTotal: 0
            },
            searchParam: {
                userName: null,
                loginName: null,
                tenantName: null,
                IsTenantAdmin: 1,
                pageSize: 15,
                pageIndex: 1,
                sortField: "createDate",
                sortDirection: "descending"
            },
            list: [],
            formData: {
                userName: null,
                tenantName: null,
                loginName: null,
                passWord: null,
                tenantId: null,
                roles: []
            },
            formRules: {
                userName: [
                    {
                        required: true,
                        trigger: "change",
                        message: "请填写用户名"
                    }
                ],
                tenantName: [
                    {
                        required: true,
                        trigger: "change",
                        message: "请选择关联客户"
                    }
                ],
                loginName: [
                    {
                        required: true,
                        trigger: "change",
                        message: "请输入账号"
                    }
                ],
                passWord: [
                    {
                        required: true,
                        trigger: "change",
                        message: "请输入密码"
                    }
                ]
            },
            rolesList: [],
            createUserShow: false,
            createUserVisible: false,
            selectShow: false,
            selectVisible: false
        };
    },
    props: {},
    created() {
        this.getList();
    },
    watch: {
        xxxxx: {
            immediate: true,
            handler(val) {}
        }
    },
    components: {
        Pagination,
        add,
        selectRelation
    },
    methods: {
        // 搜索
        resetgetList() {
            this.searchParam.pageIndex = 1;
            this.getList();
        },
        getList() {
            getUserMnList(this.searchParam).then(res => {
                if (res.data.success) {
                    this.list = res.data.data.rows;
                    this.pagination.records = res.data.data.records;
                    //角色LIst
                    getRolesSimpleList({ ownerType: "" }).then(res => {
                        if (res.data.success) {
                            res.data.data.forEach(item => {
                                this.$set(item, "isCheck", false);
                            });
                            this.rolesList = res.data.data;
                            if (this.list.length > 0) {
                                this.handleCurrentChange(this.list[0]);
                            } else {
                                return false;
                            }
                        }
                    });
                }
            });
        },

        //选择用户
        handleCurrentChange(val) {
            this.$refs.singleTable.setCurrentRow(val);
            this.rolesList.forEach((item, index) => {
                this.$set(item, "isCheck", false);
            });
            getUserInfo({ id: val.id }).then(res => {
                if (res.data.success) {
                    this.formData = Object.assign({}, res.data.data);
                    this.rolesList.forEach((item, index) => {
                        this.formData.roles.forEach(val => {
                            if (item.roleId == val.roleId) {
                                this.$set(item, "isCheck", true);
                            }
                        });
                    });
                }
            });
        },
        // 删除用户
        deleItem(Cid) {
            this.$confirm("此操作将删除该权限, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
                center: true
            })
                .then(() => {
                    removeUser(Cid).then(res => {
                        if (res.data.success) {
                            this.$message({
                                type: "success",
                                message: "删除成功!"
                            });
                            this.getList();
                        } else {
                            this.$message.error(res.data.message);
                        }
                    });
                })
                .catch(() => {});
        },
        // 操作选择用户角色
        getChange(item) {
            // console.log(item);
            if (item.isCheck) {
                this.formData.roles.push(item);
            } else if (!item.isCheck) {
                this.formData.roles = this.rolesList.filter(val => {
                    return val.isCheck == true;
                });
            }
        },
        // 导出列表
        exportList() {
            exportUserList(this.searchParam);
        },
        // 新增用户
        addItem() {
            this.createUserShow = true;
            this.createUserVisible = true;
        },
        // 关闭创建用户
        closeCreateUser(bool) {
            this.createUserVisible = false;
            this.createUserShow = false;
            if (bool) {
                this.getList();
            }
        },
        // 选择关联客户
        selectRelation() {
            this.selectShow = true;
            this.selectVisible = true;
        },
        // 关闭选择关联客户
        closeSelect(bool) {
            this.selectVisible = false;
            this.selectShow = false;
        },
        //得到关联客户
        getRelationObject(Model) {
            this.formData = Object.assign({}, this.formData, {
                tenantId: Model.id,
                tenantName: Model.name
            });
        },
        // 保存用户
        saveUser() {
            this.$refs["dataForm"].validate(valid => {
                if (valid) {
                    handelUser(this.formData).then(res => {
                        if (res.data.success) {
                            this.$notify({
                                title: "成功",
                                message: "编辑成功",
                                type: "success",
                                duration: 2000
                            });
                            this.getList();
                        } else {
                            this.$message.error(res.data.message);
                        }
                    });
                } else {
                    return false;
                }
            });
        }
    }
};
</script>

<style lang='scss' >
.userMn {
    .mainLayoutBox {
        display: flex;
        justify-content: space-between;
        width: 100%;
        .layoutLeft {
            flex: 0.53;
            position: relative;
            .el-table {
                position: absolute;
                width: 100%;
            }
            .pagination-container {
                position: absolute;
                top: 75vh;
            }
        }
        .layoutRight {
            flex: 0.45;
            border: 1px solid #ebeef5;
            padding: 10px;
            box-sizing: border-box;
            position: relative;
            height: calc(100vh - 150px);
            .notice {
                text-align: center;
                font-size: 14px;
                color: #909399;
                height: 100%;
                line-height: calc(100vh - 150px);
            }
            .el-checkbox.is-bordered + .el-checkbox.is-bordered {
                margin-left: 0;
                margin-bottom: 10px;
            }
            .boxBottomSec {
                position: absolute;
                bottom: 0;
                left: 0;
                padding: 8px 0;
                width: 100%;
                text-align: center;
                border-top: 1px solid #ebeef5;
            }
        }
    }
}
</style>
