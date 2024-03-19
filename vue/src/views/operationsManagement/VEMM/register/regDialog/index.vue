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
                            :is-edit="isEdit"
                            :disabled="!isEdit"
                            @supplier="handleSupplierChange"
                        />
                    </template>
                    <template slot="deviceList">
                        <FaultDeviceList
                            ref="deviceList"
                            :data-list="listFaultCu"
                            :is-edit="!isDetail"
                            @delete="handleDeleteRow"
                        />
                    </template>
                    <template slot="deviceListAction">
                        <div v-if="!isDetail" class="deviceListAction">
                            <ImportButton
                                :before-upload="hanldeBeforeUpload"
                                :download-method="handleDownloadTemplate"
                                :upload-data="importDialog.params"
                                type="primary"
                                action="/fault-repair-car/import-fault-car"
                                title="导入故障设备"
                                template-name="故障设备导入模板.xlsx"
                                @success="handleImportSuccess"
                            />
                            <el-button type="success" icon="el-icon-plus" @click="handleInsert">添加</el-button>
                        </div>
                    </template>
                </collapse-tab-layout>
            </div>
            <span slot="footer">
                <el-button size="mini" @click="$emit('update:visible', false)">取 消</el-button>
                <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit">保 存</el-button>
            </span>
        </el-dialog>
        <InsertDialog
            v-if="insertDialog.visible"
            :visible="insertDialog.visible"
            :data-id="insertDialog.dataId"
            :select-list="listFaultCu"
            @close="insertDialog.visible = false"
            @confirm="handleSelectChange"
        />
    </div>
</template>

