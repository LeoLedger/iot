<!--
* @description 登记维修单
* @author 望浩然
* @date 2021/5/10 - 2021/5/12
!-->
<template>
    <div>
        <el-dialog
            :visible="visible"
            :title="title"
            width="1100px"
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
                            :is-create="isCreate"
                            :is-edit="isEdit"
                            :disabled="!isEdit"
                            @supplier="handleSupplierChange"
                        />
                    </template>
                    <template slot="deviceList">
                        <FaultDeviceList
                            ref="deviceList"
                            :data-list="listFaultCu"
                            :is-create="isEdit"
                            :show-action="isEdit"
                            :is-edit="false"
                            @delete="handleDeleteRow"
                        />
                    </template>
                    <template slot="deviceListAction">
                        <div v-if="isEdit" class="deviceListAction">
                            <ImportButton
                                :before-upload="hanldeBeforeUpload"
                                :download-method="handleDownloadTemplate"
                                :upload-data="importDialog.params"
                                type="primary"
                                action="/expressRepairCar/import"
                                title="导入故障设备"
                                template-name="故障设备导入模板.xlsx"
                                @success="handleImportSuccess"
                            />
                            <el-button type="success" icon="el-icon-plus" @click="handleInsert">添加</el-button>
                        </div>
                    </template>
                </collapse-tab-layout>
            </div>
            <span slot="footer" v-if="isEdit">
                <el-button size="mini" @click="$emit('update:visible', false)">取 消</el-button>
                <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit">保 存</el-button>
            </span>
        </el-dialog>
        <ReplaceDeviceDialog
            v-if="insertDialog.visible"
            :visible.sync="insertDialog.visible"
            :params="insertDialog.params"
            @change="handleSelectChange"
        />
    </div>
</template>

