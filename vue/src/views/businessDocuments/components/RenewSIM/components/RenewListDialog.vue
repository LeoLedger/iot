<!--
* @description SIM卡续费清单
* @author 望浩然
!-->
<template>
    <div>
        <el-dialog
            v-if="visible"
            :visible="visible"
            :close-on-click-modal="false"
            title="SIM卡续费清单"
            width="900px"
            append-to-body
            @close="$emit('update:visible', false)"
        >
            <layout-filter
                :table-columns.sync="tableData.columns"
                :filter-model.sync="searchParam"
                @search="handleFilter"
            >
                <template v-if="showAction" slot="button">
                    <el-button
                        v-waves
                        size="mini"
                        class="filter-button"
                        type="success"
                        @click="handlePutIn"
                    >调入</el-button>
                    <el-button
                        v-waves
                        size="mini"
                        class="filter-button"
                        type="warning"
                        @click="handlePutOff"
                    >调出</el-button>
                    <ImportButton
                        :before-upload="handleBeforeUpload"
                        :download-method="handleDownloadTemplate"
                        :upload-data="uploadData"
                        type="primary"
                        action="approval-sim-renew/device/import"
                        title="导入SIM设备"
                        template-name="SIM设备导入模板.xlsx"
                        @success="handleImportSuccess"
                    />
                    <!--                    <el-button-->
                    <!--                        v-waves-->
                    <!--                        size="mini"-->
                    <!--                        class="filter-button"-->
                    <!--                        type="primary"-->
                    <!--                        @click="handleDownloadTemplate"-->
                    <!--                    >下载模板</el-button>-->
                </template>
                <template slot="filter">
                    <el-input
                        v-model="searchParam.sim"
                        size="mini"
                        placeholder="SIM卡号"
                        clearable
                        class="filter-item"
                        @change="handleFilter"
                    />
                    <WarehouseCascader
                        :form-data="searchParam"
                        type="B16C3151-11D2-4364-8F45-63EFFFFCF424"
                        stock-key="deviceWarehousesId"
                        place-key="deviceWarehousesSpaceId"
                        placeholder="所在仓库"
                        clearable
                        @change="handleFilter"
                    />
                </template>
                <template slot="table">
                    <TableComponent
                        ref="TableComponent"
                        v-bind="tableData"
                        :list="tableData.list"
                        :selected-list="selectList"
                        :page-index.sync="searchParam.pageIndex"
                        :page-size.sync="searchParam.pageSize"
                        @handleSelectionChange="handleSelectionChange"
                    />
                </template>
            </layout-filter>
            <span slot="footer">
                <el-button :loading="loading" size="mini" @click="handleClose">关 闭</el-button>
                <el-button
                    v-prereclick
                    v-if="!isApproval && showAction"
                    :loading="loading"
                    type="primary"
                    size="mini"
                    @click="handleSubmit">保 存</el-button>
            </span>
        </el-dialog>
        <SelectDeviceDialog
            v-if="selectDeviceDialog.visible"
            :extend-params="selectDeviceDialog.extendParams"
            :select-list="dataList"
            :visible.sync="selectDeviceDialog.visible"
            @confirm="handleSelectChange"
        />
    </div>
</template>

