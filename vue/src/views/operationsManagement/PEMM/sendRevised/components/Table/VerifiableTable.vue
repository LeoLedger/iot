<!--
* @description 寄修单核验表格
* @author yc
!-->
<template>
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
                    :loading="loading"
                    :upload-data="uploadData"
                    :download-method="handleDownloadMethod"
                    action="express/device/import"
                    class="filter-button"
                    template-name="导入模板.xlsx"
                    @success="handleImportSuccess"
                />
            </template>
            <slot name="button"/>
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
            <el-select
                v-model="searchParam.isReplace"
                placeholder="是否已替换"
                filterable
                clearable
                size="mini"
                class="filter-item"
                @change="handleFilter"
            >
                <el-option :value="0" label="未替换" />
                <el-option :value="1" label="已替换" />
            </el-select>
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
        <template slot="filter-popup">
            <layout-filter-item label="寄修类型">
                <DictSelect
                    v-model="searchParam.type"
                    type="sendRevisedType"
                    placeholder="寄修类型"
                    clearable
                    filterable
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="厂家诊断结果">
                <el-input
                    v-model="searchParam.factoryFeedback"
                    size="mini"
                    placeholder="厂家诊断结果"
                    clearable
                    class="filter-item"
                    @change="handleFilter"
                />
            </layout-filter-item>
            <layout-filter-item label="厂家处理方式">
                <el-input
                    v-model="searchParam.factoryHandlingWay"
                    size="mini"
                    placeholder="厂家处理方式"
                    clearable
                    class="filter-item"
                    @change="handleFilter"
                />
            </layout-filter-item>
        </template>
        <template slot="table">
            <TableComponent
                ref="TableComponent"
                v-bind="tableData"
                :page-index.sync="searchParam.pageIndex"
                :page-size.sync="searchParam.pageSize"
            />
        </template>
        <div>
            <!-- 信息窗口 -->
            <MessageDialog
                v-bind="messageDialog"
                :visible.sync="messageDialog.visible"
                @confirm="messageDialog.visible = false"
            />
        </div>
    </layout-filter>
</template>

