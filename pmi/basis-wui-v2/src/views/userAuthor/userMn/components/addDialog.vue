<!--
* @description 新增租户
* @fileName addDialog.vue
* @author 叶金龙
* @date 2019/06/14 09:54:31
* @version V1.0.0
!-->
<template>
    <div class="dialog-container createUser">
        <el-dialog title="创建用户" :visible.sync="visible" width="800px" :before-close="beforeClose">
            <el-form
                ref="form"
                :rules="formRules"
                :model="formData"
                label-width="120px"
                class="form-container"
                size="mini"
            >
                <el-row type="flex" justify="center">
                    <el-col :xs="24" :lg="24">
                        <el-row>
                            <el-col :xs="24" :span="24">
                                <el-form-item label="用户名" prop="userName">
                                    <el-input v-model="formData.userName" style="width:90%" />
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :xs="24" :span="24">
                                <el-form-item label="关联客户" prop="name">
                                    <el-input
                                        v-model="formData.name"
                                        style="width:80.5%"
                                        :disabled="true"
                                    />
                                    <el-button
                                        type="primary"
                                        size="mini"
                                        style="width:8.5%"
                                        @click="selectRelation"
                                    >
                                        选
                                    </el-button>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :xs="24" :span="24">
                                <el-form-item label="账号" prop="loginName">
                                    <el-input v-model="formData.loginName" style="width:90%" />
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :xs="24" :span="24">
                                <el-form-item label="密码" prop="passWord">
                                    <el-input v-model="formData.passWord" style="width:90%" />
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :xs="24" :span="24">
                                <el-form-item label="用户角色" class="checkBoxContainer">
                                    <el-checkbox
                                        v-for="(item,index) in rolesList"
                                        :key="index"
                                        v-model="item.isCheck"
                                        :label="item.roleName"
                                        border
                                        @change="getChange(item)"
                                    />
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-col>
                </el-row>
            </el-form>
            <span slot="footer">
                <el-button v-waves size="mini" @click="simpleClose">取 消</el-button>
                <el-button v-waves v-prereclick type="primary" size="mini" @click="submitUser">确 定</el-button>
            </span>
        </el-dialog>
        <select-relation
            v-if="selectShow"
            :select-visible="selectVisible"
            @closeSelect="closeSelect"
            @getRelationObject="getRelationObject"
        />
    </div>
</template>

<script>

    import selectRelation from './selectRelation'
    import { handelUser } from '@/api/userAuthor/userMn/index'
    import { getRolesSimpleList } from '@/api/resource'
    export default {
        name: 'Xx',
        components: { selectRelation },
        props: {
            visible: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                pagination: {
                    records: 0,
                    pageIndex: 0,
                    ageTotal: 0
                },
                searchParam: {},
                formData: {
                    id: 0,
                    userName: null,
                    name: null,
                    loginName: null,
                    passWord: null,
                    tenantId: null,
                    roles: []
                },
                selectShow: false,
                selectVisible: false,
                rolesList: [],
                formRules: {
                    userName: [
                        {
                            required: true,
                            trigger: 'change',
                            message: '请填写用户名'
                        }
                    ],
                    name: [
                        {
                            required: true,
                            trigger: 'change',
                            message: '请选择关联客户'
                        }
                    ],
                    loginName: [
                        {
                            required: true,
                            trigger: 'change',
                            message: '请输入账号'
                        }
                    ],
                    passWord: [
                        {
                            required: true,
                            trigger: 'change',
                            message: '请输入密码'
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
        created() {
            this.getRoles()
        },
        methods: {
            // 角色LIst
            getRoles() {
                getRolesSimpleList({ ownerType: '' }).then(res => {
                    if (res.data.success) {
                        res.data.data.forEach(item => {
                            this.$set(item, 'isCheck', false)
                        })
                        this.rolesList = res.data.data
                    }
                })
            },

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

            // 选择关联客户
            selectRelation() {
                this.selectShow = true
                this.selectVisible = true
            },
            // 关闭选择关联客户
            closeSelect(bool) {
                this.selectVisible = false
                this.selectShow = false
            },
            // 得到关联客户
            getRelationObject(Model) {
                this.formData = Object.assign({}, this.formData, {
                    tenantId: Model.id,
                    name: Model.name,
                    id: 0
                })
            },
            // 操作选择用户角色
            getChange(item) {
                console.log(item)
                if (item.isCheck) {
                    this.formData.roles.push(item)
                    console.log(this.formData.roles)
                } else if (!item.isCheck) {
                    this.formData.roles = this.rolesList.filter(val => {
                        return val.isCheck == true
                    })
                }
            },
            // 提交用户
            submitUser() {
                this.$refs['form'].validate(valid => {
                    if (valid) {
                        handelUser(this.formData).then(res => {
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
.createUser {
    .checkBoxContainer {
        max-height: 500px;
        overflow-y: scroll;
        .el-checkbox.is-bordered + .el-checkbox.is-bordered {
            margin-left: 0;
            margin-bottom: 10px;
        }
    }
}
</style>
