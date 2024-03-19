<!--
* @description
* @fileName addDialog.vue
* @author 叶金龙
* @date 2019/06/17 11:16:41
* @version V1.0.0
!-->
<template>
    <div class="dialog-container">
        <el-dialog title="新增角色" :visible.sync="visible" width="800px" :before-close="beforeClose">
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
                <el-row type="flex" justify="center">
                    <el-col :xs="24" :lg="24">
                        <el-row>
                            <el-col :xs="24" :span="24">
                                <el-form-item label="角色名称" prop="roleName">
                                    <el-input
                                        v-model="formData.roleName"
                                        style="width:80%"
                                        clearable
                                    />
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :xs="24" :span="24">
                                <el-form-item label="类型" prop="roleTypeId">
                                    <el-select
                                        v-model="formData.roleTypeId"
                                        class="filter-item"
                                        filterable
                                        clearable
                                        placeholder="角色类型"
                                        size="mini"
                                        style="width:80%"
                                    >
                                        <el-option
                                            v-for="item in rolesType"
                                            :key="item.id"
                                            :label="item.name"
                                            :value="item.id"
                                        />
                                    </el-select>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :xs="24" :span="24">
                                <el-form-item label="角色归属" prop="ownerType">
                                    <el-select
                                        v-model="formData.ownerType"
                                        class="filter-item"
                                        filterable
                                        clearable
                                        placeholder="角色归属"
                                        size="mini"
                                        style="width:80%"
                                    >
                                        <el-option
                                            v-for="item in ownerTypeEnum"
                                            :key="item.value"
                                            :label="item.text"
                                            :value="item.value"
                                        />
                                    </el-select>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :xs="24" :span="24">
                                <el-form-item label="包含权限">
                                    <el-input
                                        v-model="formData.privilegeList.length"
                                        style="width:15%"
                                        :disabled="true"
                                    />
                                    <el-button
                                        type="primary"
                                        size="mini"
                                        icon="el-icon-setting"
                                        @click="fixRoles"
                                    >
                                        配置权限
                                    </el-button>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :xs="24" :span="24">
                                <el-form-item label="备注" prop="remarks">
                                    <el-input
                                        v-model="formData.remarks"
                                        type="textarea"
                                        style="width:80%"
                                        rows="3"
                                    />
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-col>
                </el-row>
            </el-form>
            <span slot="footer">
                <el-button v-waves v-prereclick size="mini" @click="simpleClose">取 消</el-button>
                <el-button v-prereclick type="primary" size="mini" @click="submitRole">确 定</el-button>
            </span>
        </el-dialog>
        <fix-roles-dialog
            v-if="fixRolesShow"
            :fix-role-visible="fixRoleVisible"
            :privilege-arr="privilegeArr"
            @closeFixRoles="closeFixRoles"
        />
    </div>
</template>

<script>

    import fixRolesDialog from './fixRoleDialog'
    import { handelRole } from '@/api/userAuthor/rolesMn/index'
    export default {
        name: 'Xx',
        components: {
            fixRolesDialog
        },
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            rolesType: {
                type: Array
            },
            ownerTypeEnum: {
                type: Array
            }
        },
        data() {
            return {
                searchParam: {},
                formData: {
                    id: 0,
                    roleName: null,
                    roleTypeId: null,
                    ownerType: null,
                    remarks: null,
                    privilegeList: []
                },
                privilegeArr: [],
                fixRolesShow: false,
                fixRoleVisible: false,
                formRules: {
                    roleName: [
                        {
                            required: true,
                            trigger: 'change',
                            message: '请输入角色名称'
                        }
                    ],
                    roleTypeId: [
                        {
                            required: true,
                            trigger: 'change',
                            message: '请选择角色类型'
                        }
                    ],
                    ownerType: [
                        {
                            required: true,
                            trigger: 'change',
                            message: '请选择角色归属'
                        }
                    ]
                }
            }
        },
        watch: {
            xxxxx: {
                immediate: true,
                handler(val) {}
            }
        },
        created() {},
        methods: {
            // 确认关闭
            beforeClose() {
                this.$confirm('确认放弃本次操作？')
                    .then(_ => {
                        // done();  不能使用done 否则会直接操作模态框
                        this.$nextTick(() => {
                            this.$emit('closeCreate', false)
                            this.$refs.form.resetFields()
                        })
                    })
                    .catch(_ => {
                        return false
                    })
            },
            // 直接关闭
            simpleClose() {
                this.$emit('closeCreate', false)
            },
            // 权限配置
            fixRoles() {
                this.fixRolesShow = true
                this.fixRoleVisible = true
                this.privilegeArr = this.formData.privilegeList.concat()
            },
            // 关闭权限配置
            closeFixRoles(model) {
                this.fixRoleVisible = false
                this.fixRolesShow = false
                if (model.flag) {
                    this.formData.privilegeList = model.arr
                } else {
                    this.privilegeArr = []
                }
            },

            // 提交角色
            submitRole() {
                this.$refs['form'].validate(valid => {
                    if (valid) {
                        handelRole(this.formData).then(res => {
                            if (res.data.success) {
                                this.$notify({
                                    title: '成功',
                                    message: '创建成功',
                                    type: 'success',
                                    duration: 2000
                                })
                                this.$emit('closeCreate', true)
                            } else {
                                this.$message.error(res.data.message)
                            }
                        })
                    } else {
                        return false
                    }
                })
            }
        }
    }
</script>

<style lang='scss'>
</style>
