<!--
* @description 更新联系人
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
            append-to-body
        >
            <BaseForm
                ref="BaseForm"
                :form-data="formData"
                :locked-customer="extendParams.lockedCustomer"
                :customer-type="extendParams.type"
            />
            <span slot="footer">
                <el-button :loading="loading" size="mini" @click="$emit('update:visible', false)">取 消</el-button>
                <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit">提 交</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    // API
    import contactsApi from '@/api/PM/contacts'
    // 方法
    // 组件
    import BaseForm from './BaseForm'

    // 从父组件接受extendParams时,只有以下属性名才会被赋值给formData
    const AssignWhiteList = [
        'type',
        'customerId',
        'customerName',
        'relDeptId'
    ]

    export default {
        name: 'UpdateDialog',
        components: {
            BaseForm
        },
        props: {
            visible: { type: Boolean, default: false },
            isEdit: { type: Boolean, default: false },
            dataId: { type: [Number, String] },
            extendParams: { type: Object, default: () => ({}) }
        },
        data() {
            return {
                loading: false,
                formData: {}
            }
        },
        computed: {
            title() {
                return this.dataId ? '编辑联系人' : '新增联系人'
            }
        },
        watch: {
            dataId: {
                immediate: true,
                handler() {
                    this.queryBaseInfo()
                }
            },
            extendParams: {
                deep: true,
                immediate: true,
                handler(params) {
                    console.log(params)
                    if (params) {
                        var data = {}
                        Object.keys(params).forEach(key => {
                            if (AssignWhiteList.includes(key)) {
                                data[key] = params[key]
                            }
                        })
                        this.formData = { ...this.formData, ...data }
                    }
                }
            }
        },
        methods: {
            // 获取基础信息
            async queryBaseInfo() {
                if (this.dataId) {
                    this.loading = true
                    var res = await contactsApi.detail(this.dataId)
                    if (res.success) {
                        this.formData = {
                            ...res.data,
                            ...this.formData
                        }
                    }
                    this.loading = false
                }
            },
            // 点击提交按钮时触发
            handleSubmit() {
                this.loading = true
                this.$refs.BaseForm.submit((data) => {
                    contactsApi.update({
                        ...this.formData,
                        ...data
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
            }
        }
    }
</script>

<style lang='scss' scoped>

</style>
