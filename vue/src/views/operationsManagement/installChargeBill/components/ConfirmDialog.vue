<!--
* @description 安装费结算确认窗口
* @author yc
!-->
<template>
    <div>
        <el-dialog
            :visible="visible"
            :before-close="handleDialogClose"
            :close-on-click-modal="!isEdit"
            title="安装费结算"
            width="1300px"
            class="not-padding"
            append-to-body
        >
            <div v-loading="loading" class="container">
                <el-collapse v-model="collapseValue" class="layou-collapse flex">
                    <el-collapse-item name="1" disabled>
                        <div slot="title" class="title">
                            <div class="text">基础信息</div>
                        </div>
                        <div class="base-form">
                            <BaseForm
                                ref="BaseForm"
                                :form-data="formData"
                                :is-edit="isEdit"
                                :is-create="isCreate"
                            />
                        </div>
                    </el-collapse-item>
                    <el-collapse-item name="2" class="hide-arrow flex" disabled>
                        <div slot="title" class="title">
                            <div class="text">清单详情</div>
                        </div>
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
                                    type="primary"
                                    icon="el-icon-plus"
                                    @click="handleImport"
                                >调入</el-button>
                                <ImportButton
                                    :upload-data="uploadData"
                                    :download-method="handleDownloadMethod"
                                    action="install-settlement/import"
                                    class="filter-button"
                                    template-name="导入模板.xlsx"
                                    style="margin-left: 10px;"
                                    @success="handleImportSuccess"
                                />
                            </template>
                            <template slot="filter">
                                <el-input
                                    v-model="searchParam.contractCode"
                                    size="mini"
                                    placeholder="合同编号"
                                    clearable
                                    class="filter-item"
                                    @change="handleFilter"
                                />
                                <el-input
                                    v-model="searchParam.imei"
                                    size="mini"
                                    placeholder="IMEI"
                                    clearable
                                    class="filter-item"
                                    @change="handleFilter"
                                />
                            </template>
                            <template slot="filter-popup">
                                <layout-filter-item label="项目名称">
                                    <el-input
                                        v-model="searchParam.projectName"
                                        size="mini"
                                        placeholder="项目名称"
                                        clearable
                                    />
                                </layout-filter-item>
                                <layout-filter-item label="企业名称">
                                    <el-input
                                        v-model="searchParam.customerName"
                                        size="mini"
                                        placeholder="企业名称"
                                        clearable
                                    />
                                </layout-filter-item>
                                <layout-filter-item label="标段名称">
                                    <el-input
                                        v-model="searchParam.sectionName"
                                        size="mini"
                                        placeholder="标段名称"
                                        clearable
                                    />
                                </layout-filter-item>
                                <layout-filter-item label="产品编号">
                                    <el-input
                                        v-model="searchParam.productCode"
                                        size="mini"
                                        placeholder="产品编号"
                                        clearable
                                    />
                                </layout-filter-item>
                                <layout-filter-item label="SIM卡号">
                                    <el-input
                                        v-model="searchParam.sim"
                                        size="mini"
                                        placeholder="SIM卡号"
                                        clearable
                                    />
                                </layout-filter-item>
                                <layout-filter-item label="车牌号">
                                    <el-input
                                        v-model="searchParam.carNumber"
                                        size="mini"
                                        placeholder="车牌号"
                                        clearable
                                    />
                                </layout-filter-item>
                                <layout-filter-item label="质保开始日期">
                                    <el-date-picker
                                        v-model="searchParam.qaStartDate"
                                        :default-time="['00:00:00', '23:59:59']"
                                        type="daterange"
                                        format="yyyy-MM-dd"
                                        value-format="yyyy-MM-dd HH:mm:ss"
                                        range-separator="至"
                                        start-placeholder="开始日期"
                                        end-placeholder="结束日期"
                                        clearable
                                    />
                                </layout-filter-item>
                                <layout-filter-item label="安装人">
                                    <el-input
                                        v-model="searchParam.installUserName"
                                        size="mini"
                                        placeholder="安装人"
                                        clearable
                                    />
                                </layout-filter-item>
                                <layout-filter-item label="安装时间">
                                    <el-date-picker
                                        v-model="searchParam.installTime"
                                        :default-time="['00:00:00', '23:59:59']"
                                        type="daterange"
                                        format="yyyy-MM-dd"
                                        value-format="yyyy-MM-dd HH:mm:ss"
                                        range-separator="至"
                                        start-placeholder="开始日期"
                                        end-placeholder="结束日期"
                                        clearable
                                    />
                                </layout-filter-item>
                            </template>
                            <template slot="table">
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
                            </template>
                        </layout-filter>
                    </el-collapse-item>
                </el-collapse>
            </div>
            <span v-if="isEdit" slot="footer">
                <el-button :loading="loading" size="mini" @click="$emit('update:visible', false)">取 消</el-button>
                <el-button v-prereclick :loading="loading" type="primary" size="mini" plain @click="handleSubmit(true)">暂 存</el-button>
                <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit()">保 存</el-button>
            </span>
        </el-dialog>
        <SelectDialog
            v-if="selectDialog.visible"
            v-bind="selectDialog"
            :visible.sync="selectDialog.visible"
            @change="handleSelectDialogChange"
        />
    </div>
