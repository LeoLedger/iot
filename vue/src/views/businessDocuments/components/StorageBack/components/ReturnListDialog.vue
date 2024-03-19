<!--
* @description 配置退库设备
* @author yc
!-->
<template>
    <div>
        <el-dialog
            v-if="visible"
            :visible="visible"
            :close-on-click-modal="false"
            title="产品退库清单"
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
                        :action="importAction"
                        :upload-data="uploadData"
                        :download-method="handleDownloadTemplate"
                        class="filter-button"
                        title="导入产品退库清单"
                        template-name="产品退库清单导入模板.xlsx"
                        @success="handleImportSuccess"
                    />
                </template>
                <template slot="filter">
                    <el-input
                        v-if="productCategory === 0"
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
                        :list="tableData.list"
                        :selected-list="selectList"
                        :page-index.sync="searchParam.pageIndex"
                        :page-size.sync="searchParam.pageSize"
                        @handleSelectionChange="handleSelectionChange"
                    />
                </template>
            </layout-filter>
            <span slot="footer">
                <el-button :loading="loading" size="mini" @click="$emit('update:visible', false)">关 闭</el-button>
                <el-button
                    v-prereclick
                    v-if="(processIndex === 1 || processIndex === 2) && isApproval"
                    :loading="loading"
                    type="primary"
                    size="mini"
                    @click="handleSubmit">保 存</el-button>
            </span>
        </el-dialog>
        <SelectDeviceDialog
            v-if="selectDeviceDialog.visible"
            v-bind="deviceStockOut"
            :visible.sync="selectDeviceDialog.visible"
            title="选择退库设备"
            type="device"
            @change="handleSelectChange"
        />
        <PublicDetailDialog
            v-if="deviceDetailDialog.visible"
            :visible.sync="deviceDetailDialog.visible"
            :data-id="deviceDetailDialog.dataId"
            type="device"
        />
    </div>
</template>

