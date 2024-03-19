<template>
    <div>
        <el-dialog
            :visible.sync="visible"
            :before-close="handleCancel"
            :close-on-click-modal="false"
            :title="dialogTitle"
            width="800px"
            append-to-body
            class="not-padding"
        >
            <div class="layout-detail-container">
                <div class="greyLabel">
                    <div class="greyLabel-title">基础信息</div>
                </div>
                <BaseForm
                    v-loading="loading"
                    v-if="visible"
                    ref="BaseForm"
                    :form-data="formModel"
                    :is-edit="true"
                    :extend-params="extendParams"
                    @customerChange="handleCustomerChange"
                    @managerUserChange="handleManagerUserChange"
                />
                <div class="greyLabel">
                    <div class="greyLabel-title">服务企业标段成员</div>
                    <div>
                        <el-button type="success" size="mini" icon="el-icon-plus" @click="onClickAddMember">添加人员</el-button>
                    </div>
                </div>
                <SectionMember
                    v-loading="loading"
                    v-if="visible"
                    ref="ProjectMember"
                    :is-edit="true"
                    :data-list="memberList"
                    :data-id="dataId"
                    @delete="handleDelete"/>
            </div>
            <span slot="footer">
                <el-button size="mini" @click="handleCancel">取 消</el-button>
                <el-button v-prereclick :loading="loading" size="mini" type="primary" @click="handleSubmit">提 交</el-button>
            </span>
        </el-dialog>
        <AddMemberDialog
            v-if="addMemberDialog.visible"
            :visible="addMemberDialog.visible"
            :extend-params="extendParams"
            :excludes="memberList"
            @close="addMemberDialog.visible = false"
            @confirm="handleAddMember"
        />
    </div>
</template>

