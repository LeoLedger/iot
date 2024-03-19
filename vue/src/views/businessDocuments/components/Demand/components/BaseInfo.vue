<!--
* @description 项目信息表单
* @author yc
!-->
<template>
    <div v-loading="loading">
        <el-collapse v-model="collapseValue" class="layou-collapse">
            <el-collapse-item name="1" disabled>
                <div slot="title" class="title">
                    <div class="text">基础信息</div>
                </div>
                <div class="body-wrap">
                    <BaseForm
                        ref="BaseForm"
                        :form-data="formData"
                        :disabled="!isEdit"
                    />
                </div>
            </el-collapse-item>
            <el-collapse-item v-if="formData.approvalStatus === 4" name="2" disabled>
                <div slot="title" class="title">
                    <div class="text">核销信息</div>
                </div>
                <div class="body-wrap">
                    <TableComponent
                        v-bind="tableData"
                        empty-hide-table
                    />
                </div>
            </el-collapse-item>
        </el-collapse>
    </div>
</template>

<script>
    // API
    import demandApplyApi from '@/api/businessDocuments/demand'
    // 方法
    // 组件
    import BaseForm from './BaseForm'

    export default {
        components: {
            BaseForm
        },
        props: {
            dataId: { type: [Number, String] },
            isEdit: { type: Boolean, default: false },
            jsonData: { type: null },
            isApproval: { type: Boolean, default: false },
            processIndex: { type: Number, default: 0 }
        },
        data() {
            return {
                loading: false,
                formData: {},
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            type: 'date',
                            prop: 'verifiableTime',
                            label: '单据核销时间',
                            width: 160
                        },
                        {
                            prop: 'verifiableUserName',
                            label: '操作人',
                            width: 100
                        },
                        {
                            prop: 'verifiableContent',
                            label: '说明'
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: null,
                        maxHeight: null
                    }
                },
                collapseValue: ['1', '2', '3']
            }
        },
        computed: {
        },
        watch: {
            dataId: {
                immediate: true,
                handler() {
                    this.queryBaseInfo()
                }
            }
        },
        mounted() {
        },
        methods: {
            // 点击提交按钮时触发
            submit(callback, errorCallback) {
                this.loading = true
                this.$refs.BaseForm.submit((data) => {
                    demandApplyApi.update({
                        ...this.formData,
                        ...data
                    }).then(res => {
                        this.$notify({
                            title: '保存成功',
                            message: res.msg,
                            type: 'success',
                            duration: 2000
                        })
                        this.getCanApprovalCount()
                        callback && callback()
                    }).catch(() => {
                        errorCallback && errorCallback()
                    }).finally(() => {
                        this.loading = false
                    })
                }, () => {
                    this.loading = false
                    errorCallback && errorCallback()
                })
            },
            // 获取基础信息
            async queryBaseInfo() {
                if (this.dataId) {
                    this.loading = true
                    var res = await demandApplyApi.detail(this.dataId)
                    if (res.success) {
                        this.formData = {
                            ...this.formData,
                            ...res.data
                        }
                        var { verifiableTime, verifiableUserName, verifiableContent } = res.data
                        this.tableData.list = [{
                            verifiableTime,
                            verifiableUserName,
                            verifiableContent
                        }]
                        this.$emit('data-update', this.formData)
                    }
                    this.loading = false
                }
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
