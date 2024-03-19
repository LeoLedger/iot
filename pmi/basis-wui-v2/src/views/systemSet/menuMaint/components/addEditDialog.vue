<template>
    <div class="dialog-container menusfix">
        <el-dialog
            :before-close="beforeClose"
            :title="str+'菜单'"
            :visible.sync="visible"
            width="900px"
        >
            <el-tabs v-model="activeName">
                <el-tab-pane
                    label="菜单配置"
                    name="first"
                >
                    <el-form
                        ref="form"
                        :model="formData"
                        :rules="formRules"
                        class="form-container"
                        label-width="100px"
                        size="mini"
                    >
                        <el-row
                            justify="center"
                            type="flex"
                        >
                            <el-col
                                :lg="24"
                                :xs="24"
                            >
                                <el-row>
                                    <el-col
                                        :span="12"
                                        :xs="24"
                                    >
                                        <el-form-item
                                            label="菜单名称"
                                            prop="name"
                                        >
                                            <el-input
                                                v-model="formData.name"
                                                clearable
                                            />
                                        </el-form-item>
                                    </el-col>
                                    <el-col
                                        :span="12"
                                        :xs="24"
                                    >
                                        <el-form-item
                                            label="上级菜单"
                                            prop="parentId"
                                        >
                                            <el-cascader
                                                v-model="formData.parentId"
                                                :options="treeData"
                                                :props="{ label: 'menuName', value: 'menuId', checkStrictly: true }"
                                                clearable
                                                filterable
                                                size="mini"
                                                style="width:100%"
                                            />
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                <el-row>
                                    <el-col
                                        :span="12"
                                        :xs="24"
                                    >
                                        <el-form-item
                                            label="URL"
                                            prop="url"
                                        >
                                            <el-input
                                                v-model="formData.url"
                                                clearable
                                            />
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                <el-row>
                                    <el-col
                                        :span="12"
                                        :xs="24"
                                    >
                                        <el-form-item
                                            label="菜单排序"
                                            prop="sortNo"
                                        >
                                            <el-input-number
                                                v-model="formData.sortNo"
                                                :min="0"
                                                style="width:100%"
                                                @change="handleChange"
                                            />
                                        </el-form-item>
                                    </el-col>
                                    <el-col
                                        :span="12"
                                        :xs="24"
                                    >
                                        <el-form-item
                                            label="icon"
                                            prop="icon"
                                        >
                                            <el-input
                                                v-model="formData.icon"
                                                clearable
                                            />
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                <el-row>
                                    <el-col
                                        :span="12"
                                        :xs="24"
                                    >
                                        <el-form-item
                                            label="路由组件Key"
                                            prop="componentKey"
                                        >
                                            <el-input
                                                v-model.trim="formData.componentKey"
                                                clearable
                                            />
                                        </el-form-item>
                                    </el-col>
                                    <el-col
                                        :span="12"
                                        :xs="24"
                                    >
                                        <el-form-item
                                            label="权限key"
                                            prop="permissionKey"
                                        >
                                            <el-input
                                                v-model="formData.permissionKey"
                                                clearable
                                                placeholder="格式：ty.iot.菜单名称.功能名称"
                                            />
                                        </el-form-item>
                                    </el-col>
                                </el-row>

                                <el-row>
                                    <el-col
                                        :span="24"
                                        :xs="24"
                                    >
                                        <el-form-item
                                            label="备注"
                                            prop="remarks"
                                        >
                                            <el-input
                                                v-model="formData.remarks"
                                                clearable
                                                rows="3"
                                                type="textarea"
                                            />
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </el-form>
                </el-tab-pane>
                <el-tab-pane
                    label="功能配置"
                    name="second"
                >
                    <div class="topTitle">
                        相关功能
                        <el-button
                            circle
                            icon="el-icon-plus"
                            size="mini"
                            style="float:right;margin-top:5px"
                            type="success"
                            @click="addBtns"
                        />
                    </div>
                    <el-table
                        :data="feature"
                        border
                        stripe
                    >
                        <!-- <el-table-column
                                        v-for="col in formData.buttonList"
                                        :prop="col.id"
                                        :key="col.id"
                                        :label="col.label"
                                        :width="col.width"
                                    ></el-table-column>-->
                        <el-table-column
                            align="center"
                            label="名称"
                            prop="name"
                            width="200"
                        >
                            <template slot-scope="scope">
                                <el-input
                                    v-model="scope.row.name"
                                    placeholder="请输入功能名称"
                                    size="mini"
                                />
                            </template>
                        </el-table-column>
                        <el-table-column
                            align="center"
                            label="编码"
                            prop="guid"
                            width="300"
                        >
                            <template slot-scope="scope">
                                <el-input
                                    v-model="scope.row.guid"
                                    :disabled="scope.row.modify"
                                    placeholder="请填写guid"
                                    size="mini"
                                    @input="guidCheck(scope.$index)"
                                />
                            </template>
                        </el-table-column>
                        <el-table-column
                            align="center"
                            label="备注"
                            prop="remarks"
                        >
                            <template slot-scope="scope">
                                <el-input
                                    v-model="scope.row.remarks"
                                    placeholder="请填写相关备注"
                                    size="mini"
                                />
                            </template>
                        </el-table-column>
                        <el-table-column
                            align="center"
                            label="操作"
                            width="70"
                        >
                            <template slot-scope="scope">
                                <el-button
                                    circle
                                    icon="el-icon-delete"
                                    size="mini"
                                    style="padding:5px"
                                    type="danger"
                                    @click="delefeature(scope.$index)"
                                />
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
            <span slot="footer">
                <el-button
                    v-waves
                    size="mini"
                    @click="simpleClose"
                >取 消</el-button>
                <el-button
                    v-prereclick
                    v-waves
                    size="mini"
                    type="primary"
                    @click="submitMenu"
                >确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
    import waves from '@/directive/waves' // Waves directive;
    import prereclick from '@/directive/prereclick' // prereclick directive;
    import {
        getMenuInfo,
        handlerMenu,
        getButtonList
    } from '@/api/systemSet/menuMataince/index'

    export default {
        name: 'Xx',
        directives: { waves, prereclick },
        components: {},
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            str: {
                type: String
            },
            appId: {
                type: [String, Number]
            },
            treeData: {
                type: Array
            },
            editId: {
                tyep: [String, Number],
                default: null
            },
            getbuttonObj: {
                type: Object,
                default() {
                    return {}
                }
            }
        },
        data() {
            return {
                formData: {
                    id: null,
                    name: null,
                    sortNo: null,
                    appId: null,
                    remarks: null,
                    url: null,
                    icon: null,
                    menuType: 0,
                    componentKey: '',
                    permissionKey: '',
                    isCreatePrivilege: false,
                    isRemovePrivilege: false,
                    parentId: [],
                    buttonList: []
                },
                feature: [],
                buttonItem: {
                    id: 0,
                    name: null,
                    remarks: null,
                    guid: null
                },
                activeName: 'first',
                formRules: {
                    name: [
                        {
                            required: true,
                            trigger: 'change',
                            message: '请填写菜单名'
                        }
                    ],
                    sortNo: [
                        {
                            required: true,
                            trigger: 'change',
                            message: '请输入菜单排序'
                        }
                    ],

                    title: [
                        {
                            required: true,
                            trigger: 'change',
                            message: '请输入菜单的title名'
                        }
                    ],
                    url: [
                        {
                            required: true,
                            trigger: 'change',
                            message: '请输入菜单的url'
                        }
                    ]
                }
            }
        },
        watch: {
            editId: {
                immediate: true,
                handler(val) {
                    if (val != null) {
                        getMenuInfo({ id: val }).then(res => {
                            if (res && res.data.success) {
                                this.formData = Object.assign(
                                    this.formData,
                                    res.data.data
                                )
                            }
                        })
                    } else {
                        return false
                    }
                }
            },
            getbuttonObj: {
                immediate: true,
                handler(val) {
                    // console.log(val)
                    if (val.menuId != null) {
                        // getButtonList(val).then(res => {
                        //     if (res && res.data.success) {
                        //         this.feature = res.data.data;
                        //         this.feature.forEach(i => {
                        //             this.$set(i, "modify", true);
                        //         });
                        //     }
                        // });
                    }
                }
            }
        },
        created() {
        },
        methods: {
            guidCheck(index) {
                const guidReg = /^[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}$/
                if (!guidReg.test(this.feature[index].guid)) {
                    this.$message.error('请输正确的guid')
                    this.feature[index].guid = null
                    return
                }
            },
            getList() {
            },
            // 确认关闭
            beforeClose() {
                this.$confirm('确认放弃本次操作？')
                    .then(_ => {
                        // done();  不能使用done 否则会直接操作模态框
                        this.$nextTick(() => {
                            this.$emit('closeMenu', false)
                            // this.$refs.form.resetFields();
                        })
                    })
                    .catch(_ => {
                        return false
                    })
            },
            // 直接关闭
            simpleClose() {
                this.$emit('closeMenu', false)
            },
            // 菜单排序
            handleChange() {
            },
            // 添加功能按钮
            addBtns() {
                this.feature.push(JSON.parse(JSON.stringify(this.buttonItem)))
            },
            // 删除功能按钮
            delefeature(index) {
                this.feature.splice(index, 1)
            },
            // 提交菜单
            submitMenu() {
                this.formData.appId = this.appId
                this.$refs['form'].validate(valid => {
                    if (valid) {
                        var emptyStr = true
                        if (this.feature.length == 0) {
                            emptyStr = false
                        } else {
                            this.feature.forEach(v => {
                                if (v.name == null) {
                                    emptyStr = true
                                } else {
                                    emptyStr = false
                                }
                            })
                        }
                        if (!emptyStr) {
                            let { permissionKey } = this.formData
                            this.formData = Object.assign(this.formData, {
                                buttonList: this.feature,
                                permissionKey: permissionKey.trim()
                            })
                            handlerMenu(this.formData).then(res => {
                                if (res.data.success) {
                                    this.$notify({
                                        title: '成功',
                                        message: this.str + '成功',
                                        type: 'success',
                                        duration: 2000
                                    })
                                    this.$emit('closeMenu', true)
                                } else {
                                    this.$notify({
                                        title: '失败',
                                        message: '数据验证失败',
                                        type: 'warning',
                                        duration: 2000
                                    })
                                }
                            })
                        } else {
                            this.$message.warning('您有功能配置未完善')
                        }
                    } else {
                        return false
                    }
                })
            }
        }
    }
</script>

<style lang='scss'>
    .menusfix {
        .el-tabs__header {
            margin-bottom: 8px;
        }

        .el-tabs__content {
            height: 400px;
            overflow-y: auto;
        }
    }
</style>
