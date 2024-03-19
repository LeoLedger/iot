<!--
* @description 联系人详情
* @author yc
!-->
<template>
    <div>
        <el-dialog
            :visible="visible"
            title="联系人详情"
            width="800px"
            append-to-body
            @close="$emit('update:visible', false)"
        >
            <BaseForm
                ref="BaseForm"
                :form-data="formData"
                disabled
            />
        </el-dialog>
    </div>
</template>

<script>
    // API
    import contactsApi from '@/api/PM/contacts'
    // 方法
    // 组件
    import BaseForm from './BaseForm'

    export default {
        components: {
            BaseForm
        },
        props: {
            visible: { type: Boolean, default: false },
            dataId: { type: [Number, String] }
        },
        data() {
            return {
                loading: false,
                formData: {}
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
            console.log('dataId', this.dataId)
            this.queryBaseInfo()
        },
        methods: {
            // 获取基础信息
            async queryBaseInfo() {
                if (this.dataId) {
                    var res = await contactsApi.detail(this.dataId)
                    if (res.success) {
                        this.formData = {
                            ...res.data
                        }
                    }
                }
            }
        }
    }
</script>

<style lang='scss' scoped>

</style>
