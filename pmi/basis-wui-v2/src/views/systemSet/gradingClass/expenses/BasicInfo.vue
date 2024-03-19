<!--
* @description 基础信息
* @author 姜庆博
!-->
<template>
    <FormConfig
            v-loading="loading"
            element-loading-text="加载中..."
            element-loading-background="rgba(0, 0, 0, 0.1)"
            ref="form"
            :forms="basicForms"
            :span="12"
            :formData="formData"
            :labelWidth="labelWidth"
            :showFooter="false"
    />
</template>

<script>
    import FormConfig from "@/components/FormConfig";
    import {basicForms} from './basicInfoConfig'
    export default {
        name: "BasicInfo",
        components: {
            FormConfig
        },
        props: {
            formData: {
                type: Object,
                default: () => {
                    return {}
                }
            },
            forms: {
                type: Array,
                default: () => []
            },
            treeData: {
                type: Array,
                default: () => []
            },
            isTopNode: {
                type: Boolean,
                default: false
            },
            isEdit: {
                type: Boolean,
                default: false
            },
        },
        data() {
            return {
                loading: false,
                labelWidth: 110,
                basicForms: JSON.parse(JSON.stringify(basicForms)),
            };
        },
        watch: {
            /*formData(newData, oldData) {
                console.log(JSON.stringify(newData), oldData, 'formData change')
            },*/
            treeData:{
                immediate: true,
                handler(newData) {
                    this.$set(this.basicForms[2], 'options', newData)
                    this.$set(this.basicForms[3], 'isEdit', false) // 不许基本信息编辑大小类
                }
            },
            isTopNode: {
                immediate: true,
                handler(newData) {
                    if(newData) {
                        this.basicForms.forEach((form, index) => {
                            this.$set(this.basicForms[index], 'isEdit', false)
                            if (form.prop === 'type') {
                                this.$set(this.basicForms[index], 'label', '')
                            }
                        })
                    } else {
                        this.basicForms.forEach((form, index) => {
                            // 分类编号 上级分类 分类级别
                            if(index === 1 /*|| index === 2*/ || index === 3 ) {
                                if (form.prop === 'type') {
                                    this.$set(this.basicForms[index], 'label', '分类级别')
                                }
                                return
                            }
                            this.$set(this.basicForms[index], 'isEdit', true)
                        })
                    }
                }
            },
            isEdit: {
                immediate: true,
                handler(newData) {
                    if(newData) { // 在编辑 状态: 不许更改上级分类
                        this.$set(this.basicForms[2], 'isEdit', false);
                    } else {
                        this.$set(this.basicForms[2], 'isEdit', true);
                    }
                }
            },
        },
        computed: { // 添加新的  form配置
        },
        methods: {
            /*submit(params) {
                console.log(params, 'test Params');
                const submitParams = {
                    ...this.formData,
                    ...params
                }
                console.log(submitParams, '提交的 数据')
                this.loading = true;
                setTimeout(() => {
                    this.loading = false;
                    this.$message.success('处理成功... 以及其他操作...');
                }, 2000)
            },*/
            formSubmit(submit) {
                // so 需要获取该 配置表单的 ref 手动触发submitHandle提交操作 可以通过传入回调函数【执行自己需要的数据提交后台】
                if(typeof submit === 'function') {
                   return this.$refs.form.submitHandler(submit);
                }
                // return this.$refs.form.submitHandler(this.submit);
            }
        }
    };
</script>

<style lang='scss' scoped>
</style>
