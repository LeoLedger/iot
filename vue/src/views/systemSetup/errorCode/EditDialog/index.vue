
<!--
* @description 节点添加/修改
* @fileName editDialog.vue
* @author 望浩然
-->
<template>
    <div>
        <el-dialog
            v-if="visible"
            :visible.sync="visible"
            :before-close="handleCancel"
            :close-on-click-modal="false"
            :title="dialogTitle"
            class="not-padding"
            width="600px"
            append-to-body
        >
            <div class="layout-detail-container" style="height: 300px">
                <BaseForm
                    v-if="visible"
                    ref="BaseForm"
                    :is-edit="isEdit"
                    :type="type"
                    :form-data="formData"
                />
            </div>
            <span slot="footer">
                <el-button size="mini" @click="handleCancel">取 消</el-button>
                <el-button v-prereclick :loading="loading" size="mini" type="primary" @click="handleSubmit">保  存</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import BaseForm from './BaseForm'
    import mainApi from '@/api/systemSet/faultCodeConfig'
    export default {
        name: 'EditDialog',
        components: { BaseForm },
        props: {
            dataId: {
                default: null
            },
            visible: {
                type: Boolean,
                default: false
            },
            type: {
                type: Number,
                default: 0
            },
            extendParams: {
                type: Object,
                default: () => {}
            },
            isEdit: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                formData: {},
                loading: false
            }
        },
        computed: {
            dialogTitle() {
                if (this.type !== 3) {
                    return this.isCreate ? '添加新的' + this.type + '级节点' : '编辑' + this.type + '节点：' + this.formData.name
                }
                return this.isCreate ? '添加故障代码' : '编辑故障代码'
            },
            isCreate() {
                return this.dataId === null
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
                    this.formData = { ...this.extendParams }
                }
            },
            getDetail() {
                if (this.dataId) {
                    this.loading = true
                    mainApi.detail(this.dataId).then(res => {
                        if (res.success) {
                            this.formData = res.data
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
                        ...data
                    }
                    mainApi.update(postData).then(res => {
                        if (res.success) {
                            this.$notify({
                                title: '保存成功',
                                message: res.msg,
                                type: 'success',
                                duration: 2000
                            })
                            this.$emit('confirm')
                            this.$emit('update:visible', false)
                        }
                    }).finally(() => {
                        this.loading = false
                    })
                }, () => {
                    this.loading = false
                })
            },
            handleCancel() {
                this.$emit('update:visible', false)
            }
        }
    }
</script>

<style scoped lang="scss">
</style>
