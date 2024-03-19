<!--
* @description 寄出设备列表
* @author whr
!-->
<template>
    <div>
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
                    :action="importAction"
                    :before-upload="handleBeforeUpload"
                    :upload-data="uploadData"
                    :download-method="handleDownloadTemplate"
                    type="primary"
                    class="filter-button"
                    title="导入设备清单"
                    template-name="设备清单模板.xlsx"
                    @success="handleImportSuccess"
                />
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
                    v-bind="tableData"
                    :list="tableData.list"
                    :selected-list="selectList"
                    :page-index.sync="searchParam.pageIndex"
                    :page-size.sync="searchParam.pageSize"
                    @handleSelectionChange="handleSelectionChange"
                    @refreshList="handleFilter"
                />
            </template>
        </layout-filter>
        <SelectDeviceDialog
            v-if="selectDeviceDialog.visible"
            v-bind="deviceStockOut"
            :visible.sync="selectDeviceDialog.visible"
            title="选择寄出设备"
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
    // API
    // 方法
    // 组件
    import SelectDeviceDialog from '@/components/SelectDialog/index'
    import expressRepairApi from '@/api/operationsManagement/expressRepair'
    import { deepClone } from '@/utils'
    export default {
        components: {
            SelectDeviceDialog
        },
        props: {
            // 标段guid
            dataId: { type: String, default: null },
            // 寄出设备列表
            deviceList: {
                type: Array,
                default: () => []
            },
            sendFlag: {
                type: Number
            },
            basicData: { type: Object },
            showAction: { type: Boolean, default: false } // 是否显示操作按钮
        },
        data() {
            return {
                tabList: [],
                searchParam: {
                    imei: '',
                    pageSize: 10,
                    pageIndex: 1
                },
                selectList: [],
                importAction: '',
                dataList: [],
                isImportHandle: false,
                uploadData: {},
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            label: 'IMEI',
                            prop: 'imei',
                            render: (h, { row, column }) => {
                                if (this.showAction) {
                                    var content = []
                                    switch (column.prop) {
                                    case 'imei':
                                        if (row.noExists) {
                                            content.push('设备不存在')
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
                        },
                        {
                            label: '产品编号',
                            prop: 'productCode'
                        },
                        {
                            label: '产品名称',
                            prop: 'productName'
                        }
                    ],
                    options: {
                        height: '450px',
                        showPagination: true,
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        curRowKey: 'guidId',
                        mutiSelect: this.showAction,
                        mutiSelectedKey: 'guidId'
                    }
                },
                selectDeviceDialog: {
                    visible: false
                },
                deviceStockOut: {
                    value: '',
                    excludes: [],
                    maxCount: Infinity,
                    overageMessage: '',
                    multiple: true,
                    extendParams: {},
                    setTableOptions: { showPagination: false },
                    customRequest: expressRepairApi.getApprovalDeviceList
                },
                deviceDetailDialog: {
                    visible: false,
                    dataId: null
                }
            }
        },
        computed: {
        },
        watch: {
            'searchParam.pageSize'() {
                this.filterData()
            },
            'searchParam.pageIndex'() {
                this.filterData()
            },
            deviceList: {
                deep: true,
                immediate: true,
                handler(data) {
                    if (data) {
                        this.dataList = data || []
                        this.handleFilter()
                    } else {
                        this.dataList = []
                    }
                    this.importAction = 'express-repair/import'
                }
            }
        },
        mounted() {
        },
        methods: {
            // 导出
            handleExport() {
                const data = { ...this.searchParam }
                data.pageSize = this.tableData.total
            },
            // 筛选数据
            filterData() {
                var pageSize = this.searchParam.pageSize
                var pageIndex = this.searchParam.pageIndex
                var list = this.dataList.filter(item => {
                    return (this.searchParam.imei === '' || item.imei.indexOf(this.searchParam.imei) > -1)
                })
                this.tableData.total = list.length
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
            },
            // 筛选列表
            handleFilter() {
                this.selectList = []
                this.deviceStockOut.extendParams.selectDeviceIds = this.dataList.map(item => item.guidId)
                if (this.searchParam.pageIndex !== 1) {
                    this.searchParam.pageIndex = 1
                } else {
                    this.filterData()
                }
            },
            // 多选-选中表格行时触发
            handleSelectionChange(val) {
                this.selectList = val
            },
            // 调入
            handlePutIn() {
                this.selectDeviceDialog.visible = true
                // 查询设备
                this.deviceStockOut.extendParams = {
                    listType: 0,
                    imeiList: this.dataList.map(item => item.imei),
                    lockedProps: ['approvalId', 'businessType', 'productCategory'],
                    productCategory: 'B16C3151-11D2-4364-8F45-63EFFFFCF424',
                    businessType: this.basicData.businessType,
                    approvalId: this.basicData.approvalId,
                    sendFlag: 0
                }
            },
            // 调入 - 确认选择报损设备
            handleSelectChange(list) {
                const defaultList = JSON.parse(JSON.stringify(this.dataList))
                const newList = []
                if (list && list.length) {
                    list.map(item => {
                        const newItem = {
                            deviceId: item.guidId,
                            _idKey: item.imei,
                            ...item
                        }
                        // 判断listFaultCu中是否已经有这条,如果没有则添加
                        let hasOne = false
                        defaultList.map(_item => {
                            if (_item.imei === newItem.imei) {
                                hasOne = true
                            }
                        })
                        if (!hasOne) {
                            newList.push(newItem)
                        }
                    })
                }
                if (newList.length) {
                    this.$message({ type: 'success', message: '成功调入' + newList.length + '台设备!' })
                    // 合并旧列表和新选择的列表
                    this.dataList = defaultList.concat(newList)
                    // 更新列表显示
                    this.filterData()
                } else this.$message({ type: 'warning', message: '没有新的设备被调入' })
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
            // 点击下载模板按钮时触发
            handleDownloadTemplate() {
                expressRepairApi.downloadTemplate({})
            },
            // 导入成功时触发
            handleImportSuccess(list) {
                let suc = 0
                let fal = 0
                const sucList = []
                let messageNode = `<p style="margin-bottom: 4px;">导入成功${suc}条数据，导入失败${fal}条数据</p>`
                if (list && list.length) {
                    list.map((item, index) => {
                        if (item.code === 0) {
                            sucList.push(item.data)
                            suc++
                        } else {
                            messageNode += `<p>第${index + 1}行：${item.errorMsg}</p>`
                            fal++
                        }
                    })
                }
                this.$message({
                    type: 'success',
                    duration: fal > 0 ? 0 : 5000,
                    showClose: true,
                    message: messageNode,
                    dangerouslyUseHTMLString: true
                })
                this.handleSelectChange(sucList)
            },
            handleBeforeUpload() {
                if (this.basicData.approvalId) {
                    this.uploadData = {
                        approvalCode: this.basicData.approvalCode,
                        approvalId: this.basicData.approvalId,
                        businessType: this.basicData.businessType,
                        sendFlag: this.sendFlag
                    }
                    return true
                } else {
                    this.$message.warning('请先选择关联单据')
                    return false
                }
            },
            // 显示设备详情
            showDeviceDetail(row) {
                this.deviceDetailDialog.visible = true
                this.deviceDetailDialog.dataId = row.imei
            },
            getDataList() {
                return this.dataList
            }
        }
    }
</script>

<style lang='scss' scoped>
.group-type-list {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  width: 100%;
  .group-type-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 3px;
    width: 120px;
    border: 1px solid #c0c4cc;
    color: #c0c4cc;
    text-align: center;
    font-size: 12px;
    margin-right: 10px;
    cursor: pointer;
    &.disabled {
      border: 1px solid #cccccc;
      color: #cccccc;
    }
    &.active {
      border-color: #409eff;
      color: #409eff;
      background-color: #ecf5ff;
    }
    &:hover {
      color: #409eff;
      border-color: #409eff;
    }
  }
}
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
