<!--
* @description 维修反馈表格
* @author yc
!-->
<template>
    <el-collapse-item name="2" class="hide-arrow flex" disabled>
        <div slot="title" class="title">
            <div class="text">寄修设备</div>
        </div>
        <VerifiableTable
            ref="VerifiableTable"
            :is-edit="isEdit"
            :form-data="formData"
            :data-list="dataList"
        />
    </el-collapse-item>
</template>

<script>
    // API
    // 方法
    import { isEmpty } from '@/utils'
    // 组件
    import VerifiableTable from './VerifiableTable'

    export default {
        name: 'Verifiable',
        components: {
            VerifiableTable
        },
        props: {
            isEdit: { type: Boolean, default: false },
            formData: { type: Object, default: () => ({}) }
        },
        data() {
            return {
                dataList: []
            }
        },
        computed: {
        },
        watch: {
            formData: {
                immediate: true,
                handler(data) {
                    if (data) {
                        this.dataList = (data.updateDevices || []).map(item => {
                            if (isEmpty(item.companyBearCost) && isEmpty(item.enterpriseBearCost)) {
                                item.companyBearCost = item.totalCost
                                item.enterpriseBearCost = 0
                            }
                            return item
                        })
                    }
                }
            }
        },
        mounted() {
        },
        methods: {
            // 验证表单
            validate() {
                return this.$refs.VerifiableTable.validate()
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