<script>
    import BaseForm from './BaseForm'
    import CollapseTabLayout from '@/components/CollapseTabLayout'
    import mainApi from '@/api/operationsManagement/expressRepairCar'
    import ReplaceDeviceDialog from '@/views/operationsManagement/VEMM/expressRepairCar/editDialog/ReplaceDeviceDialog'
    import FaultDeviceList from '@/views/operationsManagement/VEMM/expressRepairCar/feedbackDialog/FaultDeviceList'
    import ImportButton from '@/components/customizeFormItem/ImportButton'
    import carApi from '@/api/operationsManagement/carTroubleTicket'
    import contractApi from '@/api/PM/contract'
    export default {
        components: {
            ImportButton,
            FaultDeviceList,
            ReplaceDeviceDialog,
            CollapseTabLayout,
            BaseForm
        },
        props: {
            visible: { type: Boolean, default: false },
            isEdit: { type: Boolean, default: false },
            dataId: { type: String, default: null }
        },
        data() {
            return {
                loading: false,
                // 故障单详情
                formData: {},
                collapseList: [
                    { disabled: true, title: '基础信息', button: false, slotName: 'BaseForm' },
                    { disabled: true, title: '故障设备', button: false, buttonSlotName: 'deviceListAction', slotName: 'deviceList' }
                ],
                // 故障设备列表
                listFaultCu: [],
                // 添加窗口
                insertDialog: {
                    visible: false,
                    params: {}
                },
                // 导入窗口
                importDialog: {
                    visible: false,
                    params: {}
                }
            }
        },
        computed: {
            title() {
                return this.isEdit ? '车辆寄修录入' : '车辆寄修详情'
            },
            isCreate() {
                return !this.dataId
            }
        },
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
                if (this.dataId) {
                    this.getDetail()
                }
            },
            getDetail() {
                this.formData = {}
                if (this.dataId) {
                    this.loading = true
                    mainApi.detail(this.dataId).then(res => {
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
                // 故障设备列表不得为空
                if (!this.listFaultCu || this.listFaultCu.length < 1) {
                    return this.$message({ type: 'warning', message: '请添加故障设备' })
                }
                // 校验表单是否合法
                this.$refs.BaseForm.submit((data) => {
                    this.loading = true
                    const postData = { ...this.formData, ...data, deviceList: this.listFaultCu }
                    mainApi.update(postData).then(res => {
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
            },
            // 导入
            hanldeBeforeUpload() {
                // 检查是否有供应商
                const formData = this.$refs.BaseForm.getFormData()
                if (!formData.objectId && !this.formData.objectId) {
                    this.$message({ type: 'warning', message: '请先选择供应商' })
                    return false
                }
                // 获取排除列表
                this.importDialog.params = {
                    filterRepairedSupplierId: formData.objectId,
                    productCategory: 'B16C3151-11D2-4364-8F45-63EFFFFCF424', // 智能设备
                    unitStatus: 1,
                    listType: 0
                }
                return true
            },
            // 供应商变更
            handleSupplierChange(val) {
                this.listFaultCu = []
                const formData = this.$refs.BaseForm.getFormData()
                this.formData = { ...this.formData, ...formData }
            },
            // 导入成功
            handleImportSuccess(data) {
                const list = data
                // 导入后用新数据与旧数据对比
                if (list && list.length) {
                    const successList = []
                    const failMessageList = []
                    // code = 0 的导入成功, 否则导入失败
                    list.map((item, index) => {
                        if (item.code === 0) {
                            successList.push(item.data)
                        } else {
                            failMessageList.push(`<p>第${(index + 1)}条数据:${item.errorMsg}</p>`)
                        }
                    })
                    // 通过IMEI字段来确定
                    this.handleSelectChange(successList, false)
                    let msg = '导入完毕'
                    if (successList.length) {
                        msg += '，导入成功：' + successList.length + '条；'
                    }
                    if (failMessageList.length) {
                        // if (batchId) {
                        //     msg += <p
                        //   className='link-text'
                        //   style='margin-bottom: 4px;'
                        //   onClick={() => this.handleDownloadFailure(batchId)
                        //   }>导入失败清单.xlsx</p>
                        // }
                        msg += '导入失败：' + failMessageList.length + '条；'
                        failMessageList.map(item_ => {
                            msg += item_
                        })
                    }
                    this.$message({
                        type: 'success',
                        duration: failMessageList.length > 0 ? 0 : 5000,
                        showClose: true,
                        message: msg,
                        dangerouslyUseHTMLString: true
                    })
                } else this.$message({ type: 'warning', message: '导入的数据有误' })
            },
            // 添加
            handleInsert() {
                // 检查是否有供应商
                const formData = this.$refs.BaseForm.getFormData()
                if (!formData.objectId && !this.formData.objectId) {
                    return this.$message({ type: 'warning', message: '请先选择供应商' })
                }
                this.insertDialog.visible = true
                const imeiList = []
                this.listFaultCu.map(item => {
                    if (item.imei) {
                        imeiList.push(item.imei)
                    }
                })
                this.insertDialog.params = {
                    filterRepairedSupplierId: formData.objectId,
                    imeiList: imeiList,
                    warehouse: formData.type === 3 ? '1' : '0',
                    optionalWarehouse: formData.type === 3 ? ['1', '2'] : ['0', '1', '2']
                }
            },
            handleDeleteRow(index, row) {
                this.listFaultCu.splice(index, 1)
            },
            // 处理选择项
            handleSelectChange(list, showMessage = true) {
                const defaultListFaultCu = JSON.parse(JSON.stringify(this.listFaultCu))
                const newListFaultCu = []
                if (list && list.length) {
                    // 登记日期默认显示当天
                    list.map(item => {
                        if (item.guidId) {
                            const newItem = {
                                customerId: item.customerId,
                                customerName: item.customerName,
                                deviceId: item.guidId,
                                imei: item.imei,
                                productCode: item.productCode,
                                productId: item.productId,
                                productName: item.productName,
                                productType: item.productType,
                                projectId: item.projectId,
                                projectName: item.projectName,
                                sectionId: item.sectionId,
                                sectionName: item.sectionName,
                                status: 0,
                                sim: item.sim,
                                // 选中标识,用于列表识别是否该条数据之前已被选中过
                                _idKey: item.imei,
                                // 维修确认时需要填写的字段
                                errorCode: item.errorCode,
                                feedback: item.feedback,
                                factoryFeedback: '',
                                factoryHandlingWay: '',
                                verificationHandlingWay: null,
                                verificationResult: null,
                                cost: 0,
                                companyBearCost: 0,
                                enterpriseBearCost: 0
                            }
                            // 判断defaultListFaultCu中是否已经有这条,如果有则不插入
                            let hasOne = false
                            defaultListFaultCu.map(_item => {
                                if (_item.imei === newItem.imei) {
                                    hasOne = true
                                }
                            })
                            // 判断newListFaultCu中是否已经有这条,如果有则不插入
                            newListFaultCu.map(_item => {
                                if (_item.imei === newItem.imei) {
                                    hasOne = true
                                }
                            })
                            if (!hasOne) {
                                newListFaultCu.push(newItem)
                            }
                        }
                    })
                }
                if (newListFaultCu.length) {
                    if (showMessage) this.$message({ type: 'success', message: '成功添加' + newListFaultCu.length + '台设备!' })
                    // 合并旧列表和新选择的列表
                    this.listFaultCu = defaultListFaultCu.concat(newListFaultCu)
                } else {
                    if (showMessage) this.$message({ type: 'warning', message: '没有新的设备被添加' })
                }
            },
            handleDownloadTemplate() {
                mainApi.downloadTemplate({})
                this.$message({ type: 'success', message: '已获取导入模板, 请按模板填写数据后导入' })
            }
            // // 下载导入失败的列表文件
            // handleDownloadFailure(batchId) {
            //     mainApi.downloadFailureList({
            //         batchId
            //     })
            // }
        }
    }
</script>

<style lang='scss' scoped>
.body-wrap {
    height: 450px;
}
</style>