<script>
    import BaseForm from './BaseForm'
    import CollapseTabLayout from '@/components/CollapseTabLayout'
    import troubleApi from '@/api/operationsManagement/carTroubleTicket'
    import InsertDialog from '@/views/operationsManagement/VEMM/register/regDialog/insertDialog'
    import FaultDeviceList from '@/views/operationsManagement/VEMM/register/regDialog/FaultDeviceList'
    import ImportButton from '@/components/customizeFormItem/ImportButton'
    import carApi from '@/api/operationsManagement/carTroubleTicket'
    import deviceApi from '@/api/inventory/device'
    import moment from 'moment'
    import mainApi from '@/api/operationsManagement/expressRepairCar'
    export default {
        components: {
            ImportButton,
            FaultDeviceList,
            InsertDialog,
            CollapseTabLayout,
            BaseForm
        },
        props: {
            visible: { type: Boolean, default: false },
            isEdit: { type: Boolean, default: false },
            dataId: { type: String, default: null },
            isDetail: { type: Boolean, default: false }
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
                    dataId: null
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
                return this.isDetail ? '维修单详情' : '车辆维修登记'
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
                if (this.isDetail) {
                    this.getDetail()
                }
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
            handleSubmit() {
                // 故障设备列表不得为空
                if (!this.listFaultCu || this.listFaultCu.length < 1) {
                    return this.$message({ type: 'warning', message: '请添加故障设备' })
                }
                // 先检查故障设备列表是否合法
                this.$refs.deviceList.submit().then(() => {
                    // 再校验表单是否合法
                    this.$refs.BaseForm.submit((data) => {
                        this.loading = true
                        const postData = { ...data, listFaultCu: this.listFaultCu }
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
                }).catch(() => {})
            },
            // 导入
            hanldeBeforeUpload() {
                // 检查是否有供应商
                const formData = this.$refs.BaseForm.getFormData()
                if (!formData.supplierId && !this.formData.supplierId) {
                    this.$message({ type: 'warning', message: '请先选择供应商' })
                    return false
                }
                // 获取排除列表
                const imeiList = []
                this.listFaultCu.map(item => {
                    if (item.imei) {
                        imeiList.push(item.imei)
                    }
                })
                this.importDialog.params = {
                    supplierId: formData.supplierId,
                    warehousesId: 'bc5fe3a9-5b92-4aad-b7fe-acc62dcc82de', // 事业部仓库
                    typeId: 'cf946c33-9f2c-11eb-bbfa-000c29bb1337', // 在运营仓位
                    imeiList: imeiList,
                    productType: '95E968C3-D1BE-4A6C-93A8-6AF62558B909',
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
            handleImportSuccess({ data, batchId }) {
                let failure = data.reduce((a, b) => {
                    if (b.code > 0) {
                        return a + 1
                    }
                    return a
                }, 0)
                let succeed = data.length - failure
                let messageNode = (
                <div class='el-message__content'>
                  <p style='margin-bottom: 4px;'>导入成功{succeed}条数据，导入失败{failure}条数据</p>
                  {
                    batchId ? <p
                      class='link-text'
                      style='margin-bottom: 4px;'
                      onClick={() => this.handleDownloadFailure(batchId)
                      }>导入失败清单.xlsx</p> : ''
                  }
                  {
                    data.map((item, index) => {
                      if (item.code > 0) {
                        return <p>第{index + 1}行：{item.errorMsg}</p>
                      }
                    })
                  }
                </div>
              )
                this.$message({
                    type: 'success',
                    duration: failure > 0 ? 0 : 5000,
                    showClose: true,
                    message: messageNode,
                    dangerouslyUseHTMLString: true
                })
                // 通过IMEI字段来确定
                const list = []
                data.map(item => {
                    if (item.code === 0) {
                        list.push(item.data)
                    }
                })
                this.handleSelectChange(list, false)
            },
            // 添加
            handleInsert() {
                // 检查是否有供应商
                const formData = this.$refs.BaseForm.getFormData()
                if (!formData.supplierId && !this.formData.supplierId) {
                    return this.$message({ type: 'warning', message: '请先选择供应商' })
                }
                this.insertDialog.visible = true
                this.insertDialog.dataId = formData.supplierId
            },
            handleDeleteRow(index, row) {
                this.listFaultCu.splice(index, 1)
            },
            // 处理选择项
            handleSelectChange(list, showMessage = true) {
                // list是应收账款列表, 需要处理为维修设备列表接口需要的数据形式
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
                                purchaseSupplierId: item.supplierId,
                                purchaseSupplierName: item.supplierName,
                                sectionId: item.sectionId,
                                sectionName: item.sectionName,
                                status: 0,
                                sim: item.sim,
                                // 选中标识,用于列表识别是否该条数据之前已被选中过
                                _idKey: item.imei,
                                // 待填字段,用于添加后编辑内容
                                carNumber: item.carNumber || '',
                                errorCode: item.errorCode,
                                feedback: item.feedback || '',
                                // 登记日期默认显示当天
                                registerDate: item.registerDate || moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                                // 维修确认时需要填写的字段
                                factoryFeedback: '',
                                factoryHandlingWay: '',
                                isReplaceDevice: false,
                                isReplaceCard: false,
                                labourCost: 0,
                                cost: 0,
                                handlingWay: '',
                                companyBearCost: 0,
                                enterpriseBearCost: 0,
                                replaceSim: '',
                                replaceDeviceId: '',
                                replaceType: '',
                                replaceImei: '',
                                lastRepairTime: ''
                            }
                            // 通过imei获取最后维修时间
                            deviceApi.getLastRepairedTime(item.imei).then(res => {
                                newItem.lastRepairTime = res.data ? res.data.lastRepairTime : ''
                            })
                            // 判断listFaultCu中是否已经有这条,如果没有则添加
                            let hasOne = false
                            defaultListFaultCu.map(_item => {
                                if (_item.deviceId === newItem.deviceId) {
                                    hasOne = true
                                }
                            })
                            newListFaultCu.map(_item => {
                                if (_item.deviceId === newItem.deviceId) {
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
                carApi.downloadFault({ tem: 1 })
                this.$message({ type: 'success', message: '已获取导入模板, 请按模板填写数据后导入' })
            },
            // 下载导入失败的列表文件
            handleDownloadFailure(batchId) {
                carApi.downloadFailureList({
                    batchId
                })
            }
        }
    }
</script>

<style lang='scss' scoped>
.body-wrap {
    height: 450px;
}
</style>