<script>
    // 方法
    import enums from '@/utils/enum'
    // API
    import storageReturnApi from '@/api/businessDocuments/storageReturn'
    // 组件
    import ImportButton from '@/components/customizeFormItem/ImportButton'
    import SelectDeviceDialog from '@/components/SelectDialog/index'

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
                        rules: {
                            resultType: { required: true, message: '第${index}行的清点结果不得为空', trigger: 'change' },
                            handleType: { required: true, message: '第${index}行的处理方式不得为空', trigger: 'change' },
                            cashPledge: { required: true, message: '第${index}行的扣除押金不得为空', trigger: 'change' }
                        },
                        height: '60vh',
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        curRowKey: 'imei',
                        mutiSelect: this.processIndex === 1 && this.isApproval,
                        mutiSelectedKey: 'imei'
                    }
                },
                searchParam: {
                    sim: '',
                    imei: '',
                    pageSize: 15,
                    pageIndex: 1
                },
                importAction: '',
                uploadData: {},
                selectList: [],
                dataList: [],
                isImportHandle: false,
                productCategory: 0,
                selectDeviceDialog: {
                    visible: false
                },
                importData: {},
                deviceDetailDialog: {
                    visible: false,
                    dataId: null
                },
                deviceStockOut: {
                    value: '',
                    excludes: [],
                    maxCount: Infinity,
                    overageMessage: '已达最大退库数量',
                    multiple: true,
                    extendParams: {
                        imeiList: []
                    }
                }
            }
        },
        computed: {
            title() {
                return ((this.processIndex === 1 || this.processIndex === 2) && this.isApproval) ? '配置退库清单' : '查看退库清单'
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
                immediate: true,
                handler(data) {
                    if (data) {
                        this.dataList = (data.deviceList || []).map(v => v)
                        this.dataList.map(item => {
                            this.handleResultTypeChange(item.resultType, item, 'resultType', false)
                        })
                        this.handleFilter()
                        this.importAction = 'approvalDeviceReturn/import'
                        this.uploadData = {
                            productId: data.productId,
                            sectionId: data.sectionId
                        }
                        console.log('导入参数', this.uploadData)
                    } else {
                        this.dataList = []
                    }
                }
            }
        },
        mounted() {
            var cellRender = (h, { row, column }) => {
                if (this.processIndex === 1 && this.isApproval) {
                    var content = []
                    switch (column.prop) {
                    case 'imei':
                        if (row.hasImei === false) {
                            content.push('设备号不存在')
                        }
                        if (row.hasImeiRepeatExcel) {
                            content.push('导入文件中存在相同的imei号')
                        }
                        break
                    }
                    content = content.map((v, i) => `${i + 1}、${v}`).join('\n')
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
                }
                return (
                  <span class='link-text' onClick={() => this.showDeviceDetail(row)}>{row[column.prop]}</span>
                )
            }
            // 表格配置
            this.TabelConfig = {
                // 通用配置
                common: [
                    {
                        label: '清点结果',
                        prop: 'resultType',
                        width: 150,
                        render: (h, { row, column }) => {
                            return (
                              <dict-select
                                disabled={(this.processIndex !== 1 && this.processIndex !== 2) || !this.isApproval}
                                type='storageReturnResultType'
                                value={row[column.prop]}
                                placeholder={column.label}
                                onChange={res => { this.handleResultTypeChange(res, row, column.prop) }}
                              />
                            )
                        }
                    },
                    {
                        label: '处理方式',
                        prop: 'handleType',
                        width: 150,
                        render: (h, { row, column }) => {
                            return (
                              <dict-select
                                disabled={(this.processIndex !== 1 && this.processIndex !== 2) || !this.isApproval || row.lockedHandleType}
                                type='storageReturnHandleType'
                                value={row[column.prop]}
                                placeholder={column.label}
                                onInput={res => { this.handleTypeChange(res, row) }}
                              />
                            )
                        }
                    },
                    {
                        label: '设备合同押金(元)',
                        prop: 'deposit',
                        width: 120,
                        type: 'money'
                    },
                    {
                        label: '扣除押金(元)',
                        prop: 'cashPledge',
                        width: 100,
                        render: (h, { row, column }) => {
                            const form = {
                                max: row.deposit ? Number(row.deposit) : null,
                                min: 0,
                                prop: 'cashPledge',
                                moneyInWords: false,
                                label: '扣除押金'
                            }
                            return (
                              <money-input
                                params={row}
                                form={form}
                                disabled={(this.processIndex !== 1 && this.processIndex !== 2) || !this.isApproval}
                                placeholder={'请输入' + column.label}
                                onInput={(val) => { row[column.prop] = val }}
                              />
                            )
                        }
                    },
                    {
                        label: '备注',
                        prop: 'remark',
                        width: 150,
                        render: (h, { row, column }) => {
                            return (
                        <el-input
                          disabled={(this.processIndex !== 1 && this.processIndex !== 2) || !this.isApproval}
                          value={row[column.prop]}
                          onInput={(val) => { row[column.prop] = val }}
                        />
                      )
                        }
                    }
                ],
                // 智能设备
                intelligent: [
                    {
                        prop: 'productCode',
                        label: '产品编号',
                        minWidth: 155
                    },
                    {
                        prop: 'imei',
                        label: 'IMEI',
                        minWidth: 155,
                        render: cellRender
                    }
                ],
                // SIM卡
                sim: []
            }
            this.searchParam = {
                ...this.searchParam,
                ...this.extendParams
            }
            this.updateTabelConfig()
        },
        methods: {
            // 筛选数据
            filterData() {
                var pageSize = this.searchParam.pageSize
                var pageIndex = this.searchParam.pageIndex
                var list = this.dataList.filter(item => {
                    return (
                        (this.searchParam.sim === '' || item.sim.indexOf(this.searchParam.sim) > -1) &&
                        (this.searchParam.imei === '' || item.imei.indexOf(this.searchParam.imei) > -1)
                    )
                })
                this.tableData.total = list.length
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
            },
            // 筛选列表
            handleFilter() {
                this.selectList = []
                this.deviceStockOut.extendParams.imeiList = this.dataList.map(item => item.imei)
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
                    var { count } = this.rowData
                    const max = count
                    if (this.dataList.length <= max) {
                        this.$refs.TableComponent.validate().then(() => {
                            this.$emit('update:visible', false)
                            this.$emit('change', this.dataList)
                        }).catch()
                    } else {
                        this.$message.warning('申请退库数量不能大于 ' + max + ' 台(可退库数量)，请重新清点退库设备！')
                    }
                }
            },
            // 保存时校验
            handleValidate() {
                return this.$refs.TableComponent.validate()
            },
            // 更新表格配置
            updateTabelConfig() {
                switch (this.productCategory) {
                case 0:
                    // 智能设备
                    this.tableData.columns = this.TabelConfig.intelligent.concat(this.TabelConfig.common)
                    break
                case 1:
                    // SIM卡
                    this.tableData.columns = this.TabelConfig.sim.concat(this.TabelConfig.common)
                    break
                }
            },
            // 导入成功时触发
            handleImportSuccess(data) {
                let messageNode = `<p>导入成功数量：${data.passData.length}条</p>`
                if (data.unPassData.length) {
                    data.unPassData.map(item => {
                        messageNode += `<p>设备IMEI：${item.imei}导入失败</p>`
                    })
                }
                // 将清点结果转换
                data.passData.map(item => {
                    item.resultType = enums.storageReturnResultType.find(v => v.label === item.resultType).value
                    item.handleType = enums.storageReturnHandleType.find(v => v.label === item.handleType).value
                })
                this.handleSelectChange(data.passData, false)
                this.$message({
                    type: 'success',
                    duration: 0,
                    showClose: true,
                    message: messageNode,
                    dangerouslyUseHTMLString: true
                })
            },
            // 导入前检查
            handleBeforeUpload() {
                // 更新最大可选数
                this.deviceStockOut.maxCount = this.rowData.countApply - this.dataList.length
                // 如果最大可选数为0,则无法打开
                if (this.deviceStockOut.maxCount < 1) {
                    this.$message.warning('已达最大退库数量')
                    return false
                }
                return true
            },
            // 点击下载模板按钮时触发
            handleDownloadTemplate() {
                storageReturnApi.downloadTemplate()
            },
            // 多选-选中表格行时触发
            handleSelectionChange(val) {
                this.selectList = val
            },
            // 显示设备详情
            showDeviceDetail(row) {
                this.deviceDetailDialog.visible = true
                this.deviceDetailDialog.dataId = row.imei
            },
            // 调入
            handlePutIn() {
                // 更新最大可选数
                this.deviceStockOut.maxCount = this.rowData.countApply - this.dataList.length
                // 如果最大可选数为0,则无法打开
                if (this.deviceStockOut.maxCount < 1) {
                    return this.$message.warning('已达最大退库数量')
                }
                // 查询某标段,标段销售模式为租用,状态为正常下的在运营设备
                this.deviceStockOut.extendParams = {
                    fromReturnApproval: true,
                    imeiList: this.dataList.map(item => item.imei),
                    lockedProps: ['sectionId', 'unitStatus', 'sectionSalesType', 'productCategory', 'productCode', 'typeId', 'warehousesId'],
                    sectionId: this.basicData.sectionId,
                    sectionSalesType: 1,
                    unitStatus: 1,
                    productCategory: 'B16C3151-11D2-4364-8F45-63EFFFFCF424',
                    productCode: this.rowData.productCode,
                    typeId: 'cf946c33-9f2c-11eb-bbfa-000c29bb1337',
                    warehousesId: 'bc5fe3a9-5b92-4aad-b7fe-acc62dcc82de',
                    notSelectClick: () => {
                        this.$message.warning('该设备已经被选择！')
                    }
                }
                // 打开窗口
                this.selectDeviceDialog.visible = true
            },
            // 调入 - 确认选择退库设备
            handleSelectChange(list, showTip = true) {
                const defaultList = JSON.parse(JSON.stringify(this.dataList))
                const newList = []
                if (list && list.length) {
                    list.map(item => {
                        const newItem = {
                            guidId: item.guidId,
                            approvalDeviceReturnId: this.basicData.guidId || '',
                            deviceId: item.guidId,
                            imei: item.imei,
                            productId: this.rowData.guidId,
                            productCode: this.rowData.productCode,
                            // 选中标识,用于列表识别是否该条数据之前已被选中过
                            _idKey: item.imei,
                            // 待填字段,用于添加后编辑内容
                            cashPledge: 0,
                            // 可退押金, 当结果为丢失和人为损坏时使用
                            deposit: item.deposit || 0,
                            handleType: item.handleType || 0,
                            resultType: item.resultType || 0,
                            remark: item.remark || '',
                            // 列表显示
                            hasImei: item.hasImei,
                            hasImeiRepeatExcel: item.hasImeiRepeatExcel
                        }
                        // 判断listFaultCu中是否已经有这条,如果没有则添加
                        let hasOne = false
                        defaultList.map(_item => {
                            if (_item.imei === newItem.imei) {
                                hasOne = true
                            }
                        })
                        if (!hasOne) {
                            this.handleResultTypeChange(newItem.resultType, newItem, 'resultType')
                            newList.push(newItem)
                        }
                    })
                }
                if (newList.length) {
                    if (showTip) {
                        this.$message({ type: 'success', message: '成功调入' + newList.length + '台退库设备!' })
                    }
                    // 合并旧列表和新选择的列表
                    this.dataList = defaultList.concat(newList)
                    // 更新列表显示
                    this.filterData()
                } else this.$message({ type: 'warning', message: '没有新的退库设备被调入' })
            },
            // 调出
            handlePutOff() {
                if (this.selectList.length) {
                    this.selectList.forEach((item) => {
                        this.dataList.map((item_, index) => {
                            if (item_.imei === item.imei) {
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
            // 处理方式变化时
            handleTypeChange(type, item) {
                item.handleType = type
            },
            // 清点结果变化时
            handleResultTypeChange(type, item, prop, freshCash = true) {
                // 更新值
                item.resultType = type
                const cashPledge = item.cashPledge > 0 ? item.cashPledge : item.deposit
                // 清点结果判断
                switch (type) {
                case 0:
                    // 正常 锁定handleType为0
                    item.handleType = 0
                    item.lockedHandleType = true
                    if (freshCash) item.cashPledge = 0
                    break
                case 1:
                    // 人为损坏 默认handleType为0 不锁定
                    item.handleType = item.handleType === null ? 0 : item.handleType
                    item.lockedHandleType = false
                    if (freshCash) item.cashPledge = cashPledge
                    break
                case 2:
                    // 丢失 锁定为1
                    item.handleType = 1
                    item.lockedHandleType = true
                    if (freshCash) item.cashPledge = cashPledge
                    break
                case 3:
                    // 过保 默认为1 不锁定
                    item.handleType = item.handleType === null ? 1 : item.handleType
                    item.lockedHandleType = false
                    if (freshCash) item.cashPledge = 0
                    break
                case 4:
                    // 故障 默认为0 不锁定
                    item.handleType = item.handleType === null ? 0 : item.handleType
                    item.lockedHandleType = false
                    if (freshCash) item.cashPledge = 0
                    break
                }
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
