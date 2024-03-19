<!--
* @description 故障单处理表格
* @author yc
!-->
<template>
    <el-collapse-item name="2" class="hide-arrow flex" disabled>
        <div slot="title" class="title">
            <div class="text">故障设备</div>
        </div>
        <HandleTable
            ref="HandleTable"
            :is-edit="isEdit"
            :data-id="formData.guidId"
            :data-list="deviceList"
        />
    </el-collapse-item>
</template>

<script>
    // API
    // 方法
    import { isEmpty } from '@/utils'
    // 组件
    import HandleTable from './HandleTable'

    export default {
        name: 'Handle',
        components: {
            HandleTable
        },
        props: {
            isEdit: { type: Boolean, default: false },
            formData: { type: Object, default: () => ({}) }
        },
        data() {
            return {
                deviceList: []
            }
        },
        computed: {
        },
        watch: {
            formData: {
                immediate: true,
                handler(data) {
                    if (data) {
                        this.deviceList = (data.devices || []).map(item => {
                            item._canEditProps = ['deviceId', 'replaceDeviceId', 'handlingWay', 'clientFeedback'].filter(v => isEmpty(item[v]))
                            return item
                        })
                    }
                }
            }
        },
        mounted() {
            this.parent = null
            this.$emit('ready', this)
        },
        methods: {
            // 验证表单
            validate() {
                return this.$refs.HandleTable.validate()
            },
            // 获取提交数据
            getFormData() {
                return this.$refs.HandleTable.getFormData()
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
