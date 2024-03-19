<!--
* @description 寄修单确认
* @author 望浩然
* @date 2021/10/11
!-->
<template>
    <div>
        <el-dialog
            :visible="visible"
            title="寄修单 - 维修反馈"
            width="1400px"
            class="not-padding"
            append-to-body
            @close="$emit('update:visible', false)"
        >
            <div class="layout-detail-container">
                <collapse-tab-layout
                    :show-tab="false"
                    :collapse-list="collapseList"
                >
                    <template slot="BaseForm">
                        <BaseForm
                            ref="BaseForm"
                            :form-data="formData"
                            :disabled="true"
                            :is-edit="false"
                        />
                    </template>
                    <template slot="deviceList">
                        <FaultDeviceList
                            v-if="freshFaultDeviceList"
                            ref="FaultDeviceList"
                            :data-list="listFaultCu"
                            :is-edit="isEdit"
                        />
                    </template>
                    <template slot="deviceListAction">
                        <div v-if="isEdit" class="deviceListAction">
                            <ImportButton
                                :before-upload="hanldeBeforeUpload"
                                :download-method="handleDownloadTemplate"
                                :upload-data="{expressRepairCarId: formData.guidId}"
                                type="primary"
                                action="/expressRepairCar/import-repair"
                                title="导入故障设备"
                                template-name="故障设备导入模板.xlsx"
                                @success="handleImportSuccess"
                            />
                        </div>
                    </template>
                </collapse-tab-layout>
            </div>
            <span slot="footer" v-if="isEdit">
                <el-button size="mini" @click="$emit('update:visible', false)">取 消</el-button>
                <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit">确认完成</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import BaseForm from '../editDialog/BaseForm'
    import CollapseTabLayout from '@/components/CollapseTabLayout'
    import troubleApi from '@/api/operationsManagement/expressRepairCar'
    import FaultDeviceList from './FaultDeviceList'
    import ImportButton from '@/components/customizeFormItem/ImportButton'
    import carApi from '@/api/operationsManagement/carTroubleTicket'
    export default {
        components: {
            FaultDeviceList,
            CollapseTabLayout,
            BaseForm,
            ImportButton
        },
        props: {
            visible: { type: Boolean, default: false },
            dataId: { type: String, default: null },
            isEdit: { type: Boolean, default: false }
        },
        data() {
            return {
                loading: false,
                // 故障单详情
                formData: {},
                freshFaultDeviceList: true,
                collapseList: [
                    { disabled: true, title: '基础信息', button: false, slotName: 'BaseForm' },
                    { disabled: true, title: '设备清单', button: false, buttonSlotName: 'deviceListAction', slotName: 'deviceList' }
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
                            this.listFaultCu = res.data.deviceList || []
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
            handleSubmit() {
                // 检查列表项填写完整
                const isValidate = this.$refs.FaultDeviceList.getValidate()
                if (!isValidate.result) {
                    this.$message({ message: isValidate.msg, type: 'warning' })
                    return
                }
                this.$refs.FaultDeviceList.submit().then(() => {
                    this.$refs.BaseForm.submit((data) => {
                        this.loading = true
                        const postData = { ...this.formData, ...data, deviceList: this.listFaultCu, status: 1 }
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
                })
            },
            hanldeBeforeUpload() {
                // 查看故障单列表是否有数据
                if (!this.listFaultCu || this.listFaultCu.length < 1) {
                    return this.$message({ type: 'warning', message: '本寄修单下无故障设备，无法进行操作' })
                }
                return true
            },
            handleImportSuccess(data) {
                const list = data
                console.log('data', data)
                // 导入后用新数据与旧数据对比
                if (list && list.length) {
                    this.freshFaultDeviceList = false
                    // 通过IMEI字段来确定
                    list.map(item => {
                        if (item.code === 0) {
                            const newItem = item.data
                            // 旧数据中存在这一条, 则用新数据替换旧的
                            const oItemIndex = this.listFaultCu.findIndex(v => v.imei === newItem.imei)
                            if (oItemIndex > -1) {
                                console.log('替换前 =>', this.listFaultCu[oItemIndex])
                                this.listFaultCu[oItemIndex] = Object.assign({}, this.listFaultCu[oItemIndex], newItem)
                                console.log('替换后 =>', this.listFaultCu[oItemIndex])
                            }
                        }
                    })
                    setTimeout(() => {
                        this.freshFaultDeviceList = true
                    }, 100)
                    // 导入后直接触发一次校验
                    // this.$refs.FaultDeviceList.submit()
                    let failure = data.reduce((a, b) => {
                        if (b.code > 0) {
                            return a + 1
                        }
                        return a
                    }, 0)
                    let succeed = data.length - failure
                    let messageNode = `<p style="margin-bottom: 4px;">导入成功${succeed}条数据，导入失败${failure}条数据</p>`
                    messageNode += data.map((item, index) => {
                        if (item.code > 0) {
                            return `<p>第${index + 1}行：${item.errorMsg}</p>`
                        }
                    }).filter(v => v).join('')
                    this.$message({
                        type: 'success',
                        duration: failure > 0 ? 0 : 5000,
                        showClose: true,
                        message: messageNode,
                        dangerouslyUseHTMLString: true
                    })
                    // this.$message.success('导入完毕')
                } else this.$message({ type: 'warning', message: '导入的数据有误' })
            },
            handleDownloadTemplate() {
                troubleApi.downloadTemplateRepair({ expressRepairCarId: this.formData.guidId })
            }
        }
    }
</script>

<style lang='scss' scoped>
  .body-wrap {
    height: 450px;
  }
</style>
