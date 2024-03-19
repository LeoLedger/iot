<template>
    <div class="box-container">
        <add-dialog
            :visible="addAppVisible"
            :title="title"
            @closeApp="closeAdd"
        />
    </div>
</template>

<script>
    import {
        searchNamespace// 查询命名空间
    } from '@/api/systemSet/dict/index'
    import addDialog from './components/addEditDialog'
    export default {
        name: 'AddAppDialog',
        components: {
            addDialog
        },
        props: {
            addAppVisible: {
                type: Boolean,
                default: false
            },
            formData: {
                type: Object,
                default: () => {
                }
            }
        },
        data() {
            const { formData } = this.$props
            const params = {}
            const forms = []
            return {
                params,
                // 配置弹窗
                title: '添加程序',
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
            closeAdd(bool) {
                this.$emit('closeAddApp', bool)
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
