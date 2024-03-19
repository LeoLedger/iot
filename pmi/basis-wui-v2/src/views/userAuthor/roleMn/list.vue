
<!--
* @description 角色管理
* @fileName list.vue
* @author 叶金龙
* @date 2019/06/13 17:11:13
* @version V1.0.0
!-->
<template>
    <div class="app-container rolesMn">
        <div class="filter-container">
            <el-select
                class="filter-item"
                filterable
                clearable
                v-model="searchParam.typeId"
                placeholder="角色类型"
                size="mini"
                style="width:250px"
            >
                <el-option
                    v-for="item in rolesType"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                ></el-option>
            </el-select>
            <el-select
                class="filter-item"
                filterable
                clearable
                v-model="searchParam.ownerType"
                placeholder="角色归属"
                size="mini"
                style="width:250px"
            >
                <el-option
                    v-for="item in ownerTypeEnum"
                    :key="item.value"
                    :label="item.text"
                    :value="item.value"
                ></el-option>
            </el-select>
            <el-input
                v-model="searchParam.roleId"
                placeholder="角色ID(仅支持guid格式)"
                clearable
                class="filter-item"
                style="width:250px"
                size="mini"
            ></el-input>
            <el-input
                v-model="searchParam.name"
                placeholder="角色名称"
                clearable
                class="filter-item"
                style="width:250px"
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
                    ref="singleTable"
                    :data="list"
                    border
                    fit
                    resizable
                    highlight-current-row
                    height="75vh"
                    style="display:inline-block;overflow-y: scroll;"
                    @row-click="handleCurrentChange"
                >
                    <el-table-column fixed align="center" width="50" label="序号">
                        <template slot-scope="scope">
                            <span>{{scope.$index+(searchParam.pageIndex-1) *searchParam.pageSize + 1}}</span>
                        </template>
                    </el-table-column>
                    <!-- sortable="custom" -->
                    <el-table-column align="center" label="角色名称" prop="roleName" width="100"></el-table-column>
                    <el-table-column align="center" label="角色ID" prop="roleId" width="280">
                        <template slot-scope="scope">
                            <span :title="scope.row.roleId">{{ scope.row.roleId }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column align="center" label="角色归属" prop="roleId">
                        <template slot-scope="scope">{{ownerTypeEnum[scope.row.ownerType].text}}</template>
                    </el-table-column>
                    <el-table-column align="center" label="类型" prop="roleType" width="100"></el-table-column>
                    <el-table-column align="center" label="创建时间" prop="createDate" width="150"></el-table-column>
                    <el-table-column align="center" label="操作" fixed="right">
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
                        ref="form"
                        :model="formData"
                        :rules="formRules"
                        label-position="right"
                        label-width="100px"
                        align="left"
                        class="demo-form-inline"
                        size="mini"
                    >
                        <el-form-item label="角色ID" prop="roleId">
                            <el-input v-model="formData.roleId" style="width:90%" :disabled="true"></el-input>
                        </el-form-item>
                        <el-form-item label="角色名称" prop="roleName">
                            <el-input v-model="formData.roleName" clearable style="width:90%"></el-input>
                        </el-form-item>
                        <el-form-item label="类型" prop="roleTypeId">
                            <el-select
                                class="filter-item"
                                filterable
                                clearable
                                v-model="formData.roleTypeId"
                                placeholder="角色类型"
                                size="mini"
                                style="width:90%"
                            >
                                <el-option
                                    v-for="item in rolesType"
                                    :key="item.id"
                                    :label="item.name"
                                    :value="item.id"
                                ></el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item label="角色归属" prop="ownerType">
                            <el-select
                                class="filter-item"
                                filterable
                                clearable
                                v-model="formData.ownerType"
                                placeholder="角色归属"
                                size="mini"
                                style="width:90%"
                            >
                                <el-option
                                    v-for="item in ownerTypeEnum"
                                    :key="item.value"
                                    :label="item.text"
                                    :value="item.value"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="包含权限">
                            <el-input
                                v-model="formData.privilegeList.length"
                                style="width:18%;text-align:center;"
                                clearable
                                :disabled="true"
                            ></el-input>
                            <el-button
                                type="primary"
                                size="mini"
                                @click="fixAuth"
                                icon="el-icon-setting"
                            >配置权限</el-button>
                        </el-form-item>
                        <el-form-item label="备注" prop="remarks">
                            <el-input
                                type="textarea"
                                v-model="formData.remarks"
                                style="width:90%"
                                rows="3"
                            ></el-input>
                        </el-form-item>
                    </el-form>
                    <div class="boxBottomSec">
                        <el-button
                            type="primary"
                            @click="saveRoles()"
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
            v-if="createRoleShow"
            :createRoleVisible="createRoleVisible"
            :rolesType="rolesType"
            :ownerTypeEnum="ownerTypeEnum"
            @closeCreateRole="closeCreateRole"
        ></add>
        <fix-roles-dialog
            v-if="fixRolesShow"
            :fixRoleVisible="fixRoleVisible"
            :privilegeArr="privilegeArr"
            @closeFixRoles="closeFixRoles"
        ></fix-roles-dialog>
        <!-- @getPermissionList="getPermissionList" -->
    </div>
</template>
<script>
import waves from "@/directive/waves"; // Waves directive;
import prereclick from "@/directive/prereclick"; // prereclick directive;
import Pagination from "@/components/Pagination";
import add from "./add";
import fixRolesDialog from "./components/fixRoleDialog";
import { getRoleType } from "@/api/resource";
import {
    getRolesList,
    exportRolesList,
    getRoleInfo,
    handelRole,
    removeRoles
} from "@/api/userAuthor/rolesMn/index";
import enums from "@/utils/enum";
export default {
    name: "roleMnList",
    directives: { waves, prereclick },
    data() {
        return {
            ownerTypeEnum: enums.ownerTypeEnum,
            pagination: {
                records: 0,
                pageIndex: 0,
                ageTotal: 0
            },
            searchParam: {
                roleId: null,
                name: null,
                typeId: null,
                ownerType: null,
                pageSize: 15,
                pageIndex: 1,
                sortField: "createDate",
                sortDirection: "descending"
            },
            list: [],
            formData: {
                id: null,
                roleId: null,
                roleName: null,
                ownerType: null,
                roleTypeId: null,
                remarks: null,
                privilegeList: []
            },
            rolesType: [],
            privilegeArr: [],
            formRules: {
                roleName: [
                    {
                        required: true,
                        trigger: "change",
                        message: "请输入角色名称"
                    }
                ],
                roleTypeId: [
                    {
                        required: true,
                        trigger: "change",
                        message: "请选择角色类型"
                    }
                ],
                ownerType: [
                    {
                        required: true,
                        trigger: "change",
                        message: "请选择角色归属"
                    }
                ]
            },
            createRoleShow: false,
            createRoleVisible: false,
            selectShow: false,
            selectVisible: false,
            fixRolesShow: false,
            fixRoleVisible: false
        };
    },
    props: {},
    created() {
        this.getList();
        this.getType();
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
        fixRolesDialog
    },
    methods: {
        // 搜索
        resetgetList() {
            this.searchParam.pageIndex = 1;
            this.getList();
        },
        getList() {
            getRolesList(this.searchParam).then(res => {
                if (res.data.success) {
                    this.list = res.data.data.rows;
                    this.pagination.records = res.data.data.records;
                    if (this.list.length > 0) {
                        this.handleCurrentChange(this.list[0]);
                    } else {
                        return false;
                    }
                }
            });
        },
        //获取角色类型
        getType() {
            getRoleType().then(res => {
                this.rolesType = res.data;
            });
        },
        //  var reg = new RegExp(/^[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}$/);
        //   if (reg.test(testID)) {
        //       return true;
        //   }
        //   return false;
        // 导出列表
        exportList() {
            exportRolesList(this.searchParam);
        },
        // 删除角色
        deleItem(Cid) {
            this.$confirm("此操作将删除该角色, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
                center: true
            })
                .then(() => {
                    removeRoles({ id: Cid }).then(res => {
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
        //选择用户
        handleCurrentChange(val) {
            this.$refs.singleTable.setCurrentRow(val);
            getRoleInfo({ id: val.id }).then(res => {
                if (res.data.success) {
                    this.formData = Object.assign({}, res.data.data);
                }
            });
        },
        // 新增角色
        addItem() {
            this.createRoleShow = true;
            this.createRoleVisible = true;
        },
        // 关闭创建用户
        closeCreateRole(bool) {
            this.createRoleVisible = false;
            this.createRoleShow = false;
            if (bool) {
                this.getList();
            }
        },
        // 配置权限
        fixAuth() {
            this.fixRolesShow = true;
            this.fixRoleVisible = true;
            this.privilegeArr = this.formData.privilegeList.concat();
        },
        // 关闭权限配置
        closeFixRoles(model) {
            this.fixRoleVisible = false;
            this.fixRolesShow = false;
            if (model.flag) {
                this.formData.privilegeList = model.arr;
            } else {
                this.privilegeArr = [];
            }
        },
        // 保存用户
        saveRoles() {
            this.$refs["form"].validate(valid => {
                if (valid) {
                    handelRole(this.formData).then(res => {
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

<style lang='scss'>
.rolesMn {
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
