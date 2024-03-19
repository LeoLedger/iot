<template>
    <div class="box-container">
        <add-dialog
            :visible="addClassVisible"
            :title="title"
            :cp-id="parentId"
            @closeClass="closeAdd"
        />
    </div>
</template>

<script>
    import {
        searchNamespace// 查询命名空间
    } from '@/api/systemSet/class/index'
    import addDialog from './components/addEditDialog'
    export default {
        name: 'AddClassDialog',
        components: {
            addDialog
        },
        props: {
            addClassVisible: {
                type: Boolean,
                default: false
            },
            formData: {
                type: Object,
                default: () => {
                }
            },
            parentId: { type: String }
        },
        data() {
            const { formData } = this.$props
            const params = {}
            const forms = []
            return {
                params,
                // 配置弹窗
                title: '添加类型信息',
                forms,
                formOptions: {
                    submitBtnText: '提交',
                    showCancelBtn: true
                }
            }
        },
        watch: {
            formData: {
                handler: function(newData, oldData) {
                    this.changeFormData(newData)
                }
            }
        },
        created() {
        },
        methods: {
            closeAdd(isRefresh) {
                this.$emit('closeAddClass', isRefresh)
            }
        }
    }
</script>

<style lang='scss' scoped>
    .FormConfig {
        .el-input-number {
            width: 100%;
        }
        .footer {
            padding-top: 10px;
            border-top: 1px solid #dcdfe6;
            text-align: right;
        }
        .el-col {
            border-bottom: 0;
        }
    }
    .tip {
        padding-left: 80px;
        color: #aaa;
    }
</style>
