<!--
* @description 维修反馈表格
* @author yc
!-->
<template>
    <el-collapse-item name="2" class="hide-arrow flex" disabled>
        <div slot="title" class="title">
            <div class="text">寄修设备</div>
        </div>
        <layout-col class="device-wrap">
            <layout-row auto not-flex class="body-wrap">
                <layout-filter
                    :table-columns.sync="tableData.columns"
                    :filter-model.sync="searchParam"
                    @search="handleFilter"
                >
                    <template slot="button">
                        <el-button
                            v-waves
                            size="mini"
                            class="filter-button"
                            type="warning"
                            icon="el-icon-download"
                            @click="handleExport"
                        >导出</el-button>
                        <template v-if="isEdit">
                            <ImportButton
                                :action="importAction"
                                :download-method="handleDownloadTemplate"
                                title="导入维修反馈单"
                                template-name="维修反馈单导入模板.xlsx"
                                style="margin-left: 10px;"
                                @success="handleImportSuccess"
                            />
                        </template>
                    </template>
                    <template slot="filter">
                        <el-input
                            v-model="searchParam.imei"
                            size="mini"
                            placeholder="IMEI"
                            clearable
                            class="filter-item"
                            @change="handleFilter"
                        />
                    </template>
                    <template slot="table">
                        <TableComponent
                            ref="TableComponent"
                            v-bind="tableData"
                            :page-index.sync="publicParam.pageIndex"
                            :page-size.sync="publicParam.pageSize"
                        />
                    </template>
                </layout-filter>
            </layout-row>
        </layout-col>
        <div>
            <SelectDialog
                v-if="selectDialog.visible"
                v-bind="selectDialog"
                :visible.sync="selectDialog.visible"
                @change="handleSelectDialogChange"
            />
            <DeviceDialog
                v-if="deviceDialog.visible"
                v-bind="deviceDialog"
                :visible.sync="deviceDialog.visible"
                @change="handleDeviceDialogChange"
            />
        </div>
    </el-collapse-item>
</template>

