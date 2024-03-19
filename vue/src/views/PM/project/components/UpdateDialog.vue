<!--
* @description 项目信息
* @author yc
!-->
<template>
    <div>
        <el-dialog
            :visible="visible"
            :title="title"
            :before-close="handleDialogClose"
            :close-on-click-modal="false"
            width="800px"
            class="not-padding"
            append-to-body
        >
            <div v-loading="loading" class="project-info">
                <el-tabs v-model="tabActiveName" class="layout-tabs">
                    <el-tab-pane name="1" label="基础信息">
                        <div class="container">
                            <BaseForm
                                ref="BaseForm"
                                :form-data="formData"
                                :is-create="isCreate"
                                is-edit
                                @member-update="addProjectMember"
                            />
                        </div>
                    </el-tab-pane>
                    <el-tab-pane name="2" label="项目成员">
                        <div class="container">
                            <ProjectMember
                                ref="ProjectMember"
                                :data-list="peopleList"
                                @delete="handleMenberDelete"
                            />
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </div>
            <span v-if="isEdit" slot="footer">
                <el-button v-if="tabActiveName === '2'" :loading="loading" type="success" size="mini" icon="el-icon-plus" @click="addPeopleVisible = true">添加人员</el-button>
                <el-button :loading="loading" size="mini" @click="$emit('update:visible', false)">取 消</el-button>
                <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit">提 交</el-button>
            </span>
        </el-dialog>
        <!-- 添加人员 -->
        <el-dialog
            v-if="addPeopleVisible"
            :visible="addPeopleVisible"
            :close-on-click-modal="false"
            title="添加人员"
            width="420px"
            append-to-body
            @close="handleAddPeopleClose"
        >
            <div class="add-people">
                <el-form ref="AddPeopleForm" :model="peopleFormData" label-width="72px">
                    <el-row>
                        <el-col :span="24">
                            <el-form-item :rules="[{ required: true, message: '请选择项目成员', trigger: 'change' }]" label="项目成员" prop="memberUserId">
                                <DialogPick
                                    v-model="peopleFormData"
                                    :params="peoplePickParams"
                                    type="people"
                                    @change="handlePeoplePickChange"
                                />
                            </el-form-item>
                        </el-col>
                        <el-col :span="24">
                            <el-form-item :rules="[{ required: true, message: '请选择人员类型', trigger: 'change' }]" label="人员类型" prop="memberType">
                                <DictSelect
                                    v-model="peopleFormData.memberType"
                                    type="peopleType"
                                    placeholder="请选择人员类型"
                                    size="mini"
                                />
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
            </div>
            <span v-if="isEdit" slot="footer">
                <el-button size="mini" @click="handleAddPeopleClose">取 消</el-button>
                <el-button v-prereclick type="primary" size="mini" @click="handleAddPeopleDialogSubmit">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    // API
    import projectApi from '@/api/PM/project'
    // 方法
    // 组件
    import BaseForm from './BaseForm'
    import ProjectMember from './ProjectMember'
    import DialogPick from '@/components/customizeFormItem/DialogPick'

    export default {
        name: 'UpdateDialog',
        components: {
            BaseForm,
            ProjectMember,
            DialogPick
        },
        props: {
            visible: { type: Boolean, default: false },
            isEdit: { type: Boolean, default: false },
            dataId: { type: [Number, String] }
        },
        data() {
            return {
                loading: false,
                formData: {},
                peopleList: [],
                peopleFormData: {
                    memberType: '',
                    memberName: '',
                    memberUserId: ''
                },
                peoplePickParams: {
                    prop: 'memberName',
                    title: '选择成员',
                    formKey: 'memberUserId',
                    excludes: []
                },
                activePeople: null,
                tabActiveName: '1',
                addPeopleVisible: false
            }
        },
        computed: {
            title() {
                return this.dataId ? '编辑项目' : '新增项目'
            },
            isCreate() {
                return !this.dataId
            }
        },
        watch: {
            dataId: {
                immediate: true,
                handler() {
                    this.queryBaseInfo()
                }
            },
            peopleList: {
                deep: true,
                immediate: true,
                handler(list) {
                    this.peoplePickParams.excludes = list.filter(v => !v.dbStatus).map(item => item.memberUserId)
                }
            }
        },
        mounted() {
        },
        methods: {
            // 获取基础信息
            async queryBaseInfo() {
                if (this.dataId) {
                    this.loading = true
                    var { data } = await projectApi.detail(this.dataId)
                    var _region = []
                    var _period = []
                    if (data.provinceId) _region.push(data.provinceId)
                    if (data.cityId) _region.push(data.cityId)
                    if (data.areaId) _region.push(data.areaId)
                    if (data.startDate && data.endDate) {
                        _period = [data.startDate, data.endDate]
                    }
                    this.formData = {
                        ...data,
                        _region,
                        _period
                    }
                    this.peopleList = (data.list || [])
                    this.loading = false
                }
            },
            // 添加成员
            addProjectMember({ data, formData, replaceId }) {
                // 判断该人员是否已在当前项目中
                var index = this.peopleList.findIndex(v => v.memberUserId === data.userId)
                var replaceIndex = this.peopleList.findIndex(v => v.memberUserId === replaceId)
                if (index > -1) {
                    // 如果已存在该人员，替换该人员
                    this.$set(this.peopleList, index, data)
                    // 同时删除取代的人员
                    if (replaceIndex > -1) {
                        this.peopleList.splice(replaceIndex, 1)
                    }
                } else {
                    // 如果该人员不在该项目中
                    if (replaceIndex > -1) {
                        this.$set(this.peopleList, replaceIndex, data)
                    } else {
                        this.peopleList.push(data)
                    }
                }
                this.formData = {
                    ...this.formData,
                    ...formData
                }
            },
            // 删除成员是触发
            handleMenberDelete(index) {
                var data = this.peopleList[index]
                // 如果该人员是项目经理，则清空清空项目经理
                if (data.memberUserId === this.formData.projectManagerUserId) {
                    this.formData.projectManagerUserId = ''
                    this.formData.projectManagerUserName = ''
                }
                // 如果该人员是销售经理，则清空清空销售经理
                if (data.memberUserId === this.formData.saleManagerUserId) {
                    this.formData.saleManagerUserId = ''
                    this.formData.saleManagerUserName = ''
                }
                this.peopleList.splice(index, 1)
            },
            // 点击提交按钮时触发
            handleSubmit() {
                this.loading = true
                this.$refs.BaseForm.submit((data) => {
                    projectApi.update({
                        ...this.formData,
                        ...data,
                        list: this.peopleList
                    }).then(res => {
                        if (res.success) {
                            this.$notify({
                                title: '保存成功',
                                message: res.msg,
                                type: 'success',
                                duration: 2000
                            })
                            this.$emit('update')
                            this.$emit('update:visible', false)
                        }
                    }).finally(() => {
                        this.loading = false
                    })
                }, () => {
                    this.loading = false
                })
            },
            // 弹窗关闭时触发
            handleDialogClose() {
                this.$confirm('确认放弃本次操作？').then(_ => {
                    this.$emit('update:visible', false)
                }).catch(_ => {
                    return false
                })
            },
            // 添加人员弹窗关闭时触发
            handleAddPeopleClose() {
                this.addPeopleVisible = false
                // 还原添加人员表单
                Object.keys(this.peopleFormData).forEach(key => {
                    this.peopleFormData[key] = ''
                })
            },
            // 选择人员时触发
            handlePeoplePickChange(list) {
                this.activePeople = list[0]
            },
            // 点击确认添加人员按钮时触发
            handleAddPeopleDialogSubmit() {
                this.$refs.AddPeopleForm.validate(valid => {
                    if (valid) {
                        this.activePeople = {
                            ...this.activePeople,
                            ...this.peopleFormData
                        }
                        this.peopleList.push(this.activePeople)
                        this.handleAddPeopleClose()
                    }
                })
            }
        }
    }
</script>

<style lang='scss' scoped>
.project-info {
    padding: 0 10px 15px 15px;
    .container{
        height: 480px;
        padding-right: 5px;
    }
}
</style>