<script>
    import BaseForm from '@/views/PM/section/components/BaseForm'
    import SectionMember from '@/views/PM/section/components/SectionMember'
    import sectionApi from '@/api/PM/section'
    import AddMemberDialog from '@/views/PM/section/components/AddMemberDialog'
    import moment from 'moment'
    export default {
        name: 'EditDialog',
        components: { AddMemberDialog, SectionMember, BaseForm },
        props: {
            dataId: {
                type: String,
                default: null
            },
            isCreate: {
                type: Boolean,
                default: false
            },
            visible: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                formModel: {},
                memberList: [],
                originMemberList: [],
                loading: false,
                addMemberDialog: {
                    visible: false
                },
                extendParams: {
                    type: 0,
                    lockedCustomer: true
                }
            }
        },
        computed: {
            dialogTitle() {
                return this.isCreate ? '添加标段' : '编辑标段信息'
            }
        },
        watch: {
            dataId() {
                this.init()
            }
        },
        mounted() {
            this.init()
        },
        methods: {
            init() {
                if (!this.isCreate) {
                    this.getDetail()
                } else {
                    this.formModel = {}
                    this.memberList = []
                    this.originMemberList = []
                }
            },
            getDetail() {
                if (this.dataId) {
                    this.loading = true
                    sectionApi.detail(this.dataId).then(res => {
                        if (res.success) {
                            this.formModel = res.data
                            // 处理周期字段
                            let _period = []
                            if (res.data.startDate && res.data.endDate) {
                                _period = [res.data.startDate, res.data.endDate]
                            }
                            // 处理坐标字段
                            let point = {}
                            if (res.data.latitude && res.data.longitude) {
                                point = { lat: res.data.latitude, lng: res.data.longitude }
                            }
                            // 初始化联系人窗口需要的参数
                            this.extendParams = {
                                ...this.extendParams,
                                customerId: this.formModel.customerId,
                                customerName: this.formModel.customerName,
                                lockedCustomer: true
                            }
                            this.formModel = { ...res.data, _period, point: point }
                            this.memberList = Object.assign([], res.data.list)
                        }
                        setTimeout(() => {
                            this.loading = false
                        }, 500)
                    })
                }
            },
            onClickAddMember() {
                const formData = this.$refs.BaseForm.getFormData()
                // 检查表单 初始值 是否选择了服务企业
                if (!formData.customerId && !this.formModel.customerId) {
                    return this.$message({ type: 'warning', message: '请先选择服务企业' })
                }
                this.extendParams = {
                    ...this.extendParams,
                    customerId: this.formModel.customerId || formData.customerId,
                    customerName: this.formModel.customerName || formData.customerName
                }
                this.addMemberDialog.visible = true
            },
            handleCustomerChange(list) {
                if (list && list[0]) {
                    // 重置项目经理
                    const formData = this.$refs.BaseForm.getFormData()
                    if (formData.projectManagerUserId) {
                        formData.projectManagerUserId = null
                        formData.projectManagerUserName = null
                    }
                    this.formModel = Object.assign({}, this.formModel, formData)
                    // 重置联系人选择器所需的参数
                    this.extendParams = {
                        ...this.extendParams,
                        customerId: formData.customerId,
                        customerName: formData.customerName,
                        lockedCustomer: true
                    }
                    // 清空原标段成员并存储
                    if (this.memberList && this.memberList.length) {
                        this.originMemberList = Object.assign([], this.memberList)
                        this.originMemberList.map(item => {
                            item.dbStatus = true
                        })
                        this.memberList = []
                        // 弹出提醒
                        this.$notify({ title: '标段成员重置', message: '由于您变更了服务企业, 已清空标段成员, 请重新选择', type: 'info', duration: 3000 })
                    }
                }
            },
            // 项目经理变更后自动将项目经理添加至标段成员
            handleManagerUserChange(people) {
                // 判断memberList中是否有当前people
                if (this.memberList && this.memberList.length) {
                    //
                    let allowAdd = true
                    this.memberList.map(item => {
                        if (item.memberUserId === people.memberUserId) {
                            allowAdd = false
                        }
                    })
                    if (allowAdd) {
                        this.memberList.push(people)
                    }
                } else {
                    this.memberList.push(people)
                }
            },
            // 成员变更后自动更新成员列表
            handleAddMember(people) {
                people.dbStatus = false
                this.memberList.push(people)
            },
            handleSubmit() {
                this.loading = true
                this.$refs.BaseForm.submit((data) => {
                    console.log('params', params)
                    if (data.point) {
                        data.latitude = data.point.lat
                        data.longitude = data.point.lng
                    }
                    const params = { ...this.formModel, ...data, list: this.memberList.concat(this.originMemberList) }
                    // 判断是否有id,如果没有则禁止提交   // 判断是否有id,如果没有则禁止提交
                    if (!params.id && !this.isCreate) {
                        return this.$message({ type: 'warning', message: '提交异常' })
                    }
                    // 如果是修改, 判断成员列表里是否有 无id 且 dbStatus 为 true 的数据
                    if (!this.isCreate && params.list && params.list.length) {
                        params.list.map((item, index) => {
                            if (!item.id && item.dbStatus === true) {
                                params.list.splice(index, 1)
                            }
                        })
                    }
                    sectionApi.update(params).then(res => {
                        if (res.success) {
                            this.$notify({
                                title: '保存成功',
                                message: res.msg,
                                type: 'success',
                                duration: 2000
                            })
                            this.$emit('confirm')
                        }
                    }).finally(() => {
                        this.loading = false
                    })
                }, () => {
                    this.loading = false
                })
            },
            handleCancel() {
                this.$emit('close', false)
            },
            handleDelete(index, row) {
                this.$confirm('是否确认删除?', '警告', {
                    confirmButtonText: '删除',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                }).then(() => {
                    // 如果是创建模式,直接删,如果是修改模式,则将dbStatus改为true
                    if (this.isCreate) {
                        this.memberList.splice(index, 1)
                    } else {
                        this.$set(row, 'dbStatus', true)
                    }
                }).catch(() => {})
            }
        }
    }
</script>

<style scoped lang="scss">
.layout-detail-container {
  height: 600px;
}
.greyLabel {
  background-color: #f5f7fa;
  padding: 0 10px;
  height: 35px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
.greyLabel-title {
  font-size: 13px;
  &:before {
    height: 10px;
    content: '';
    width:0;
    border-left: 3px solid #2abeff;
    margin-right: 10px;
   }
  }
}
</style>
