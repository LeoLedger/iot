<!--
* @description 维修单确认
* @author 望浩然
* @date 2021/5/12 -
!-->
<template>
    <div>
        <el-dialog
            :visible="visible"
            title="维修单 - 维修确认"
            width="1400px"
            class="not-padding"
            append-to-body
            @close="$emit('update:visible', false)"
        >
            <div class="layout-detail-container" style="height: 80vh">
                <collapse-tab-layout
                    :show-tab="false"
                    max-height="800px"
                    :collapse-list="collapseList"
                    style="height: 100%"
                >
                    <template slot="BaseForm">
                        <BaseForm
                            ref="BaseForm"
                            :form-data="formData"
                            :disabled="true"
                        />
                    </template>
                    <template slot="deviceList">
                        <FaultDeviceList
                            v-if="freshFaultDeviceList"
                            ref="FaultDeviceList"
                            :data-list="listFaultCu"
                            :is-edit="true"
                        />
                    </template>
                    <template slot="deviceListAction">
                        <div class="deviceListAction">
                            <ImportButton
                                :before-upload="hanldeBeforeUpload"
                                :download-method="handleDownloadTemplate"
                                :upload-data="{guid: formData.guidId}"
                                type="primary"
                                action="fault-repair-car/import-fault-car-device"
                                title="导入维修反馈单"
                                template-name="维修反馈单导入模板.xlsx"
                                @success="handleImportSuccess"
                            />
                        </div>
                    </template>
                </collapse-tab-layout>
            </div>
            <span slot="footer">
                <el-button size="mini" @click="$emit('update:visible', false)">取 消</el-button>
                <el-button v-prereclick :loading="loading" type="success" size="mini" @click="handleSave">暂 存</el-button>
                <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit">确认完成</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import carApi from '@/api/operationsManagement/carTroubleTicket'
    import BaseForm from './BaseForm'
    import CollapseTabLayout from '@/components/CollapseTabLayout'
    import troubleApi from '@/api/operationsManagement/carTroubleTicket'
    import FaultDeviceList from './FaultDeviceList'
    import ImportButton from '@/components/customizeFormItem/ImportButton'
    export default {
        components: {
            FaultDeviceList,
            CollapseTabLayout,
            BaseForm,
            ImportButton
        },
        props: {
            visible: { type: Boolean, default: false },
            dataId: { type: String, default: null }
        },
        data() {
            return {
                loading: false,
                // 故障单详情
                formData: {},
                freshFaultDeviceList: true,
                collapseList: [
                    { disabled: true, title: '基础信息', button: false, slotName: 'BaseForm' },
                    { disabled: true, title: '故障设备', button: false, buttonSlotName: 'deviceListAction', slotName: 'deviceList' }
                ],
                // 故障设备列表
                listFaultCu: [],
                // 导入窗口
                importDialog: {
                    visible: false,
                    exportParams: {},
                    importParams: {}
                }
            }
        },
        computed: {},
        watch: {
            dataId() {
                this.init()
            }
        },
        mounted() {
            this.init()
        },
        methods: {
            init() {
                this.getDetail()
            },
            getDetail() {
                this.formData = {}
                if (this.dataId) {
                    this.loading = true
                    troubleApi.detail(this.dataId).then(res => {
                        if (res.success) {
                            this.formData = res.data
                            this.listFaultCu = res.data.listFaultCu || []
                        }
                        setTimeout(() => {
                            this.loading = false
                        }, 500)
                    })
                }
            },
            handleClose() {
                this.$emit('close')
                this.$emit('update:visible', false)
            },
            handleSave() {
                // 暂存不校验
                // const isValidate = this.$refs.FaultDeviceList.getValidate()
                // if (!isValidate.result) {
                //     this.$message({ message: isValidate.msg, type: 'warning' })
                //     return
                // }
                this.$refs.BaseForm.submit((data) => {
                    this.loading = true
                    const postData = { ...this.formData, ...data, listFaultCu: this.listFaultCu, status: 0 }
                    troubleApi.update(postData).then(res => {
                        if (res.success) {
                            this.$notify({
                                title: '保存成功',
                                message: res.msg,
                                type: 'success',
                                duration: 2000
                            })
                            this.$emit('update', data)
                            this.$emit('update:visible', false)
                        }
                    }).finally(() => {
                        this.loading = false
                    })
                })
            },
            handleSubmit() {
                // 检查列表项哪些已填写
                const submitList = []
                this.listFaultCu.map(item => {
                    if (item.status === 0 && (item.factoryFeedback || Number(item.labourCost) > 0)) {
                        submitList.push(item)
                    }
                })
                if (!submitList || submitList.length < 1) {
                    this.$message({ message: '未填写数据', type: 'warning' })
                    return
                }
                // 检查列表项填写完整
                const isValidate = this.$refs.FaultDeviceList.getValidate()
                if (!isValidate.result) {
                    this.$message({ message: isValidate.msg, type: 'warning' })
                    return
                }
                this.$refs.FaultDeviceList.submit(submitList).then(() => {
                    this.$refs.BaseForm.submit((data) => {
                        submitList.map(item => {
                            item.status = 1
                        })
                        this.loading = true
                        const postData = { ...this.formData, ...data, listFaultCu: submitList, status: 1 }
                        troubleApi.update(postData).then(res => {
                            if (res.success) {
                                this.$notify({
                                    title: '保存成功',
                                    message: res.msg,
                                    type: 'success',
                                    duration: 2000
                                })
                                this.$emit('update', data)
                                this.$emit('update:visible', false)
                            }
                        }).finally(() => {
                            this.loading = false
                        })
                    }, () => {
                        this.loading = false
                    })
                }).catch(error => {
                    console.log(error)
                })
            },
            // 导入
            hanldeBeforeUpload() {
                // 查看故障单列表是否有数据
                if (!this.listFaultCu || this.listFaultCu.length < 1) {
                    return this.$message({ type: 'warning', message: '本维修单下无故障设备，无法进行操作' })
                }
                return true
            },
            handleImportSuccess(data) {
                const list = data
                // 导入后用新数据与旧数据对比
                if (list && list.length) {
                    this.freshFaultDeviceList = false
                    // 通过IMEI字段来确定
                    list.map(item => {
                        // 旧数据中存在这一条, 则用新数据替换旧的
                        const oItemIndex = this.listFaultCu.findIndex(v => v.imei === item.imei)
                        if (oItemIndex > -1) {
                            this.listFaultCu[oItemIndex] = Object.assign({}, this.listFaultCu[oItemIndex], item)
                            // 如果已填了替换设备,则不能选择继续运营
                            const item_ = this.listFaultCu[oItemIndex]
                            if (item_.replaceDeviceId && item_.handlingWay === 0) {
                                item_.handlingWay = null
                            }
                        }
                    })
                    setTimeout(() => {
                        this.freshFaultDeviceList = true
                    }, 100)
                    // 导入后直接触发一次校验
                    // this.$refs.FaultDeviceList.submit()
                    this.$message.success('导入完毕')
                } else this.$message({ type: 'warning', message: '导入的数据有误' })
            },
            handleDownloadTemplate() {
                carApi.downloadFaultConfirm({
                    guid: this.formData.guidId
                })
            }
        }
    }
</script>

<style lang='scss' scoped>
.body-wrap {
    height: 650px;
}
</style>
