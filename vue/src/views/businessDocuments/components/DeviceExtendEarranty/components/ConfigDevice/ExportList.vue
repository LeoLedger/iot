<!--
* @description 调入延保设备
* @author yc
!-->
<template>
    <el-dialog
        :visible="visible"
        :close-on-click-modal="false"
        title="调入设备"
        width="860px"
        append-to-body
        @close="$emit('update:visible', false)"
    >
        <PublicTabel
            ref="PublicTabel"
            :data-list="dataList"
            is-edit
        >
            <template slot="button">
                <el-button
                    v-waves
                    size="mini"
                    class="filter-button"
                    type="warning"
                    @click="handleExport"
                >导出</el-button>
            </template>
        </PublicTabel>
        <span slot="footer">
            <el-button :loading="loading" size="mini" @click="$emit('update:visible', false)">取 消</el-button>
            <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit">调 入</el-button>
        </span>
    </el-dialog>
</template>

<script>
    // 方法
    // API
    import deviceExtendEarrantyApi from '@/api/businessDocuments/deviceExtendEarranty'
    // 组件
    import PublicTabel from './PublicTabel'

    export default {
        name: 'ExportList',
        components: {
            PublicTabel
        },
        props: {
            visible: { type: Boolean, default: false },
            rowData: { type: Object, required: true },
            billsData: { type: Object, required: true },
            excludes: { type: Array, default: () => {} },
            isCreate: { type: Boolean, default: false }
        },
        data() {
            return {
                loading: false,
                dataList: []
            }
        },
        watch: {
            visible(value) {
                if (value) {
                    this.queryDeviceList()
                }
            }
        },
        methods: {
            // 获取原始延保设备列表
            async queryDeviceList() {
                this.loading = true
                this.dataList = []
                var res = await deviceExtendEarrantyApi.getOriginDevice({
                    productId: this.rowData.productId,
                    supplierId: this.billsData.purchaseSupplierId
                })
                var ids = this.excludes.map(v => v.deviceId)
                this.dataList = res.data.filter(item => ids.indexOf(item.deviceId) === -1)
                this.loading = false
            },
            // 点击导出按钮时触发
            handleExport() {
                this.$refs.PublicTabel.handleExport()
            },
            // 点击提交按钮时触发
            handleSubmit() {
                var list = this.$refs.PublicTabel.selectList
                if (list.length) {
                    this.$emit('update', list)
                    this.$emit('update:visible', false)
                } else {
                    this.$message.warning('请至少选中一项！')
                }
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
