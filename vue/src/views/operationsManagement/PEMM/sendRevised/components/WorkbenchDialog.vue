<!--
* @description 核验工作台
* @author yc
!-->
<template>
    <div>
        <el-dialog
            :visible="visible"
            :before-close="handleDialogClose"
            :close-on-click-modal="false"
            fullscreen
            title="维修核验工作台"
            class="not-padding"
            append-to-body
        >
            <div class="container">
                <VerifiableTable
                    ref="VerifiableTable"
                    :data-list="dataList"
                    is-edit
                    is-workbench
                    @ready="getList"
                >
                    <template slot="button">
                        <el-button
                            :loading="loading"
                            plain
                            size="mini"
                            class="filter-button"
                            type="primary"
                            icon="el-icon-refresh"
                            @click="getList"
                        >刷新</el-button>
                        <el-button
                            :loading="loading"
                            size="mini"
                            class="filter-button"
                            type="primary"
                            icon="el-icon-document"
                            @click="handleSubmit"
                        >处理完成</el-button>
                    </template>
                </VerifiableTable>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    // API
    import sendRevisedApi from '@/api/operationsManagement/sendRevised'
    // 方法
    // 组件
    import VerifiableTable from './Table/VerifiableTable'

    export default {
        name: 'WorkbenchDialog',
        components: {
            VerifiableTable
        },
        props: {
            visible: { type: Boolean, default: false }
        },
        data() {
            return {
                loading: false,
                dataList: []
            }
        },
        computed: {
        },
        watch: {
        },
        mounted() {
        },
        methods: {
            // 获取基础信息
            async getList() {
                this.setLoading(true)
                let res = await sendRevisedApi.getVerifyAll({
                    pageSize: -1
                })
                this.dataList = res.data.records.map(item => {
                    if (!item.companyBearCost && !item.enterpriseBearCost) {
                        item.companyBearCost = item.totalCost
                        item.enterpriseBearCost = 0
                    }
                    return item
                })
                this.setLoading(false)
            },
            // 设置加载状态
            setLoading(value) {
                this.loading = value
                this.$refs.VerifiableTable.tableData.options.loading = value
            },
            // 点击提交按钮时触发
            async handleSubmit() {
                this.setLoading(true)
                try {
                    let updateDevices = await this.$refs.VerifiableTable.validate()
                    var res = await sendRevisedApi.update({
                        operType: 5,
                        updateDevices
                    })
                    await this.getList()
                    this.$notify({
                        title: '处理成功',
                        message: res.msg,
                        type: 'success',
                        duration: 2000
                    })
                } catch (e) {
                    console.log(e)
                }
                this.setLoading(false)
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
.container {
    height: 100%;
    box-sizing: border-box;
    padding: 10px 15px 15px;
}
</style>
