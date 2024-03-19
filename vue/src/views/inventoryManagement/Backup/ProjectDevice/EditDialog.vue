<template>
    <el-dialog
        :visible.sync="visible"
        :before-close="handleCancel"
        :close-on-click-modal="false"
        class="not-padding"
        title="设备备用分配"
        width="850px"
        append-to-body>
        <div class="layout-detail-container">
            <CollapseTabLayout :collapse-list="collapseList">
                <BaseForm ref="BaseForm" slot="BaseForm" :disabled="disabled" :form-data="formData"/>
                <TableComp
                    slot="Table"
                    :row-data="rowData"
                    :is-edit="!disabled"
                    @delete="handleDeleteDevice"
                    @add="handleAddDevice"
                />
            </CollapseTabLayout>
        </div>
        <span slot="footer">
            <el-button size="mini" @click="handleCancel">关 闭</el-button>
            <el-button
                v-prereclick
                v-if="!disabled"
                :loading="loading"
                size="mini"
                type="primary"
                @click="handleSubmit"
            >保 存
            </el-button>
        </span>
    </el-dialog>
</template>

<script>
    import CollapseTabLayout from '@/components/CollapseTabLayout'
    import BaseForm from '@/views/inventoryManagement/Backup/ProjectDevice/BaseForm'
    import TableComp from '@/views/inventoryManagement/Backup/ProjectDevice/TableComp'
    import deviceApi from '@/api/inventory/device'
    import warehousesApi from '@/api/inventory/warehouses'
    export default {
        name: 'ProjectDeviceDetailDialog',
        components: { BaseForm, CollapseTabLayout, TableComp },
        props: {
            visible: false,
            // 详情id
            dataId: null,
            disabled: false
        },
        data() {
            return {
                formData: {},
                collapseList: [
                    { title: '基础信息', slotName: 'BaseForm', button: false, disabled: true },
                    { title: '已分配备用设备', slotName: 'Table', button: false }
                ],
                loading: false,
                rowData: {},
                deleteList: [],
                addList: []
            }
        },
        watch: {
            dataId: {
                handler() {
                    this.getDetail()
                },
                immediate: true
            }
        },
        methods: {
            getDetail() {
                // 调用详情接口
                this.formData = {}
                this.rowData = {}
                this.deleteList = []
                if (this.dataId) {
                    this.loading = true
                    deviceApi.getDistributionDetail(this.dataId).then(res => {
                        if (res.success) {
                            this.formData = res.data
                            this.rowData = {
                                standbyProjectId: res.data.standbyProjectId,
                                productId: res.data.productId,
                                warehousesSpaceId: '09509d7b-5be3-4a89-a472-58c14b35cc2c'
                            }
                        }
                        setTimeout(() => {
                            this.loading = false
                        }, 500)
                    })
                }
            },
            handleCancel() {
                // 判断删除列表是否为空, 弹出提示
                const hasDelete = this.deleteList && this.deleteList.length > 0
                const hasAdd = this.addList && this.addList.length > 0
                const text = '您还没有保存，' +
                    (hasDelete ? '移除设备 ' + this.deleteList.length + ' 台，' : '') +
                    (hasAdd ? '调入设备 ' + this.addList.length + ' 台，' : '') + '不会生效，是否确认关闭？'
                if (hasAdd || hasDelete) {
                    this.$confirm(text, '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning',
                        center: true
                    }).then(() => {
                        this.addList = []
                        this.deleteList = []
                        this.$emit('close', false)
                    })
                } else {
                    this.addList = []
                    this.deleteList = []
                    this.$emit('close', false)
                }
            },
            handleSubmit() {
                this.loading = true
                this.$refs.BaseForm.submit((data) => {
                    deviceApi.updateDistribution({
                        ...data,
                        delGuidList: this.deleteList,
                        addGuidList: this.addList
                    }).then(res => {
                        if (res.success) {
                            this.$notify({
                                title: '保存成功',
                                message: res.msg,
                                type: 'success',
                                duration: 2000
                            })
                            this.$emit('confirm')
                            this.$emit('close', true)
                        }
                    }).finally(() => {
                        this.loading = false
                    })
                }, () => {
                    this.loading = false
                })
            },
            handleDeleteDevice(deleteList) {
                this.deleteList = deleteList
            },
            handleAddDevice(addList) {
                this.addList = addList
            }
        }
    }
</script>

<style scoped>

</style>