</template>

<script>
    // API
    import deviceInstallApi from '@/api/operationsManagement/deviceInstall'
    import installChargeBillApi from '@/api/operationsManagement/installChargeBill'
    // 方法
    import { isEmpty, filterList, exportTabel } from '@/utils'
    import rigorous from '@/utils/rigorous'
    // 组件
    import BaseForm from './BaseForm'

    export default {
        name: 'ConfirmDialog',
        components: {
            BaseForm
        },
        props: {
            dataId: null,
            rowData: Object,
            visible: { type: Boolean, default: false }
        },
        data() {
            let isEdit = isEmpty(this.dataId)
            return {
                isEdit,
                loading: false,
                formData: {},
                dataList: [],
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            minWidth: 120
                        },
                        {
                            prop: 'imei',
                            label: 'IMEI',
                            width: 140,
                            dbProp: 'tdid.c_imei',
                            sortable: 'custom'
                        },
                        {
                            prop: 'sim',
                            label: 'SIM卡号',
                            width: 120,
                            dbProp: 'tdid.c_sim',
                            sortable: 'custom'
                        },
                        {
                            prop: 'contractCode',
                            label: '合同编号',
                            minWidth: 155,
                            idKey: 'contractId',
                            isClick: true,
                            dialogType: 'salesContract'
                        },
                        {
                            prop: 'supplierName',
                            label: '供应商',
                            minWidth: 220,
                            isClick: true,
                            dialogType: 'supplier',
                            idKey: 'supplierId'
                        },
                        {
                            prop: 'customerName',
                            label: '企业',
                            minWidth: 200,
                            idKey: 'customerId',
                            isClick: true,
                            dialogType: 'customer'
                        },
                        {
                            prop: 'sectionName',
                            label: '标段',
                            minWidth: 180,
                            idKey: 'sectionId',
                            isClick: true,
                            dialogType: 'sections'
                        },
                        {
                            prop: 'carNumber',
                            width: 100,
                            label: '车牌号'
                        },
                        {
                            type: 'date',
                            prop: 'qaStartDate',
                            width: 120,
                            label: '质保开始日期',
                            dbProp: 'tdid.c_qa_start_date',
                            sortable: 'custom'
                        },
                        {
                            prop: 'installUserName',
                            width: 100,
                            label: '安装人'
                        },
                        {
                            type: 'date',
                            prop: 'installTime',
                            width: 160,
                            label: '安装时间',
                            format: 'YYYY-MM-DD HH:mm:ss',
                            dbProp: 'tdid.c_install_time',
                            sortable: 'custom'
                        },
                        {
                            type: 'location',
                            prop: 'address',
                            minWidth: 240,
                            label: '安装地点'
                        },
                        {
                            type: 'viewer',
                            prop: 'fileNum',
                            minWidth: 60,
                            label: '附件',
                            align: 'center',
                            method: async({ row }) => {
                                this.tableData.options.loading = true
                                let res = await deviceInstallApi.getDeviceDetail(row.guidId)
                                row.files = res.data.files
                                this.tableData.options.loading = false
                            }
                        },
                        {
                            type: 'money',
                            prop: 'feeAmount',
                            label: '安装费（元）',
                            width: 160,
                            fixed: 'right',
                            render: (h, { row, column }) => {
                                return (
                                    <el-input-number
                                        value={row[column.prop]}
                                        onInput={res => {
                                            row[column.prop] = res
                                            this.updateBaseData()
                                        }}
                                        placeholder='请输入'
                                        min={0}
                                        size='mini'
                                        controls-position='right'
                                        style='width:100%;'
                                    />
                                )
                            },
                            isRender: () => this.isEdit
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: '100%'
                    },
                    // 列操作按钮
                    operates: {
                        width: 55,
                        fixed: 'right',
                        show: isEdit
                    }
                },
                searchParam: {
                    pageSize: 10,
                    pageIndex: 1
                },
                selectDialog: {
                    visible: false
                },
                collapseValue: ['1', '2']
            }
        },
        computed: {
            isCreate() {
                return this.formData.feeStatus !== 9
            },
            uploadData() {
                return {
                    settlementId: this.dataId
                }
            }
        },
        watch: {
            dataId: {
                immediate: true,
                handler() {
                    this.queryBaseInfo()
                }
            },
            rowData: {
                immediate: true,
                handler() {

                }
            },
            isEdit(value) {
                this.$set(this.tableData.columns.find(v => v.prop === 'feeAmount'), 'isRender', value)
            },
            'searchParam.pageSize'() {
                this.filterData()
            },
            'searchParam.pageIndex'() {
                this.filterData()
            }
        },
        mounted() {
        },
        methods: {
            // 筛选数据
            filterData() {
                var pageSize = this.searchParam.pageSize
                var pageIndex = this.searchParam.pageIndex
                var list = filterList(this.dataList, this.searchParam, [
                    { name: 'sim', type: 'string' },
                    { name: 'imei', type: 'string' },
                    { name: 'carNumber', type: 'string' },
                    { name: 'productCode', type: 'string' },
                    { name: 'sectionName', type: 'string' },
                    { name: 'projectName', type: 'string' },
                    { name: 'customerName', type: 'string' },
                    { name: 'contractCode', type: 'string' },
                    { name: 'qaStartDate', type: 'dateRange' },
                    { name: 'installTime', type: 'dateRange' },
                    { name: 'installUserName', type: 'string' }
                ])
                this.tableData.total = list.length
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
            },
            // 获取基础信息
            async queryBaseInfo() {
                if (this.dataId) {
                    this.tableData.options.loading = true
                    let [{ data: data1 }, { data: data2 }] = await Promise.all([
                        installChargeBillApi.detail(this.dataId),
                        deviceInstallApi.getDeviceList({
                            pageSize: -1,
                            settlementId: this.dataId
                        })
                    ])
                    this.isEdit = data1.feeStatus !== 9
                    this.tableData.operates.show = this.isEdit
                    this.formData = {
                        ...this.formData,
                        ...this.rowData,
                        ...data1,
                        feeAmount: 0
                    }
                    this.dataList = data2.records.map(item => {
                        item.files = null
                        return item
                    })
                    this.filterData()
                    this.updateBaseData()
                    this.tableData.options.loading = false
                }
            },
            // 更新表单数据
            updateBaseData() {
                this.formData = {
                    ...this.formData,
                    feeAmount: this.dataList.reduce((a, b) => {
                        return a + b.feeAmount
                    }, 0)
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
            // 提交数据
            async handleSubmit(hold) {
                if (this.dataList.length) {
                    this.loading = true
                    try {
                        let formData = await this.$refs.BaseForm.submit()
                        let res = await installChargeBillApi.update({
                            ...this.formData,
                            ...formData,
                            type: hold ? 0 : 1,
                            guidId: this.dataId,
                            deviceInstallListDetail: this.dataList
                        })
                        this.$notify({
                            title: '操作成功',
                            message: res.msg,
                            type: 'success',
                            duration: 2000
                        })
                        this.$emit('update')
                        this.$emit('update:visible', false)
                    } catch (e) {
                        console.error(e)
                    }
                    this.loading = false
                } else {
                    this.$message.warning('清单详情不能为空！')
                }
            },
            // 点击调入按钮时触发
            handleImport() {
                this.selectDialog = {
                    type: 'deviceInstallBill',
                    title: '选择设备安装清单',
                    value: this.dataList,
                    visible: true,
                    multiple: true,
                    extendParams: {
                        fromSettlement: true
                    }
                }
            },
            // 删除设备时触发
            handleDeleteDevice(data) {
                var index = this.dataList.findIndex(item => item === data)
                if (index > -1) {
                    this.dataList.splice(index, 1)
                }
                this.filterData()
            },
            // 选择设备安装清单后触发
            handleSelectDialogChange(list) {
                list.forEach(item => {
                    item.feeAmount = (isEmpty(item.feeAmount) ? item.installUnit : item.feeAmount) || 0
                })
                this.dataList = list
                this.filterData()
                this.updateBaseData()
            },
            // 弹窗关闭时触发
            handleDialogClose() {
                if (this.isEdit) {
                    this.$confirm('确认放弃本次操作？').then(_ => {
                        this.$emit('update:visible', false)
                    }).catch(_ => {
                        return false
                    })
                } else {
                    this.$emit('update:visible', false)
                }
            },
            // 下载模板
            handleDownloadMethod() {
                installChargeBillApi.downloadTemplate()
            },
            // 导入成功时触发
            handleImportSuccess(data) {
                let succeed = data.passData.length
                let failure = data.unPassData.length
                let messageNode = `<p style="margin-bottom: 4px;">导入成功${succeed}条数据，导入失败${failure}条数据</p>`
                messageNode += data.unPassData.map((item, index) => {
                    return `<p>${index + 1}：${item.imei}</p>`
                }).filter(v => v).join('')
                this.$message({
                    type: 'success',
                    duration: failure > 0 ? 0 : 5000,
                    showClose: true,
                    message: messageNode,
                    dangerouslyUseHTMLString: true
                })
                this.dataList = data.passData
                this.filterData()
                this.updateBaseData()
            }
        }
    }
</script>

<style lang='scss' scoped>
.container {
    height: 80vh;
    padding: 10px;
    box-sizing: border-box;
    .device-wrap {
        height: 100%;
        padding-bottom: 1px;
    }
}
</style>