<script>
    // API
    import sendRevisedApi from '@/api/operationsManagement/sendRevised'
    // 方法
    import { isEmpty, filterList, exportTabel } from '@/utils'
    // 组件

    export default {
        name: 'VerifiableTable',
        components: {
        },
        props: {
            isEdit: { type: Boolean, default: false },
            dataList: Array,
            formData: Object,
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
                            minWidth: 150,
                            fixed: 'left',
                            isCopy: ({ row }) => row.deviceId,
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
                            prop: 'projectName',
                            label: '所属项目',
                            minWidth: 200,
                            idKey: 'projectId',
                            isClick: true,
                            dialogType: 'project'
                        },
                        {
                            prop: 'sectionName',
                            label: '标段',
                            minWidth: 200,
                            idKey: 'sectionId',
                            isClick: true,
                            dialogType: 'sections'
                        },
                        {
                            prop: 'customerName',
                            label: '企业',
                            minWidth: 200
                        },
                        {
                            type: 'dict',
                            dictType: 'sendRevisedType',
                            prop: 'type',
                            label: '寄修类型',
                            width: 140
                        },
                        {
                            prop: 'clientFeedback',
                            label: '客服诊断结果',
                            width: 160
                        },
                        {
                            prop: 'factoryFeedback',
                            label: '厂家诊断结果',
                            width: 160
                        },
                        {
                            prop: 'factoryHandlingWay',
                            label: '厂家处理方式',
                            width: 220
                        },
                        {
                            type: 'money',
                            prop: 'totalCost',
                            label: '维修费用（元）',
                            width: 120
                        },
                        {
                            type: 'dict',
                            dictType: 'isReplaceSim',
                            prop: 'isReplaceCard',
                            label: '是否有换卡',
                            width: 90
                        },
                        {
                            type: 'dict',
                            dictType: 'verifiableResult',
                            prop: 'verificationResult',
                            label: '核验结果',
                            width: 140,
                            render: (h, { row, column }) => {
                                let disabled = this.isVerifiable(row)
                                return (
                                    <el-tooltip
                                        content='请前往故障单管理为该设备设置替换设备后再进行核验！'
                                        effect='dark'
                                        placement='top-start'
                                        manual={disabled}
                                    >
                                        <dict-select
                                            type='verifiableResult'
                                            value={row[column.prop]}
                                            exclude={row.replaceType === 3 ? [1, 2, 3, 4, 6] : [5]}
                                            disabled={!disabled}
                                            clearable
                                            placeholder={column.label}
                                            onChange={res => {
                                                row[column.prop] = res
                                                this.handleVerificationResultChange(row)
                                            }}
                                        />
                                    </el-tooltip>
                                )
                            },
                            isRender: ({ row }) => this.isEdit && row.isExpressVerify !== 1
                        },
                        {
                            type: 'dict',
                            dictType: 'sendRevisedDisposalWay',
                            prop: 'verificationHandlingWay',
                            label: '处理方式',
                            width: 140
                        },
                        {
                            type: 'money',
                            prop: 'companyBearCost',
                            label: '公司承担费用',
                            width: 140
                        },
                        {
                            type: 'money',
                            prop: 'enterpriseBearCost',
                            label: '企业承担费用',
                            width: 140
                        },
                        {
                            prop: 'replaceCardNumber',
                            label: '更换SIM卡',
                            width: 130
                        },
                        {
                            prop: 'verificationUserName',
                            label: '分配核验人员',
                            width: 100
                        },
                        {
                            type: 'date',
                            prop: 'expressCreateTime',
                            label: '创建时间',
                            width: 100
                        }
                    ],
                    options: {
                        rules: {
                            verificationResult: { required: true, message: '请选择核验结果', trigger: 'change' }
                        },
                        height: '100%',
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    }
                },
                filterList: [],
                searchParam: {
                    ...this.defaultParam
                },
                messageDialog: {
                    visible: false,
                    content: ''
                },
                projectOptions: [],
                sectionOptions: [],
                customerOptions: [],
                activeRowData: null
            }
        },
        computed: {
            loading() {
                return this.tableData.options.loading
            },
            uploadData() {
                let expressRepairId = this.formData ? this.formData.guidId : ''
                return {
                    isReplace: this.searchParam.isReplace,
                    expressRepairId
                }
            }
        },
        watch: {
            dataList(list) {
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
            // 判断寄修设备是否可以进行核验
            isVerifiable(data) {
                let type = this.isWorkbench ? data.type : this.formData.type
                if (data.isExpressVerify === 1) return false
                if ([0, 2].includes(type)) return !!data.isReplace
                return true
            },
            // 验证表单
            validate() {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        let list = this.getFormData()
                        if (list.length) {
                            resolve(list)
                        } else {
                            // 找出验证不通过的列表
                            let dirtys = this.dataList.filter(item => {
                                let pass = true
                                if (this.isVerifiable(item)) {
                                    if (isEmpty(item.verificationResult)) {
                                        pass = false
                                    }
                                } else {
                                    pass = false
                                }
                                return !pass
                            })
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
                        }
                    }, 50)
                })
            },
            // 筛选数据
            filterData() {
                var { pageSize, pageIndex } = this.searchParam
                var list = filterList(this.dataList, this.searchParam, [
                    { name: 'type', type: 'same' },
                    { name: 'imei', type: 'string' },
                    { name: 'isReplace', type: 'same' },
                    { name: 'projectName', type: 'string' },
                    { name: 'sectionName', type: 'string' },
                    { name: 'customerName', type: 'string' },
                    { name: 'factoryFeedback', type: 'string' },
                    { name: 'factoryHandlingWay', type: 'string' }
                ])
                this.filterList = list
                this.tableData.total = list.length
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
            },
            // 获取提交数据
            getFormData() {
                if (this.isWorkbench) {
                    return this.dataList.filter(item => {
                        let pass = true
                        if (this.isVerifiable(item)) {
                            if (isEmpty(item.verificationResult)) {
                                pass = false
                            }
                            if ([0, 2].includes(item.type)) {
                                // 如果寄修类型为正常维修，需要验证公司承担费用+企业承担费用=维修费用
                                let { totalCost, companyBearCost, enterpriseBearCost } = item
                                if (companyBearCost + enterpriseBearCost !== totalCost) {
                                    pass = false
                                }
                            }
                        } else {
                            pass = false
                        }
                        return pass
                    })
                }
                return this.dataList
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
                    name: '维修核验工作台',
                    columns: this.tableData.columns,
                    dataList: this.filterList
                })
            },
            // 弹窗关闭时触发
            handleDialogClose() {
                this.$confirm('确认放弃本次操作？').then(_ => {
                    this.$emit('update:visible', false)
                }).catch(_ => {
                    return false
                })
            },
            // 下载模板
            handleDownloadMethod() {
                let guidId = this.formData ? this.formData.guidId : void 0
                sendRevisedApi.workbenchTemplate({
                    ...this.searchParam,
                    expressRepairId: guidId
                })
            },
            // 下载导入失败的列表文件
            handleDownloadFailure(id) {
                sendRevisedApi.downloadFailureList(id, {
                    isCreateOrUpdate: 0
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
                data.filter(v => v.code === 0).map(v => v.data).forEach(item => {
                    let data = this.dataList.find(v => v.guidId === item.guidId)
                    if (data) {
                        if (this.isVerifiable(data)) {
                            data.verificationResult = item.verificationResult
                            data.verificationHandlingWay = item.verificationHandlingWay
                            this.handleVerificationResultChange(data)
                        }
                        // data.companyBearCost = item.companyBearCost
                        // data.enterpriseBearCost = item.enterpriseBearCost
                    }
                })
                this.handleFilter()
            },
            // 核验结果改变时触发
            handleVerificationResultChange(row) {
                switch (row.verificationResult) {
                case 0:
                    // 核验结果为“未修好”的，处理方式默认为“二次返修”且不允许修改
                    row.verificationHandlingWay = 4
                    break
                case 1:
                    // 核验结果为“已修好”的，处理方式默认为“收回备用库”且不允许修改
                    row.verificationHandlingWay = 1
                    break
                case 2:
                    // 核验结果为“人为损坏未修”的，处理方式默认为“挂起”且不允许修改
                    row.verificationHandlingWay = 2
                    break
                case 3:
                    // 核验结果为“人为损坏已修”的，处理方式默认为“收回备用库”且不允许修改
                    row.verificationHandlingWay = 1
                    break
                case 4:
                    // 核验结果为“永久损坏”的，处理方式默认为“报废”且不允许修改
                    row.verificationHandlingWay = 3
                    break
                case 5:
                    row.verificationHandlingWay = 5
                    break
                case 6:
                    row.verificationHandlingWay = 6
                    break
                default:
                    row.verificationHandlingWay = ''
                    break
                }
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
