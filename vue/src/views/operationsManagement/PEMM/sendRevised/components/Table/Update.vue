<!--
* @description 更新表格
* @author yc
!-->
<template>
    <el-collapse-item name="2" class="hide-arrow flex" disabled>
        <div slot="title" class="title">
            <div class="text">寄修设备</div>
            <el-button
                v-waves
                v-if="!isCreate"
                size="mini"
                class="filter-button"
                type="warning"
                icon="el-icon-download"
                @click="handleExport"
            >导出</el-button>
            <template v-if="isEdit">
                <ImportButton
                    :upload-data="uploadData"
                    :download-method="handleDownloadMethod"
                    :before-upload="handleBeforeUpload"
                    action="express/device-waiting-repair/import"
                    class="filter-button"
                    type="primary"
                    template-name="导入模板.xlsx"
                    style="margin-left: 10px;"
                    @success="handleImportSuccess"
                />
                <el-button
                    type="success"
                    size="mini"
                    icon="el-icon-plus"
                    style="margin-left: 10px;"
                    @click="handleSelectDevice"
                >选择</el-button>
            </template>
        </div>
        <layout-col class="device-wrap">
            <layout-row auto not-flex class="body-wrap">
                <TableComponent
                    ref="TableComponent"
                    v-bind="tableData"
                    :page-index.sync="publicParam.pageIndex"
                    :page-size.sync="publicParam.pageSize"
                />
            </layout-row>
        </layout-col>
        <div>
            <SelectDialog
                v-if="sendRevisedDevice.visible"
                v-bind="sendRevisedDevice"
                :visible.sync="sendRevisedDevice.visible"
                title="选择寄修设备"
                @change="handleDeviceFailureChange"
            />
            <ReplaceDeviceDialog
                v-if="replaceDeviceDialog.visible"
                v-bind="replaceDeviceDialog"
                :visible.sync="replaceDeviceDialog.visible"
                @change="handleDeviceChange"
            />
        </div>
    </el-collapse-item>
</template>

