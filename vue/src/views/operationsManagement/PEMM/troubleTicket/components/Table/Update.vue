<!--
* @description 更新表格
* @author yc
!-->
<template>
    <el-collapse-item name="2" class="hide-arrow flex" disabled>
        <div slot="title" class="title">
            <div class="text">故障设备</div>
            <template v-if="isEdit">
                <ImportButton
                    :before-upload="handleBeforeUpload"
                    :action="importAction"
                    :download-method="downloadMethod"
                    title="导入故障设备"
                    template-name="故障设备导入模板.xlsx"
                    @success="handleImportSuccess"
                />
            </template>
        </div>
        <layout-col class="device-wrap">
            <layout-row v-if="isEdit" justify="flex-end" class="head-wrap">
                <div class="form-item">
                    <div class="label">IMEI</div>
                    <div class="value">
                        <pick-input
                            v-model="deviceData.imei"
                            clearable
                            placeholder="IMEI"
                            class="filter-item"
                            @pick="handlePickDevice"
                            @blur="validateFaultImei"
                            @clear="handleClearDevice"
                            @change="validateFaultImei"
                        >
                            <span slot="icon">选</span>
                        </pick-input>
                    </div>
                </div>
                <div class="form-item auto">
                    <div class="label">产品编号</div>
                    <div class="value">
                        <el-input
                            v-model="deviceData.productCode"
                            placeholder="产品编号"
                            size="mini"
                            disabled
                            class="filter-item"
                        />
                    </div>
                </div>
                <div class="form-item auto">
                    <div class="label">企业反馈异常</div>
                    <div class="value">
                        <history-select
                            v-model="deviceData.enterpriseFeedback"
                            :product-id="deviceData.productId"
                            clearable
                            type="1"
                            class="filter-item"
                        />
                    </div>
                </div>
                <div class="form-item">
                    <div class="label">持有人</div>
                    <div class="value">
                        <el-input
                            v-model="deviceData.ownerName"
                            placeholder="持有人"
                            size="mini"
                            clearable
                            class="filter-item"
                            style="width: 120px"
                        />
                    </div>
                </div>
                <div class="form-item auto">
                    <div class="label">企业运单号</div>
                    <div class="value">
                        <el-input
                            v-model="deviceData.expressNo"
                            placeholder="企业运单号"
                            size="mini"
                            clearable
                            class="filter-item"
                        />
                    </div>
                </div>
                <div class="form-item">
                    <div class="label">收到日期</div>
                    <div class="value">
                        <el-date-picker
                            v-model="deviceData.arrivalDate"
                            type="date"
                            format="yyyy-MM-dd"
                            value-format="yyyy-MM-dd HH:mm:ss"
                            placeholder="收到日期"
                            clearable
                            class="filter-item"
                            style="width: 140px"
                        />
                    </div>
                </div>
                <div class="form-item">
                    <div class="label">操作</div>
                    <div class="value">
                        <el-button
                            v-waves
                            :loading="validateLoading"
                            size="mini"
                            class="filter-button"
                            type="success"
                            icon="el-icon-plus"
                            @click="handleAddDevice"
                        >添加</el-button>
                    </div>
                </div>
            </layout-row>
            <layout-row auto not-flex class="body-wrap">
                <TableComponent
                    ref="TableComponent"
                    v-bind="tableData"
                    :page-index.sync="searchParam.pageIndex"
                    :page-size.sync="searchParam.pageSize"
                >
                    <template slot="操作" slot-scope="{row}">
                        <el-dropdown trigger="click" size="small">
                            <el-button size="mini" icon="el-icon-more" title="操作" />
                            <el-dropdown-menu slot="dropdown">
                                <div class="layout-dropdown-item" @click="handleDeleteDevice(row)">
                                    <el-dropdown-item icon="el-icon-delete" divided>删除</el-dropdown-item>
                                </div>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </template>
                </TableComponent>
            </layout-row>
        </layout-col>
        <div>
            <!-- 信息窗口 -->
            <MessageDialog
                v-bind="messageDialog"
                :loading="messageDialog.loading"
                :visible.sync="messageDialog.visible"
                @confirm="handleMessageDialogConfirm"
            >
                <div v-if="messageDialog.isUnrecognized" class="temp-miei">
                    <el-checkbox
                        v-model="messageDialog.unrecognized"
                        @change="messageDialog.confirmText = messageDialog.unrecognized ? '添加' : '确定'"
                    >无法识别设备的IMEI号</el-checkbox>
                    <div v-if="messageDialog.unrecognized" class="form-item">
                        <DialogPick
                            v-model="messageDialog"
                            :params="dialogPickParams"
                            type="product"
                            style="width: 220px"
                            placeholder="选择产品编号"
                        />
                        <el-input
                            v-model="messageDialog.tempImei"
                            clearable
                            readonly
                            placeholder="临时IMEI"
                        />
                    </div>
                </div>
            </MessageDialog>
            <!-- 选择出库设备 -->
            <DeviceDialog
                v-if="deviceDialog.visible"
                v-bind="deviceDialog"
                :visible.sync="deviceDialog.visible"
                @change="handleSelectDialogChange"
            />
        </div>
    </el-collapse-item>
