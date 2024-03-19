<!--
* @description 故障单处理表格
* @author yc
!-->
<template>
    <layout-filter
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        @search="handleFilter"
    >
        <template v-if="isEdit" slot="button">
            <el-button
                v-waves
                size="mini"
                class="filter-button"
                type="warning"
                icon="el-icon-download"
                @click="handleExport"
            >导出</el-button>
            <el-button
                :loading="loading"
                size="mini"
                class="filter-button"
                type="primary"
                icon="el-icon-setting"
                @click="handleQuickReplace"
            >一键替换</el-button>
            <ImportButton
                :loading="loading"
                :upload-data="uploadData"
                :download-method="handleDownloadMethod"
                action="fault/devices/import/"
                class="filter-button"
                template-name="导入模板.xlsx"
                @success="handleImportSuccess"
            />
            <slot name="button"/>
        </template>
        <template slot="filter">
            <el-input
                v-model="searchParam.replaceUnitImei"
                size="mini"
                placeholder="替换设备IMEI"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <el-input
                v-model="searchParam.imei"
                size="mini"
                placeholder="报修设备IMEI"
                clearable
                class="filter-item"
                @change="handleFilter"
            />
            <template v-if="isWorkbench">
                <el-select
                    v-model="searchParam.projectName"
                    placeholder="项目名称"
                    filterable
                    clearable
                    size="mini"
                    class="filter-item"
                    @change="handleFilter"
                >
                    <el-option
                        v-for="option in projectOptions"
                        :key="option"
                        :value="option"
                        :label="option"
                    />
                </el-select>
                <el-select
                    v-model="searchParam.sectionName"
                    placeholder="标段名称"
                    filterable
                    clearable
                    size="mini"
                    class="filter-item"
                    @change="handleFilter"
                >
                    <el-option
                        v-for="option in sectionOptions"
                        :key="option"
                        :value="option"
                        :label="option"
                    />
                </el-select>
                <el-select
                    v-model="searchParam.customerName"
                    placeholder="企业名称"
                    filterable
                    clearable
                    size="mini"
                    class="filter-item"
                    @change="handleFilter"
                >
                    <el-option
                        v-for="option in customerOptions"
                        :key="option"
                        :value="option"
                        :label="option"
                    />
                </el-select>
            </template>
        </template>
        <template slot="table">
            <TableComponent
                ref="TableComponent"
                v-bind="tableData"
                :selected-list="selectList"
                :page-index.sync="searchParam.pageIndex"
                :page-size.sync="searchParam.pageSize"
                @handleSelectionChange="handleSelectionChange"
            />
        </template>
        <div>
            <!-- 信息窗口 -->
            <MessageDialog
                v-bind="messageDialog"
                :visible.sync="messageDialog.visible"
                @confirm="messageDialog.visible = false"
            />
            <!-- 选中补填设备 -->
            <DeviceDialog
                v-if="deviceDialog.visible"
                v-bind="deviceDialog"
                :visible.sync="deviceDialog.visible"
                @change="handleSelectDialogChange"
            />
            <!-- 选择替换设备 -->
            <ReplaceDeviceDialog
                v-if="replaceDeviceDialog.visible"
                v-bind="replaceDeviceDialog"
                :visible.sync="replaceDeviceDialog.visible"
                @change="handleReplaceDeviceChange"
            />
        </div>
    </layout-filter>
</template>

