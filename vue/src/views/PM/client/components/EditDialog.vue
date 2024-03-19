
<!--
* @description 客户编辑/添加
* @fileName editDialog.vue
* @author 望浩然
-->
<template>
    <div>
        <!-- 添加客户 -->
        <el-dialog
            v-if="visible"
            :visible.sync="visible"
            :before-close="handleCancel"
            :close-on-click-modal="false"
            :title="dialogTitle"
            class="not-padding"
            width="800px"
            append-to-body
        >
            <div class="layout-detail-container">
                <BaseForm
                    v-if="visible"
                    ref="BaseForm"
                    :is-edit="true"
                    :is-create="isCreate"
                    :form-data="defaultFormModel"
                    :rel-dept-id="defaultFormModel.relDeptId"/>
            </div>
            <span slot="footer">
                <el-button v-if="isCreate" :loading="loading" size="mini" type="primary" @click="handleMore">保存并添加客户联系人</el-button>
                <el-button size="mini" @click="handleCancel">取 消</el-button>
                <el-button v-prereclick :loading="loading" size="mini" type="primary" @click="handleSubmit">保  存</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import BaseForm from '@/views/PM/client/components/BaseForm'
    import customerApi from '@/api/PM/customer'
    export default {
        name: 'EditDialog',
        components: { BaseForm },
        props: {
            dataId: {
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
                defaultFormModel: {},
                finallyFormModel: {},
                loading: false
            }
        },
        computed: {
            dialogTitle() {
                return this.isCreate ? '添加客户' : '编辑客户信息'
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
                    this.defaultFormModel = {}
                    this.finallyFormModel = {}
                }
            },
            getDetail() {
                this.defaultFormModel = {}
                this.finallyFormModel = {}
                if (this.dataId) {
                    this.loading = true
                    customerApi.detail(this.dataId).then(res => {
                        if (res.success) {
                            this.defaultFormModel = res.data
                            const { areaId, cityId, provinceId } = res.data
                            // 处理坐标字段
                            let point = {}
                            if (res.data.latitude && res.data.longitude) {
                                point = { lat: res.data.latitude, lng: res.data.longitude }
                            }
                            this.defaultFormModel.point = point
                            this.defaultFormModel._region = [provinceId, cityId, areaId]
                            this.finallyFormModel.id = res.data.id
                            this.finallyFormModel.guidId = res.data.guidId
                        }
                        setTimeout(() => {
                            this.loading = false
                        }, 500)
                    })
                }
            },
            handleSubmit() {
                this.loading = true
                this.$refs.BaseForm.submit((data) => {
                    const postData = {
                        ...this.defaultFormModel,
                        ...data,
                        ...this.finallyFormModel
                    }
                    if (data.point) {
                        postData.latitude = data.point.lat
                        postData.longitude = data.point.lng
                    }
                    customerApi.update(postData).then(res => {
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
            handleMore() {
                // 先执行提交操作
                this.loading = true
                this.$refs.BaseForm.submit((data) => {
                    // eslint-disable-next-line no-redeclare
                    const params = {
                        ...this.defaultFormModel,
                        ...data,
                        ...this.finallyFormModel
                    }
                    // // 必须传入联系人名称和电话
                    // if (data.peopleName || data.phone) {
                    //     this.loading = false
                    //     return this.$message({ type: 'warning', message: '联系人姓名和联系方式不得为空' })
                    // }
                    // const people = [{ name: data.peopleName, phone: data.phone }]
                    customerApi.update(params).then(res => {
                        if (res.success) {
                            this.$notify({
                                title: '保存成功',
                                message: res.msg,
                                type: 'success',
                                duration: 2000
                            })
                            // 弹出联系人列表窗口
                            if (res.data) {
                                this.$emit('more', res.data)
                            }
                            // 关闭当前窗口
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
            }
        }
    }
</script>

<style scoped lang="scss">
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