</template>

<script>

    // API
    import deviceApi from '@/api/inventory/device'
    import troubleTicketApi from '@/api/operationsManagement/troubleTicket'
    // 方法
    import moment from 'moment'
    import { isEmpty } from '@/utils'
    // 组件
    import ImportButton from '@/components/customizeFormItem/ImportButton'
    import DeviceDialog from './DeviceDialog'

    const defaultDeviceData = {
        imei: '',
        ownerName: '',
        expressNo: '',
        arrivalDate: moment().format('yyyy-MM-DD') + ' 00:00:00',
        productType: '288F8C2D-9CEB-46FC-87C9-DC4C16108162',
        enterpriseFeedback: '',
        imeiUnidentified: 1,
        _isValidate: false
    }

    export default {
        name: 'UpdateTable',
        components: {
            ImportButton,
            DeviceDialog
        },
        props: {
            isEdit: { type: Boolean, default: false },
            formData: { type: Object, default: () => ({}) }
        },
        data() {
            let inputRender = (h, { row, column }) => {
                var key = column.prop
                return (
                    <el-input
                        value={row[key]}
                        onInput={res => { row[key] = res }}
                        placeholder={column.label}
                        size='mini'
                        type='text'
                    />
                )
            }
            return {
                dataList: [],
                deviceData: { ...defaultDeviceData },
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'imei',
                            label: 'IMEI',
                            minWidth: 160,
                            disabled: true,
                            isClick: ({ row }) => row.deviceId && row.imeiUnidentified !== 0,
                            dialogType: 'device',
                            idKey: 'deviceId'
                        },
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            width: 160,
                            disabled: true
                        },
                        {
                            prop: 'ownerName',
                            label: '持有人',
                            width: 120,
                            disabled: true,
                            render: this.isEdit && inputRender
                        },
                        {
                            prop: 'expressNo',
                            label: '企业运单号',
                            width: 180,
                            disabled: true,
                            render: this.isEdit && inputRender
                        },
                        {
                            type: this.isEdit ? null : 'date',
                            prop: 'arrivalDate',
                            label: '收到日期',
                            width: 160,
                            render: this.isEdit && ((h, { row, column }) => {
                                var key = column.prop
                                return (
                                    <el-date-picker
                                        value={row[key]}
                                        type='date'
                                        format='yyyy-MM-dd'
                                        value-format='yyyy-MM-dd HH:mm:ss'
                                        placeholder={column.label}
                                        clearable
                                        onInput={res => { row[key] = res }}
                                        style='width: 100%'
                                    />
                                )
                            })
                        },
                        {
                            prop: 'enterpriseFeedback',
                            label: '企业反馈异常',
                            width: 220,
                            render: this.isEdit && ((h, { row, column }) => {
                                return (
                                    <history-select
                                        clearable
                                        type='1'
                                        value={row[column.prop]}
                                        productId={row.productId}
                                        onInput={res => { row[column.prop] = res }}
                                    />
                                )
                            })
                        },
                        {
                            type: 'date',
                            prop: 'lastRepairTime',
                            label: '上次寄修时间',
                            width: 120
                        }
                    ],
                    options: {
                        rules: {
                            arrivalDate: { required: true, message: '请选择收到日期', trigger: 'change' },
                            enterpriseFeedback: { required: true, message: '企业反馈异常不能为空', trigger: 'change' }
                        },
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: '100%',
                        showAsterisk: this.isEdit
                    },
                    // 列操作按钮
                    operates: {
                        width: 67,
                        fixed: 'right',
                        show: this.isEdit
                    }
                },
                searchParam: {
                    pageSize: 10,
                    pageIndex: 1
                },
                importAction: '',
                validateLoading: false,
                deviceDialog: {
                    visible: false
                },
                messageDialog: {
                    visible: false
                },
                downloadMethod: troubleTicketApi.downloadTemplate,
                dialogPickParams: {
                    prop: 'productCode',
                    title: '选择产品',
                    formKey: ['productId', 'productCode'],
                    dataKey: ['guidId', 'code'],
                    labelKey: 'code',
                    excludes: [],
                    customRequest: deviceApi.getListCondition,
                    extendParams: {
                        type: '288F8C2D-9CEB-46FC-87C9-DC4C16108162',
                        sectionId: '',
                        lockedProps: ['type']
                    }
                }
            }
        },
        computed: {
        },
        watch: {
            formData: {
                deep: true,
                immediate: true,
                handler(data) {
                    if (data) {
                        this.dataList = (data.devices || []).map(item => {
                            if (item.imeiUnidentified === 0) {
                                item.imei = item.imei || item.tempImei
                            }
                            return item
                        })
                        this.importAction = 'fault/import/' + data.sectionId
                        this.filterData()
                    }
                }
            },
            'searchParam.pageSize'() {
                this.filterData()
            },
            'searchParam.pageIndex'() {
                this.filterData()
            }
        },
        mounted() {
            this.parent = null
            this.$emit('ready', this)
        },
        methods: {
            // 验证表单
            validate() {
                return new Promise((resolve, reject) => {
                    var list = this.dataList
                    if (list.length) {
                        // 当存在多页的时候，需要验证每一页
                        var pageTotal = Math.ceil(this.tableData.total / this.searchParam.pageSize)
                        var recursion = (pageIndex) => {
                            this.searchParam.pageIndex = pageIndex
                            this.$nextTick(() => {
                                this.$refs.TableComponent.validate().then(() => {
                                    if (++pageIndex <= pageTotal) {
                                        recursion(pageIndex)
                                    } else {
                                        resolve(list)
                                    }
                                }).catch(reject)
                            })
                        }
                        recursion(1)
                    } else {
                        this.$message.warning('故障设备列表不能为空！')
                        reject()
                    }
                })
            },
            // 筛选数据
            filterData() {
                let { pageSize, pageIndex } = this.searchParam
                var list = this.dataList || []
                this.tableData.total = list.length
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
            },
            // 获取临时IMEI
            getTempImei() {
                troubleTicketApi.getTempImei({
                    tempImeis: this.dataList.filter(v => v.imeiUnidentified === 0 && isEmpty(v.deviceId)).map(v => v.imei)
                }).then(res => {
                    this.messageDialog.loading = false
                    this.messageDialog.tempImei = res.data
                })
            },
            // 获取提交数据
            getFormData() {
                return this.dataList
            },
            // 验证故障设备IMEI
            async validateFaultImei() {
                // 验证基础信息表单
                await this.parent.validate()
                var imei = this.deviceData.imei
                if (imei) {
                    if (this.dataList.findIndex(v => v.imei === imei) === -1) {
                        this.validateLoading = true
                        try {
                            var { data } = await troubleTicketApi.validDevice({
                                imei,
                                sectionId: this.formData.sectionId
                            })
                            if (data.code > 0) {
                                switch (data.code) {
                                case 1:
                                    this.messageDialog = {
                                        visible: true,
                                        content: `当前添加的设备【<span class="high">${imei}</span>】与故障单的标段信息不一致，无法添加该设备。`
                                    }
                                    break
                                default:
                                    this.messageDialog = {
                                        visible: true,
                                        content: data.errorMsg
                                    }
                                    break
                                }
                                this.handleClearDevice()
                            } else {
                                var { deviceId, productId, productCode, ownerName, lastRepairTime } = data.data
                                this.deviceData = {
                                    ...this.deviceData,
                                    deviceId,
                                    productId,
                                    productCode,
                                    ownerName,
                                    lastRepairTime,
                                    _isValidate: true
                                }
                            }
                        } catch (e) {
                            console.log(e)
                        }
                        this.validateLoading = false
                    } else {
                        this.$message.warning('该IMEI已在故障设备列表中！')
                    }
                } else {
                    this.messageDialog = {
                        loading: true,
                        visible: true,
                        content: '设备IMEI信息为空。',
                        tempImei: '',
                        productId: '',
                        productCode: '',
                        confirmText: '确定',
                        unrecognized: false,
                        isUnrecognized: true
                    }
                    this.getTempImei()
                    this.dialogPickParams.extendParams.sectionId = this.formData.sectionId
                }
            },
            // 添加故障设备
            handleAddDevice() {
                if (this.deviceData._isValidate) {
                    this.dataList.push(this.deviceData)
                    this.deviceData = {
                        ...defaultDeviceData,
                        expressNo: this.deviceData.expressNo
                    }
                    this.deviceDialog.value = ''
                    this.filterData()
                } else {
                    this.validateFaultImei().then(() => {
                        if (this.deviceData._isValidate) {
                            this.handleAddDevice()
                        }
                    })
                }
            },
            // 点击选择设备时触发
            handlePickDevice() {
                this.parent.validate().then(() => {
                    let { imei, deviceId, productCode } = this.deviceData
                    this.deviceDialog = {
                        value: {
                            imei,
                            guidId: deviceId,
                            productCode
                        },
                        params: {
                            unitStatus: 1, // 正常状态
                            sectionId: this.formData.sectionId, // 标段id
                            productType: '288F8C2D-9CEB-46FC-87C9-DC4C16108162', // 人员智能设备
                            productCategory: 'B16C3151-11D2-4364-8F45-63EFFFFCF424', // 智能设备
                            lockedProps: ['sectionId', 'productType'],
                            selectDeviceIds: this.dataList.filter(v => v.deviceId).map(v => v.deviceId)
                        },
                        visible: true
                    }
                })
            },
            // 清空设备添加表单
            handleClearDevice() {
                this.deviceData = {
                    ...defaultDeviceData,
                    expressNo: this.deviceData.expressNo
                }
            },
            // 选择设备后触发
            handleSelectDialogChange([data]) {
                this.deviceData = {
                    ...this.deviceData,
                    imei: data.imei,
                    deviceId: data.guidId,
                    productCode: data.productCode
                }
                this.validateFaultImei()
            },
            // 删除设备时触发
            handleDeleteDevice(data) {
                var index = this.dataList.findIndex(item => item === data)
                if (index > -1) {
                    this.dataList.splice(index, 1)
                }
                this.filterData()
            },
            // 导入文件上传前触发
            handleBeforeUpload() {
                return this.parent.validate()
            },
            // 导入成功时触发
            handleImportSuccess(data) {
                var failure = data.reduce((a, b) => {
                    if (b.code > 0) {
                        return a + 1
                    }
                    return a
                }, 0)
                var succeed = data.length - failure
                var messageNode = `<p style="margin-bottom: 4px;">导入成功${succeed}条数据，导入失败${failure}条数据</p>`
                messageNode += data.map((item, index) => {
                    if (item.code > 0) {
                        return `<p>第${index + 1}行：${item.errorMsg}</p>`
                    }
                }).filter(v => v).join('')
                this.$message({
                    type: 'success',
                    duration: 0,
                    showClose: true,
                    message: messageNode,
                    dangerouslyUseHTMLString: true
                })
                this.dataList = data.filter(item => item.code === 0).map(item => {
                    if (item.data.arrivalDate) {
                        item.data.arrivalDate = moment(item.data.arrivalDate).format('YYYY-MM-DD HH:mm:ss')
                    }
                    return item.data
                })
                this.filterData()
            },
            // 点击弹窗确定按钮时触发
            handleMessageDialogConfirm() {
                if (this.messageDialog.unrecognized) {
                    var { productId } = this.messageDialog
                    if (!productId) {
                        return this.$message.warning('请选择产品编号！')
                    } else {
                        let { tempImei, productId, productCode } = this.messageDialog
                        this.dataList.splice(0, 0, {
                            ...this.deviceData,
                            imei: tempImei,
                            productId,
                            productCode,
                            imeiUnidentified: 0
                        })
                        this.filterData()
                        this.handleClearDevice()
                    }
                }
                this.messageDialog.visible = false
            }
        }
    }
</script>

<style lang='scss' scoped>
.head-wrap {
    border: 1px solid #efefef;
    margin-bottom: 10px;
    .form-item {
        text-align: center;
        &.auto {
            flex: 1;
        }
        &:last-child {
            flex: initial;
        }
        & + .form-item {
            border-left: 1px solid #efefef;
        }
        .label {
            line-height: 30px;
            white-space:nowrap;
            border-bottom: 1px solid #efefef;
        }
        .value {
            padding: 10px;
        }
    }
}
.temp-miei {
    .el-checkbox {
        display: block;
        margin-top: 10px;
        .el-checkbox__label {
            color: #999;
            font-size: 13px;
        }
    }
    .form-item {
        display: flex;
        align-items: center;
        margin-top: 10px;
        .el-input {
            flex: 1;
            margin-left: 15px;
        }
    }
}
</style>