<script>
    // API
    import sendRevisedApi from '@/api/operationsManagement/sendRevised'
    // 方法
    import mixin from './mixin'
    import { isEmpty, filterList } from '@/utils'
    // 组件
    import ImportButton from '@/components/customizeFormItem/ImportButton'
    import DeviceDialog from '@/views/operationsManagement/PEMM/troubleTicket/components/Table/DeviceDialog'

    export default {
        name: 'Update',
        components: {
            ImportButton,
            DeviceDialog
        },
        mixins: [mixin],
        data() {
            return {
                loading: false,
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'imei',
                            label: 'IMEI',
                            fixed: 'left',
                            minWidth: this.isEdit ? 210 : 180,
                            render: this.isEdit && ((h, { row }) => {
                                return (
                                    <pick-input
                                        value={row.imei || row.tempImei}
                                        clearable={!!row.deviceId}
                                        placeholder='IMEI'
                                        readonly
                                        onPick={() => {
                                            this.handleFillUpDevice(row)
                                        }}
                                        onClear={() => {
                                            row.imei = ''
                                            row.deviceId = ''
                                        }}
                                    >
                                        <span slot='icon'>补</span>
                                    </pick-input>
                                )
                            }),
                            isClick: ({ row }) => row.deviceId,
                            isRender: ({ row }) => row.imeiUnidentified === 0 && row._canEditProps.includes('deviceId'),
                            dialogType: 'device',
                            idKey: 'deviceId'
                        },
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            width: 100
                        },
                        {
                            prop: 'enterpriseFeedback',
                            label: '企业反馈异常',
                            width: 160
                        },
                        {
                            prop: 'clientFeedback',
                            label: '客服诊断结果',
                            width: 160
                        },
                        {
                            type: 'dict',
                            dictType: 'isSecondRepair',
                            prop: 'secondRepair',
                            label: '二次返修',
                            width: 100
                        },
                        {
                            prop: 'factoryFeedback',
                            label: '厂家诊断结果',
                            width: 220,
                            render: this.isEdit && ((h, { row, column }) => {
                                return (
                                    <history-select
                                        clearable
                                        type='3'
                                        value={row[column.prop]}
                                        productId={row.productId}
                                        onInput={res => { row[column.prop] = res }}
                                    />
                                )
                            })
                        },
                        {
                            prop: 'factoryHandlingWay',
                            label: '厂家处理方式',
                            width: 240,
                            render: this.isEdit && ((h, { row, column }) => {
                                return (
                                    <el-input
                                        value={row[column.prop]}
                                        onInput={res => { row[column.prop] = res }}
                                        placeholder={column.label}
                                        size='mini'
                                        type='text'
                                    />
                                )
                            })
                        },
                        {
                            type: this.isEdit ? null : 'money',
                            prop: 'totalCost',
                            label: '维修费用（元）',
                            width: 140,
                            render: this.isEdit && ((h, { row, column }) => {
                                return (
                                    <el-input-number
                                        value={row[column.prop]}
                                        onInput={res => { row[column.prop] = res }}
                                        placeholder='维修费用'
                                        min={0}
                                        size='mini'
                                        controls-position='right'
                                        style='width:100%;'
                                    />
                                )
                            })
                        },
                        {
                            type: this.isEdit ? null : 'dict',
                            dictType: 'isReplaceSim',
                            prop: 'isReplaceCard',
                            label: '是否有换卡',
                            width: 90,
                            render: this.isEdit && ((h, { row, column }) => {
                                return (
                                    <el-checkbox
                                        value={row[column.prop]}
                                        true-label={1}
                                        false-label={0}
                                        onInput={res => {
                                            row[column.prop] = res
                                            row.replaceCardId = ''
                                            row.replaceCardNumber = ''
                                        }}
                                    >
                                    {['否', '是'][row[column.prop]]}
                                    </el-checkbox>
                                )
                            })
                        },
                        {
                            prop: 'replaceCardNumber',
                            label: '更换SIM卡',
                            width: 200,
                            render: this.isEdit && ((h, { row, column }) => {
                                if (row.isReplaceCard === 1) {
                                    return (
                                        <pick-input
                                            value={row[column.prop]}
                                            clearable
                                            placeholder='选择更换的SIM卡'
                                            readonly
                                            onPick={() => {
                                                this.handleReplaceSim(row)
                                            }}
                                            onClear={() => {
                                                row.replaceCardId = ''
                                                row.replaceCardNumber = ''
                                            }}
                                        >
                                            <span slot='icon'>选</span>
                                        </pick-input>
                                    )
                                }
                            }),
                            isClick: !this.isEdit,
                            dialogType: 'deviceSim',
                            idKey: 'replaceCardId'
                        }
                    ],
                    options: {
                        rules: {
                            imei: { required: true, message: '请补填第${index}台设备的imei信息', trigger: 'change' },
                            factoryFeedback: { required: true, message: '厂家诊断结果不能为空', trigger: 'change' },
                            factoryHandlingWay: { required: true, message: '厂家处理方式不能为空', trigger: 'change' },
                            totalCost: { required: true, message: '维修费用不能为空', trigger: 'change' },
                            replaceCardNumber: {
                                required: true,
                                message: '请选择需要更换的SIM卡',
                                trigger: 'change',
                                premise: [
                                    { prop: 'isReplaceCard', includes: [1] }
                                ]
                            }
                        },
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: '100%',
                        showAsterisk: this.isEdit
                    }
                },
                searchParam: {},
                importAction: '',
                selectDialog: {
                    visible: false
                },
                deviceDialog: {
                    visible: false
                },
                activeRowData: null
            }
        },
        computed: {
        },
        watch: {
            formData: {
                immediate: true,
                handler(data) {
                    if (data) {
                        var deviceList = (data.updateDevices || []).map(item => {
                            item._canEditProps = ['deviceId'].filter(v => isEmpty(item[v]))
                            return item
                        })
                        if (this.isEdit) {
                            deviceList.forEach(item => {
                                if (item.imeiUnidentified === 0 && isEmpty(item.deviceId)) {
                                    item.tempImei = item.imei
                                    item.imei = ''
                                }
                                item.totalCost = item.totalCost || 0
                                item.isReplaceCard = item.isReplaceCard || 0
                            })
                        }
                        this.deviceList = deviceList
                        this.importAction = `express/import/${data.guidId}`
                        this.filterData()
                    }
                }
            }
        },
        mounted() {
        },
        methods: {
            // 筛选数据
            filterData() {
                var { pageSize, pageIndex } = this.publicParam
                var list = filterList(this.deviceList, this.searchParam, [
                    { name: 'imei', type: 'string' }
                ])
                this.tableData.total = list.length
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
            },
            // 筛选列表
            handleFilter() {
                if (this.searchParam.pageIndex !== 1) {
                    this.searchParam.pageIndex = 1
                } else {
                    this.filterData()
                }
            },
            // 点击导出按钮时触发
            handleExport() {
                var data = { ...this.searchParam }
                data.guidId = this.formData.guidId
                data.pageSize = this.tableData.total
                sendRevisedApi.fedbackExport(data)
            },
            // 点击选择补选设备按钮时触发
            handleFillUpDevice(data) {
                this.deviceDialog = {
                    type: 0,
                    value: {
                        guidId: data.deviceId,
                        imei: data.imei
                    },
                    title: '选择补填设备',
                    params: {
                        unitStatus: 1,
                        sectionId: data.sectionId,
                        productCode: data.productCode,
                        productType: '288F8C2D-9CEB-46FC-87C9-DC4C16108162', // 人员智能设备
                        productCategory: 'B16C3151-11D2-4364-8F45-63EFFFFCF424', // 智能设备
                        lockedProps: ['sectionId', 'unitStatus', 'productCode', 'productType']
                    },
                    visible: true,
                    excludes: this.deviceList.map(v => v.deviceId).filter(v => v && v !== data.deviceId)
                }
                this.activeRowData = data
            },
            // 点击选择更换SIM卡按钮时触发
            handleReplaceSim(data) {
                var selectDialog = {
                    code: 1,
                    type: 'sim',
                    value: {
                        guidId: data.replaceCardId,
                        sim: data.replaceCardNumber
                    },
                    title: '选择更换的SIM',
                    visible: true,
                    excludes: this.deviceList.map(v => v.replaceCardId).filter(v => v && v !== data.replaceCardId)
                }
                this.selectDialog = selectDialog
                this.activeRowData = data
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
                data.filter(item => item.code === 0).map(item => item.data).forEach(item => {
                    var device = this.deviceList.find(v => v.imei === item.imei)
                    if (device) {
                        Object.keys(device).forEach(key => {
                            if (key in item) {
                                device[key] = item[key]
                            }
                        })
                    }
                })
            },
            // 下载模板
            handleDownloadTemplate() {
                sendRevisedApi.downloadTemplate({
                    guidId: this.formData.guidId
                })
            },
            // 选择设备后触发
            handleSelectDialogChange([data]) {
                this.activeRowData.replaceCardId = data.guidId
                this.activeRowData.replaceCardNumber = data.sim
            },
            // 选择补填设备后触发
            handleDeviceDialogChange([data]) {
                this.activeRowData.imei = data.imei
                this.activeRowData.deviceId = data.guidId
            }
        }
    }
</script>

<style lang='scss' scoped>
.link-text {
    margin-right: 15px;
}
</style>