<script>
    // API
    import troubleTicketApi from '@/api/operationsManagement/troubleTicket'
    // 方法
    import { isEmpty, filterList, exportTabel } from '@/utils'
    // 组件
    import DeviceDialog from './DeviceDialog'
    import ReplaceDeviceDialog from '../ReplaceDeviceDialog'

    export default {
        name: 'ReplaceTable',
        components: {
            DeviceDialog,
            ReplaceDeviceDialog
        },
        props: {
            isEdit: { type: Boolean, default: false },
            dataId: null,
            dataList: Array,
            isWorkbench: { type: Boolean, default: false }
        },
        data() {
            this.defaultParam = {
                pageSize: 20,
                pageIndex: 1
            }
            return {
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
                            disabled: true,
                            render: this.isEdit &&
                                ((h, { row }) => {
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
                            isCopy: ({ row }) => row.deviceId && !row._canEditProps.includes('deviceId'),
                            isClick: ({ row }) => row.deviceId,
                            isRender: ({ row }) => row.imeiUnidentified === 0 && row._canEditProps.includes('deviceId'),
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
                            prop: 'projectName',
                            label: '所属项目',
                            minWidth: 200,
                            idKey: 'projectId',
                            isClick: true,
                            dialogType: 'project',
                            visible: this.isWorkbench
                        },
                        {
                            prop: 'sectionName',
                            label: '标段',
                            minWidth: 200,
                            idKey: 'sectionId',
                            isClick: true,
                            dialogType: 'sections',
                            visible: this.isWorkbench
                        },
                        {
                            prop: 'customerName',
                            label: '企业',
                            minWidth: 200,
                            visible: this.isWorkbench
                        },
                        {
                            type: 'date',
                            prop: 'arrivalDate',
                            label: '收到日期',
                            width: 160
                        },
                        {
                            prop: 'enterpriseFeedback',
                            label: '企业反馈异常',
                            width: 220
                        },
                        {
                            type: 'date',
                            prop: 'lastRepairTime',
                            label: '上次寄修时间',
                            width: 120
                        },
                        {
                            prop: 'replaceUnitImei',
                            label: '替换设备',
                            width: 210,
                            render: this.isEdit &&
                                ((h, { row, column }) => {
                                    return (
                                        <pick-input
                                            value={row[column.prop]}
                                            clearable
                                            placeholder='选择替换设备'
                                            onPick={() => {
                                                row._isInput = false
                                                this.handlePickDevice(row)
                                            }}
                                            onBlur={() => {
                                                this.validateReplaceImei(row)
                                            }}
                                            onClear={() => {
                                                row.isImeiFill = 0
                                                row[column.prop] = ''
                                                this.validateReplaceImei(row)
                                            }}
                                            onInput={res => {
                                                row._isInput = true
                                                row.isImeiFill = 1
                                                row[column.prop] = res
                                                row._isDirty = true
                                            }}
                                        >
                                            <span slot='icon'>选</span>
                                        </pick-input>
                                    )
                                }),
                            isCopy: ({ row }) => row.replaceDeviceId && !row._canEditProps.includes('replaceDeviceId'),
                            isClick: ({ row }) => row.replaceDeviceId,
                            isRender: ({ row }) => row._canEditProps.includes('replaceDeviceId'),
                            dialogType: 'device',
                            idKey: 'replaceDeviceId'
                        },
                        {
                            type: 'dict',
                            dictType: 'troubleReplaceType',
                            prop: 'replaceType',
                            label: '替换类型',
                            width: 90
                        },
                        {
                            type: 'date',
                            prop: 'replaceTime',
                            label: '替换时间',
                            width: 140
                        },
                        {
                            prop: 'errorCode',
                            label: '故障代码',
                            width: 140,
                            render: this.isEdit &&
                                ((h, { row, column }) => {
                                    return (
                                        <fault-msg-select
                                            type='0'
                                            clearable
                                            value={row[column.prop]}
                                            onInput={value => {
                                                row[column.prop] = value
                                                row._isDirty = true
                                            }}
                                            onChange={data => {
                                                row.clientFeedback = data ? data.name : ''
                                            }}
                                        />
                                    )
                                }),
                            isRender: ({ row }) => row._canEditProps.includes('clientFeedback')
                        },
                        {
                            prop: 'clientFeedback',
                            label: '客服诊断结果',
                            width: 200
                        },
                        {
                            type: 'dict',
                            dictType: 'troubleBillsHandlingWay',
                            prop: 'handlingWay',
                            label: '处理方式',
                            width: 120,
                            render: this.isEdit &&
                                ((h, { row, column }) => {
                                    let exclude = []
                                    if (row.replaceType === 3) {
                                        exclude = [1, 2, 3, 4, 6]
                                    } else if (!row.deviceId || isEmpty(row.replaceDeviceId)) {
                                        exclude = [1, 2, 3, 4, 5, 6]
                                    } else {
                                        exclude = [4, 5]
                                    }
                                    return (
                                        <dict-select
                                            type='troubleBillsHandlingWay'
                                            value={row[column.prop]}
                                            exclude={exclude}
                                            clearable
                                            placeholder={column.label}
                                            onChange={res => {
                                                row[column.prop] = res
                                                row._isDirty = true
                                            }}
                                        />
                                    )
                                }),
                            isRender: ({ row }) => row._canEditProps.includes('handlingWay')
                        },
                        {
                            type: 'date',
                            prop: 'completeTime',
                            label: '处理结果提交时间',
                            width: 150,
                            format: 'YYYY-MM-DD HH:mm:ss'
                        }
                    ],
                    options: {
                        rules: {
                            errorCode: {
                                validator: (rule, value, callback) => {
                                    if (value === void 0) {
                                        callback(new Error('请选择故障代码'))
                                    }
                                    callback()
                                },
                                trigger: 'change'
                            },
                            handlingWay: {
                                validator: (rule, value, callback) => {
                                    if (value === void 0) {
                                        callback(new Error('请选择处理方式'))
                                    }
                                    callback()
                                },
                                trigger: 'change'
                            }
                        },
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: '100%',
                        mutiSelect: this.isWorkbench,
                        mutiSelectedKey: 'guidId'
                    }
                },
                uploadData: {},
                selectList: [],
                filterList: [],
                searchParam: {
                    ...this.defaultParam
                },
                validateing: false,
                deviceDialog: {
                    visible: false
                },
                messageDialog: {
                    visible: false,
                    content: ''
                },
                activeRowData: null,
                projectOptions: [],
                sectionOptions: [],
                customerOptions: [],
                replaceDeviceDialog: {
                    visible: false
                }
            }
        },
        computed: {
            loading() {
                return this.tableData.options.loading
            },
            isCanSubmit() {
                return !this.loading && !this.validateing
            }
        },
        watch: {
            dataId: {
                immediate: true,
                handler(value) {
                    this.uploadData = {
                        guidId: value || ''
                    }
                }
            },
            dataList(list) {
                if (this.isWorkbench) {
                    let projectOptions = []
                    let sectionOptions = []
                    let customerOptions = []
                    list.forEach(item => {
                        if (!isEmpty(item.projectName) && projectOptions.findIndex(v => v === item.projectName) === -1) {
                            projectOptions.push(item.projectName)
                        }
                        if (!isEmpty(item.sectionName) && sectionOptions.findIndex(v => v === item.sectionName) === -1) {
                            sectionOptions.push(item.sectionName)
                        }
                        if (!isEmpty(item.customerName) && customerOptions.findIndex(v => v === item.customerName) === -1) {
                            customerOptions.push(item.customerName)
                        }
                    })
                    this.projectOptions = projectOptions
                    this.sectionOptions = sectionOptions
                    this.customerOptions = customerOptions
                }
                this.selectList = []
                this.handleFilter()
            },
            'searchParam.pageSize'() {
                this.filterData()
            },
            'searchParam.pageIndex'() {
                this.filterData()
            }
        },
        mounted() {
            this.$emit('ready')
        },
        methods: {
            // 验证表单
            validate() {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        // 找出验证不通过的列表
                        let dirtys = this.dataList.filter(item => {
                            let pass = true
                            if (!isEmpty(item.errorCode) && isEmpty(item.handlingWay)) {
                                pass = false
                                item.handlingWay = void 0
                            } else if (!isEmpty(item.handlingWay) && isEmpty(item.errorCode)) {
                                pass = false
                                item.errorCode = void 0
                            }
                            return !pass
                        })
                        if (dirtys.length) {
                            // 计算出第一个验证不通过的数据的所在页码
                            let pageIndex = Math.max(Math.ceil(this.dataList.findIndex(v => v === dirtys[0]) / this.searchParam.pageSize), 1)
                            this.searchParam = {
                                ...this.defaultParam,
                                pageIndex
                            }
                            this.filterData()
                            this.$nextTick(() => {
                                this.$refs.TableComponent.validateRows(dirtys)
                            })
                            reject()
                        } else {
                            let list = this.getFormData()
                            if (list.length) {
                                resolve(list)
                            } else {
                                this.$message.warning('您未更改过任何数据！')
                                reject()
                            }
                        }
                    }, 50)
                })
            },
            // 是否是原设备
            isOriginalDevice(data, imei) {
                return [0, 1].includes(data.handlingWay) && data.deviceId && data.imei === imei
            },
            // 筛选数据
            filterData() {
                let { pageSize, pageIndex } = this.searchParam
                let list = filterList(this.dataList, this.searchParam, [
                    { name: 'imei', type: 'string' },
                    { name: 'projectName', type: 'string' },
                    { name: 'sectionName', type: 'string' },
                    { name: 'customerName', type: 'string' },
                    { name: 'replaceUnitImei', type: 'string' }
                ])
                this.filterList = list
                this.tableData.total = list.length
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
            },
            // 获取提交数据
            getFormData() {
                if (this.isWorkbench) {
                    return this.dataList.filter(v => v._isDirty)
                }
                return this.dataList
            },
            // 验证替换设备IMEI
            async validateReplaceImei(row) {
                if (row._isInput) {
                    var replaceUnitImei = row.replaceUnitImei
                    if (replaceUnitImei) {
                        var errorMsg = ''
                        this.tableData.list.forEach(item => {
                            if (row !== item) {
                                if (item.imei === replaceUnitImei) {
                                    errorMsg = `该IMEI【<span class="high">${replaceUnitImei}</span>】已在故障设备列表中！`
                                } else if (item.replaceUnitImei === replaceUnitImei) {
                                    errorMsg = `该IMEI【<span class="high">${replaceUnitImei}</span>】已被故障设备【<span class="high">${item.imei}</span>】设置为替换设备！`
                                }
                            }
                        })
                        if (errorMsg) {
                            this.messageDialog = {
                                visible: true,
                                content: errorMsg
                            }
                            row.replaceType = ''
                            row.replaceUnitImei = ''
                            row.replaceDeviceId = ''
                            row.replaceProductId = ''
                        } else {
                            if (this.isOriginalDevice(row, replaceUnitImei)) {
                                // 如果imei相同，替换类型为原设备寄回
                                row.replaceType = 3
                                row.replaceDeviceId = row.deviceId
                                row.replaceProductId = row.productId
                            } else {
                                this.validateing = true
                                try {
                                    var { data } = await troubleTicketApi.validImei({
                                        imei: replaceUnitImei,
                                        projectId: row.projectId
                                    })
                                    if (data.code > 0) {
                                        this.messageDialog = {
                                            visible: true,
                                            content: data.errorMsg
                                        }
                                        row.replaceType = ''
                                        row.replaceUnitImei = ''
                                        row.replaceDeviceId = ''
                                        row.replaceProductId = ''
                                        this.validateing = false
                                    } else {
                                        let { imei, deviceId, productId, isNewDevice } = data.data
                                        if (this.isOriginalDevice(row, imei)) {
                                            // 如果imei相同，替换类型为原设备寄回
                                            row.replaceType = 3
                                        } else {
                                            row.replaceType = isNewDevice || 0
                                        }
                                        row.replaceUnitImei = imei
                                        row.replaceDeviceId = deviceId
                                        row.replaceProductId = productId
                                        this.validateing = true
                                    }
                                } catch (e) {
                                    console.log(e)
                                }
                            }
                        }
                    } else {
                        row.replaceType = ''
                        row.replaceUnitImei = ''
                        row.replaceDeviceId = ''
                        row.replaceProductId = ''
                    }
                }
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
                exportTabel({
                    name: '故障设备处理工作台',
                    columns: this.tableData.columns,
                    dataList: this.filterList
                })
            },
            // 选中表格行时触发
            handleSelectionChange(val) {
                this.selectList = val
            },
            // 点击选择补选设备按钮时触发
            handleFillUpDevice(data) {
                let { imei, deviceId, sectionId } = data
                this.deviceDialog = {
                    value: {
                        imei,
                        guidId: data.deviceId
                    },
                    title: '选择补填设备',
                    params: {
                        sectionId,
                        productCode: data.productCode,
                        unitStatus: 1,
                        productType: '288F8C2D-9CEB-46FC-87C9-DC4C16108162', // 人员智能设备
                        productCategory: 'B16C3151-11D2-4364-8F45-63EFFFFCF424', // 智能设备
                        lockedProps: ['unitStatus', 'sectionId', 'productCode', 'productType'],
                        selectDeviceIds: this.dataList.map(v => v.deviceId).filter(v => v && v !== deviceId)
                    },
                    visible: true
                }
                this.activeRowData = data
            },
            // 点击选择替换设备按钮时触发
            handlePickDevice(data) {
                let { replaceType, replaceDeviceId, replaceUnitImei, replaceProductId } = data
                this.activeRowData = data
                this.replaceDeviceDialog = {
                    type: replaceType,
                    value: {
                        imei: replaceUnitImei,
                        guidId: replaceDeviceId,
                        productId: replaceProductId
                    },
                    visible: true,
                    excludes: this.tableData.list.map(v => v.replaceDeviceId).filter(v => v && v !== data.replaceDeviceId),
                    rowData: data,
                    params: {
                        isFaultOriginDevice: 1
                    }
                }
            },
            // 点击一键替换按钮时触发
            handleQuickReplace() {
                // 只替换可以替换的行
                let list = (this.isWorkbench ? this.selectList : this.dataList).filter(item => item._canEditProps.includes('replaceDeviceId'))
                if (list.length) {
                    this.tableData.options.loading = true
                    // 筛选出不同项目的设备
                    var project = []
                    list.forEach(item => {
                        var index = project.findIndex(v => v.id === item.projectId)
                        if (index === -1) {
                            project.push({
                                id: item.projectId,
                                list: [item]
                            })
                        } else {
                            project[index].list.push(item)
                        }
                    })
                    Promise.all(project.map((item) => {
                        return troubleTicketApi.getReplaceDevice({
                            pageSize: item.list.length,
                            pageIndex: 1,
                            standbyProjectId: item.id,
                            warehousesId: '9f1d6d84-98da-4bc3-bc7c-ec299ef2b4d5',
                            typeId: this.getWarehousesSpaceType(0, '备用'),
                            productType: '288F8C2D-9CEB-46FC-87C9-DC4C16108162',
                            productCategory: 'B16C3151-11D2-4364-8F45-63EFFFFCF424'
                        })
                    })).then(list => {
                        var count = 0
                        project.forEach((item, index) => {
                            var dataList = list[index].data.records
                            item.list.forEach((item, idx) => {
                                var device = dataList[idx]
                                if (device) {
                                    if (this.isOriginalDevice(item.imei, device.imei)) {
                                        // 如果imei相同，替换类型为原设备寄回
                                        item.replaceType = 3
                                    } else {
                                        item.replaceType = device.isNewDevice || 0
                                    }
                                    item.replaceUnitImei = device.imei
                                    item.replaceDeviceId = device.guidId
                                    item.replaceProductId = device.productId
                                    item._isDirty = true
                                } else {
                                    item.replaceType = ''
                                    item.replaceUnitImei = ''
                                    item.replaceDeviceId = ''
                                    item.replaceProductId = ''
                                }
                            })
                            count += dataList.length
                        })
                        this.$message.success(`一键替换完成，本次共替换了${count}台设备！`)
                    }).finally(() => {
                        this.tableData.options.loading = false
                    })
                } else {
                    this.$message.warning(this.isWorkbench ? '请至少选中一项！' : '没有可替换的设备！')
                }
            },
            // 选择补填设备后触发
            handleSelectDialogChange([data]) {
                let row = this.activeRowData
                row.isImeiFill = 1
                row.imei = data.imei
                row.deviceId = data.guidId
                row._isDirty = true
            },
            // 选择替换设备后触发
            handleReplaceDeviceChange({ type, data }) {
                let row = this.activeRowData
                row.replaceType = type
                row.replaceUnitImei = data.imei
                row.replaceDeviceId = data.guidId
                row.replaceProductId = data.productId
                row._isDirty = true
            },
            // 下载模板
            handleDownloadMethod() {
                troubleTicketApi.workbenchTemplate({
                    ...this.searchParam,
                    status: 1,
                    guidId: this.dataId || ''
                })
            },
            // 导入成功时触发
            handleImportSuccess(data) {
                let failure = data.reduce((a, b) => {
                    if (b.code > 0) {
                        return a + 1
                    }
                    let same = this.dataList.find(v => {
                        return b.data.replaceDeviceId && v.replaceDeviceId === b.data.replaceDeviceId && v.imei !== b.data.imei
                    })
                    if (same) {
                        b.code = 1
                        b.errorMsg = `${b.data.replaceUnitImei} 已被 IMEI: ${same.imei} 设为替换设备`
                        return a + 1
                    }
                    same = this.dataList.find(v => {
                        return b.data.replaceDeviceId && v.deviceId === b.data.replaceDeviceId && v.imei !== b.data.imei
                    })
                    if (same) {
                        b.code = 1
                        b.errorMsg = `${b.data.replaceUnitImei} 已被 IMEI: ${same.imei} 设为补填设备`
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
                data.filter(v => v.code === 0).map(v => v.data).forEach(item => {
                    let data = this.dataList.find(v => v.guidId === item.guidId)
                    if (data) {
                        if (isEmpty(data.replaceDeviceId)) {
                            if (item.replaceDeviceId) {
                                data.replaceType = item.replaceType
                                data.replaceDeviceId = item.replaceDeviceId
                                data.replaceUnitImei = item.replaceUnitImei
                                data.replaceProductId = item.replaceProductId
                                data._isDirty = true
                            }
                        }
                        if (isEmpty(data.handlingWay)) {
                            data.handlingWay = item.handlingWay
                            data._isDirty = true
                        }
                        if (isEmpty(data.errorCode)) {
                            data.errorCode = item.errorCode
                            data.clientFeedback = item.clientFeedback
                            data._isDirty = true
                        }
                    }
                })
                this.handleFilter()
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
