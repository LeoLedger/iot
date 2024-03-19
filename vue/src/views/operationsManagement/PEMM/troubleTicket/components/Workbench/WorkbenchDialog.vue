<!--
* @description 故障设备处理工作台
* @author yc
!-->
<template>
    <div>
        <el-dialog
            :visible="visible"
            :before-close="handleDialogClose"
            :close-on-click-modal="false"
            fullscreen
            title="故障设备处理工作台"
            class="not-padding"
            append-to-body
        >
            <div class="container">
                <HandleTable
                    ref="HandleTable"
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
                        >确认提交</el-button>
                    </template>
                </HandleTable>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    // API
    import troubleTicketApi from '@/api/operationsManagement/troubleTicket'
    // 方法
    import { isEmpty } from '@/utils'
    // 组件
    import HandleTable from '../Table/HandleTable'

    export default {
        name: 'WorkbenchDialog',
        components: {
            HandleTable
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
        mounted() {
        },
        methods: {
            // 获取基础信息
            async getList() {
                this.setLoading(true)
                var { data } = await troubleTicketApi.getDeal({
                    pageSize: -1
                })
                this.dataList = data.records.map(item => {
                    item._canEditProps = ['deviceId', 'replaceDeviceId', 'handlingWay', 'clientFeedback'].filter(v => isEmpty(item[v]))
                    return item
                })
                this.setLoading(false)
            },
            // 设置加载状态
            setLoading(value) {
                this.loading = value
                this.$refs.HandleTable.tableData.options.loading = value
            },
            // 点击提交按钮时触发
            async handleSubmit() {
                try {
                    this.setLoading(true)
                    let devices = await this.$refs.HandleTable.validate()
                    let res = await troubleTicketApi.update({
                        isTemp: 0,
                        devices,
                        operType: 2
                    })
                    await this.getList()
                    this.$notify({
                        title: '保存成功',
                        message: res.msg,
                        type: 'success',
                        duration: 2000
                    })
                    this.$emit('update')
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
    padding: 10px 15px;
}
</style>