<script>
    // 方法
    import enums from '@/utils/enum'
    // API
    import renewSimApi from '@/api/businessDocuments/renewSIM'
    // 组件
    import ImportButton from '@/components/customizeFormItem/ImportButton'
    import SelectDeviceDialog from './SelectSimDialog'
    import sendRevisedApi from '@/api/operationsManagement/sendRevised'

    export default {
        components: {
            ImportButton,
            SelectDeviceDialog
        },
        props: {
            isApproval: { type: Boolean, default: false },
            processIndex: { type: Number, default: 0 },
            visible: { type: Boolean, default: false },
            rowData: { type: Object },
            isCreate: { type: Boolean, default: false },
            extendParams: { type: Object },
            basicData: { type: Object },
            showAction: { type: Boolean, default: false } // 是否显示操作按钮
        },
        data() {
            return {
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [],
                    options: {
                        rules: {},
                        height: '60vh',
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        curRowKey: 'imei',
                        mutiSelect: !this.isApproval && this.showAction,
                        mutiSelectedKey: 'imei'
                    }
                },
                searchParam: {
                    sim: '',
                    deviceWarehousesSpaceName: '',
                    deviceWarehousesSpaceId: '',
                    pageSize: 15,
                    pageIndex: 1
                },
                uploadData: {},
                selectList: [],
                dataList: [],
                isImportHandle: false,
                selectDeviceDialog: {
                    visible: false,
                    extendParams: {}
                }
            }
        },
        computed: {
            title() {
                return this.isApproval ? '审批退库清单' : '查看退库清单'
            },
            loading() {
                return this.tableData.options.loading
            },
            // 是否需要手动分页
            isPaging() {
                return this.isCreate || this.isImportHandle
            }
        },
        watch: {
            'searchParam.pageSize'() {
                this.filterData()
            },
            'searchParam.pageIndex'() {
                this.filterData()
            },
            rowData: {
                deep: true,
                immediate: true,
                handler(data) {
                    if (data) {
                        this.dataList = data.devices || []
                        this.handleFilter()
                    } else {
                        this.dataList = []
                    }
                }
            }
        },
        mounted() {
            var cellRender = (h, { row, column }) => {
                let content = ''
                if (column.prop === 'sim' && row.noExists === true) {
                    content = 'SIM号不存在'
                }
                if (content) {
                    row._error = true
                    return (
                    <el-tooltip effect='dark' placement='top'>
                      <div class='warning'>
                        <span>{row[column.prop]}</span>
                        <i class='el-icon-warning'></i>
                      </div>
                      <span style='white-space:pre;line-height:1.4em' slot='content'>{content}</span>
                    </el-tooltip>
                  )
                }
                return (
                    <span>{row[column.prop]}</span>
                )
            }
            // 表格配置
            this.TabelConfig = {
                common: [
                    {
                        prop: 'productCode',
                        label: '产品编号',
                        minWidth: 155
                    },
                    {
                        prop: 'sim',
                        label: 'SIM卡号',
                        minWidth: 155,
                        render: cellRender
                    },
                    {
                        prop: 'dueDate',
                        label: '到期时间',
                        minWidth: 155,
                        type: 'date'
                    },
                    {
                        prop: 'imei',
                        label: '关联设备IMEI',
                        minWidth: 155,
                        dialogType: 'device',
                        idKey: 'imei',
                        isClick: true
                    },
                    {
                        prop: 'deviceWarehousesSpaceName',
                        label: '所在仓库',
                        minWidth: 100,
                        formatter: (row, column) => {
                            return `${row.deviceWarehousesName || '- -'} | ${row.deviceWarehousesSpaceName || '- -'}`
                        }
                    }
                ]
            }
            this.searchParam = {
                ...this.searchParam,
                ...this.extendParams
            }
            this.tableData.columns = this.TabelConfig.common
        },
        methods: {
            // 筛选数据
            filterData() {
                var pageSize = this.searchParam.pageSize
                var pageIndex = this.searchParam.pageIndex
                var list = this.dataList.filter(item => {
                    return (
                        (!this.searchParam.deviceWarehousesSpaceId || (item.deviceWarehousesSpaceId && item.deviceWarehousesSpaceId.indexOf(this.searchParam.deviceWarehousesSpaceId) > -1)) &&
                        (!this.searchParam.sim || item.sim.indexOf(this.searchParam.sim) > -1)
                    )
                })
                this.tableData.total = list.length
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
            },
            // 筛选列表
            handleFilter() {
                this.selectList = []
                if (this.searchParam.pageIndex !== 1) {
                    this.searchParam.pageIndex = 1
                } else {
                    this.filterData()
                }
            },
            // 点击提交按钮时触发
            handleSubmit() {
                if (this.dataList.find(item => item._error)) {
                    this.$message.warning('请先处理标红的设备后再试！')
                } else {
                    this.$refs.TableComponent.validate().then(() => {
                        this.$emit('update:visible', false)
                        this.$emit('change', this.dataList)
                    }).catch()
                }
            },
            handleClose() {
                this.$emit('update:visible', false)
            },
            // 保存时校验
            handleValidate() {
                return this.$refs.TableComponent.validate()
            },
            // 导入成功时触发
            handleImportSuccess({ data, batchId }) {
                let messageNode = (
                  <div class='el-message__content'>
                    <p style='margin-bottom: 4px;'>导入成功{data.length}条数据</p>
                    {
                      batchId ? <p
                        class='link-text'
                        style='margin-bottom: 4px;'
                        onClick={() => this.handleDownloadFailure(batchId)
                        }>导入失败清单.xlsx</p> : ''
                    }
                  </div>
                )
                this.$message({
                    type: 'success',
                    duration: batchId ? 0 : 5000,
                    showClose: true,
                    message: messageNode,
                    dangerouslyUseHTMLString: true
                })
                this.handleSelectChange(data, false)
            },
            // 点击下载模板按钮时触发
            handleDownloadTemplate() {
                renewSimApi.downloadTemplate({})
            },
            handleBeforeUpload() {
                this.uploadData = {
                    // 供应商
                    supplierId: this.basicData.purchaseSupplierId,
                    // 编号
                    productId: this.rowData.productId
                }
                return true
            },
            // 多选-选中表格行时触发
            handleSelectionChange(val) {
                this.selectList = val
            },
            // 调入
            handlePutIn() {
                this.selectDeviceDialog.visible = true
                // 查询非报废仓位的SIM卡设备
                this.selectDeviceDialog.extendParams = {
                    // 供应商
                    supplierId: this.basicData.purchaseSupplierId,
                    // 编号
                    productId: this.rowData.productId
                }
            },
            // 调入 - 确认选择退库设备
            handleSelectChange(list, showTip = true) {
                const defaultList = JSON.parse(JSON.stringify(this.dataList))
                const newList = []
                let num = 0
                let oldNum = 0
                if (list && list.length) {
                    list.map(item => {
                        const newItem = {
                            approvalSimRenewId: this.basicData.guidId || '',
                            deviceId: item.guidId || item.deviceId,
                            sim: item.sim,
                            imei: item.imei,
                            productId: this.rowData.guidId,
                            productCode: this.rowData.productCode,
                            productType: this.rowData.productType,
                            dueDate: item.dueDate,
                            deviceWarehousesName: item.deviceWarehousesName,
                            deviceWarehousesSpaceId: item.deviceWarehousesSpaceId,
                            deviceWarehousesSpaceName: item.deviceWarehousesSpaceName,
                            // 选中标识,用于列表识别是否该条数据之前已被选中过
                            _idKey: item.sim,
                            // 列表显示
                            noExists: item.noExists
                        }
                        // 判断旧列表中是否已经有这条,如果有则插入旧数据, 如果无则查询新数据
                        const oldItem = defaultList.find(_item => _item.sim === newItem.sim)
                        if (oldItem) {
                            oldNum++
                            newList.push(oldItem)
                        } else {
                            num++
                            newList.push(newItem)
                        }
                    })
                }
                // 合并旧列表和新选择的列表
                this.dataList = newList
                // 更新列表显示
                this.filterData()
                if (showTip) {
                    if (num) {
                        return this.$message({ type: 'success', message: '成功调入' + num + '台SIM卡设备!' })
                    } else {
                        const removeNum = defaultList.length - oldNum
                        if (removeNum) return this.$message({ type: 'success', message: '移除了' + removeNum + '台SIM卡设备!' })
                        else return this.$message({ type: 'warning', message: '没有新的SIM卡设备被调入' })
                    }
                }
            },
            // 调出
            handlePutOff() {
                if (this.selectList.length) {
                    this.selectList.forEach((item) => {
                        this.dataList.map((item_, index) => {
                            if (item_.sim === item.sim) {
                                this.dataList.splice(index, 1)
                            }
                        })
                    })
                    this.selectList = []
                    // 更新列表显示
                    this.filterData()
                } else {
                    this.$message.warning('请至少选择一项')
                }
            },
            // 下载导入失败的列表文件
            handleDownloadFailure(id) {
                renewSimApi.downloadFailureList(id, {})
            }
        }
    }
</script>

<style lang='scss' scoped>
/deep/ {
    .warning {
        color: #F56C6C;
        cursor: pointer;
        i {
            margin-left: 3px;
        }
    }
}
</style>