<script>
    // 表单列配置
    import scrapDeviceColumns from '@/views/inventoryManagement/intelligentDevice/tableColumns/smart_6'// 报废设备
    // API
    import sendRevisedApi from '@/api/operationsManagement/sendRevised'
    // 方法
    import mixin from './mixin'
    // 组件
    import ReplaceDeviceDialog from '../ReplaceDeviceDialog'

    export default {
        name: 'Update',
        components: {
            ReplaceDeviceDialog
        },
        mixins: [mixin],
        data() {
            return {
                loading: false,
                uploadData: {},
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: '100%'
                    }
                },
                sendRevisedDevice: {
                    visible: false
                },
                replaceDeviceDialog: {
                    visible: false
                }
            }
        },
        computed: {
        },
        watch: {
            formData: {
                immediate: true,
                handler(data) {
                    if (data) {
                        this.updateTableConfig()
                        switch (data.type) {
                        case 0:
                        case 2:
                            this.deviceList = (data.updateDevices || []).map(v => v)
                            break
                        case 1:
                        case 3:
                            this.deviceList = (data.smartList || []).map(v => v)
                            break
                        }
                        this.uploadData = {
                            type: data.type,
                            supplierId: data.supplierId,
                            expressRepairId: data.guidId || ''
                        }
                        this.filterData()
                    }
                }
            },
            'formData.type'() {
                this.updateTableConfig()
            }
        },
        mounted() {

        },
        methods: {
            // 更新表格配置
            updateTableConfig() {
                switch (this.formData.type) {
                case 0:
                case 2:
                    this.tableData.columns = [
                        {
                            prop: 'imei',
                            label: 'IMEI',
                            sortable: 'custom',
                            width: 150,
                            isClick: ({ row }) => row.deviceId,
                            dialogType: 'device',
                            idKey: 'deviceId'
                        },
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            width: 100
                        },
                        {
                            prop: 'faultCode',
                            label: '故障单号',
                            width: 155,
                            isClick: true,
                            dialogType: 'troubleTicket',
                            idKey: 'faultId'
                        },
                        {
                            type: 'date',
                            prop: 'createTime',
                            label: '创建时间',
                            sortable: 'custom',
                            width: 100
                        },
                        {
                            prop: 'createUserName',
                            label: '创建人',
                            width: 80
                        },
                        {
                            prop: 'projectName',
                            label: '所属项目',
                            minWidth: 200,
                            isClick: true,
                            idKey: 'projectId',
                            dialogType: 'project'
                        },
                        {
                            prop: 'sectionName',
                            label: '所属标段',
                            minWidth: 200,
                            idKey: 'sectionId',
                            isClick: true,
                            dialogType: 'sections'
                        },
                        {
                            prop: 'customerName',
                            label: '所属企业',
                            width: 180
                        },
                        {
                            prop: 'ownerName',
                            label: '持有人',
                            width: 100
                        },
                        {
                            prop: 'expressNo',
                            label: '企业运单号',
                            width: 120
                        },
                        {
                            type: 'date',
                            prop: 'arrivalDate',
                            label: '收到日期',
                            sortable: 'custom',
                            width: 100
                        },
                        {
                            prop: 'enterpriseFeedback',
                            label: '企业反馈异常',
                            width: 160
                        },
                        {
                            type: 'date',
                            prop: 'lastRepairTime',
                            label: '上次寄修时间',
                            sortable: 'custom',
                            width: 120
                        },
                        {
                            type: 'dict',
                            dictType: 'isSecondRepair',
                            prop: 'secondRepair',
                            label: '二次返修',
                            width: 80
                        },
                        {
                            prop: 'clientFeedback',
                            label: '客服诊断结果',
                            width: 160
                        },
                        {
                            prop: 'replaceImei',
                            label: '替换设备编号',
                            width: 140
                        },
                        {
                            type: 'dict',
                            dictType: 'troubleReplaceType',
                            prop: 'replaceType',
                            label: '替换类型',
                            width: 100
                        },
                        {
                            type: 'date',
                            prop: 'completeTime',
                            label: '检测完成时间',
                            width: 140
                        }
                    ]
                    break
                case 1:
                case 3:
                    var columns = [...scrapDeviceColumns.columns]
                    columns.splice(6, 0, {
                        prop: 'clientFeedback',
                        label: '客服诊断结果',
                        width: 220,
                        render: this.isEdit && ((h, { row, column }) => {
                            return (
                                <history-select
                                    clearable
                                    type='7'
                                    value={row[column.prop]}
                                    productId={row.productId}
                                    onInput={res => { row[column.prop] = res }}
                                />
                            )
                        })
                    })
                    this.tableData.columns = columns
                    break
                }
                this.filterData()
            },
            // 点击导出按钮时触发
            handleExport() {
                var data = { ...this.searchParam }
                data.guidId = this.formData.guidId
                data.pageSize = this.tableData.total
                sendRevisedApi.editExport(data)
            },
            // 点击选择寄修设备按钮时触发
            handleSelectDevice() {
                this.parent.validate().then(data => {
                    switch (data.type) {
                    case 0:
                    case 2:
                        // 选择故障单
                        this.sendRevisedDevice = {
                            type: 'deviceFailure',
                            value: this.deviceList,
                            visible: true,
                            multiple: true,
                            customRequest: sendRevisedApi.getFaultDevices,
                            extendParams: {
                                status: 2,
                                handlingWay: 0,
                                isFromExpress: 1,
                                supplierId: data.supplierId
                            }
                        }
                        break
                    case 1:
                    case 3:
                        // 选择报损设备
                        this.replaceDeviceDialog = {
                            value: this.deviceList,
                            visible: true,
                            params: {
                                supplierId: data.supplierId
                            },
                            warehouse: data.type === 3 ? '1' : '0',
                            optionalWarehouse: data.type === 3 ? ['1', '2'] : ['0', '1', '2']
                        }
                        break
                    }
                })
            },
            // 选择设备后触发
            handleDeviceChange(list) {
                this.deviceList = list.map(item => {
                    this.$set(item, 'clientFeedback', null)
                    return item
                })
                this.publicParam.pageIndex = 1
                this.filterData()
            },
            // 选择故障设备后触发
            handleDeviceFailureChange(list) {
                list = list.filter(item => {
                    return this.deviceList.findIndex(v => v.guidId === item.guidId) === -1
                }).map(item => {
                    item.faultCode = item.code
                    item.createTime = item.regisTime
                    item.createUserName = item.regisUserName
                    item.replaceImei = item.replaceUnitImei
                    return item
                })
                this.deviceList = this.deviceList.concat(list)
                this.publicParam.pageIndex = 1
                this.filterData()
            },
            // 点击导入按钮前触发
            handleBeforeUpload() {
                return this.parent.validate()
            },
            // 下载模板
            handleDownloadMethod() {
                sendRevisedApi.createTemplate({
                    type: this.formData.type
                })
            },
            // 下载导入失败的列表文件
            handleDownloadFailure(id) {
                sendRevisedApi.downloadFailureList(id, {
                    isCreateOrUpdate: 1
                })
            },
            // 导入成功时触发
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
                let { type } = this.formData
                this.deviceList = data.filter(v => v.code === 0).map(v => v.data).filter(item => {
                    switch (type) {
                    case 0:
                    case 2:
                        item.faultCode = item.code
                        item.createTime = item.regisTime
                        item.createUserName = item.regisUserName
                        item.replaceImei = item.replaceUnitImei
                        break
                    case 1:
                        item.clientFeedback = item.clientFeedback || ''
                        break
                    }
                    return item
                })
                this.filterData()
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
