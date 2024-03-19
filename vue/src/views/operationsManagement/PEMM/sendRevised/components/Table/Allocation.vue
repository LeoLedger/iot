<!--
* @description 维修反馈表格
* @author yc
!-->
<template>
    <el-collapse-item name="2" class="hide-arrow flex" disabled>
        <div slot="title" class="title">
            <div class="text">寄修设备</div>
        </div>
        <layout-filter
            :table-columns.sync="tableData.columns"
            :filter-model.sync="searchParam"
            @search="filterData"
        >
            <template v-if="isEdit" slot="button">
                <el-button
                    v-waves
                    size="mini"
                    class="filter-button"
                    type="primary"
                    @click="handleQuick"
                >一键分配</el-button>
                <el-button
                    v-waves
                    size="mini"
                    class="filter-button"
                    type="primary"
                    @click="handleAllocation"
                >分配</el-button>
                <ImportButton
                    :upload-data="uploadData"
                    :download-method="handleDownloadMethod"
                    action="express/distribution/import"
                    class="filter-button"
                    template-name="导入模板.xlsx"
                    style="margin-left: 10px;"
                    @success="handleImportSuccess"
                />
            </template>
            <template slot="filter">
                <el-select
                    v-model="searchParam.projectName"
                    placeholder="项目名称"
                    filterable
                    clearable
                    size="mini"
                    class="filter-item"
                    @change="filterData"
                >
                    <el-option
                        v-for="option in projectOptions"
                        :key="option"
                        :value="option"
                        :label="option"
                    />
                </el-select>
                <el-input
                    v-model="searchParam.imei"
                    size="mini"
                    placeholder="IMEI"
                    clearable
                    class="filter-item"
                    @change="filterData"
                />
            </template>
            <template slot="table">
                <TableComponent
                    ref="TableComponent"
                    v-bind="tableData"
                    :page-index.sync="publicParam.pageIndex"
                    :page-size.sync="publicParam.pageSize"
                    @handleSelectionChange="handleSelectionChange"
                />
            </template>
        </layout-filter>
        <div>
            <SelectDialog
                v-if="selectDialog.visible"
                v-bind="selectDialog"
                :visible.sync="selectDialog.visible"
                @change="handleSelectDialogChange"
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
    import SelectDialog from '@/components/SelectDialog/index'

    export default {
        name: 'Allocation',
        components: {
            SelectDialog
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
                            minWidth: 155,
                            isClick: true,
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
                            label: '所属标段',
                            width: 160,
                            idKey: 'sectionId',
                            isClick: true,
                            dialogType: 'sections'
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
                            minWidth: 200
                        },
                        {
                            type: 'money',
                            prop: 'totalCost',
                            label: '维修费用（元）',
                            width: 120
                        },
                        {
                            prop: 'verificationUserName',
                            label: '分配核验人',
                            width: 90
                        }
                    ],
                    options: {
                        rules: {
                            verificationUserName: { required: true, message: '请分配第 ${index} 台设备的核验人', trigger: 'change' }
                        },
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: '100%',
                        curRowKey: 'guidId',
                        mutiSelect: this.isEdit,
                        mutiSelectedKey: 'guidId',
                        showSingleSelectCheckBox: this.isEdit,
                        showAsterisk: this.isEdit
                    }
                },
                selectList: [],
                searchParam: {
                    imei: ''
                },
                selectDialog: {},
                activeRowData: null,
                projectOptions: []
            }
        },
        computed: {
            uploadData() {
                return {
                    expressId: this.formData.guidId
                }
            }
        },
        watch: {
            formData: {
                immediate: true,
                handler(data) {
                    if (data) {
                        let deviceList = (data.updateDevices || []).map(v => v)
                        let projectOptions = []
                        deviceList.forEach(item => {
                            if (!isEmpty(item.projectName) && projectOptions.findIndex(v => v === item.projectName) === -1) {
                                projectOptions.push(item.projectName)
                            }
                        })
                        this.deviceList = deviceList
                        this.projectOptions = projectOptions
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
                var pageSize = this.publicParam.pageSize
                var pageIndex = this.publicParam.pageIndex
                var list = filterList(this.deviceList, this.searchParam, [
                    { name: 'imei', type: 'string' },
                    { name: 'projectName', type: 'string' }
                ])
                this.tableData.total = list.length
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
            },
            // 点击一键分配按钮时触发
            handleQuick() {
                this.deviceList.forEach(item => {
                    item.verificationUserId = item.tempUserId
                    item.verificationUserName = item.temUserName
                })
                this.$message.success('一键分配成功！')
            },
            // 点击分配按钮时触发
            handleAllocation(data) {
                if (this.selectList.length) {
                    var selectDialog = {
                        type: 'People',
                        title: '选择核验人',
                        visible: true
                    }
                    this.selectDialog = selectDialog
                } else {
                    this.$message.warning('请至少选择一项！')
                }
            },
            // 选择人员后触发
            handleSelectDialogChange([data]) {
                this.selectList.forEach(item => {
                    item.verificationUserId = data.userId
                    item.verificationUserName = data.userName
                })
                this.selectList = []
            },
            // 多选-选中表格行时触发
            handleSelectionChange(val) {
                this.selectList = val
            },
            // 下载模板
            handleDownloadMethod() {
                sendRevisedApi.allocationTemplate({
                    expressId: this.formData.guidId
                })
            },
            // 导入成功时触发
            handleImportSuccess(data) {
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
                    let data = this.deviceList.find(v => v.imei === item.imei)
                    if (data) {
                        data.verificationUserId = item.verificationUserId
                        data.verificationUserName = item.verificationUserName
                    }
                })
                this.filterData()
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
