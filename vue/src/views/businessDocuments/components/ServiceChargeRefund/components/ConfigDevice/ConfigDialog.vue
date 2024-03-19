<!--
* @description 配置退费设备
* @author yc
!-->
<template>
    <div>
        <el-dialog
            v-if="visible"
            :visible="visible"
            :close-on-click-modal="false"
            :title="isEdit ? '配置退费设备': '可退费设备'"
            width="1300px"
            append-to-body
            @close="$emit('update:visible', false)"
        >
            <layout-filter
                :table-columns.sync="tableData.columns"
                :filter-model.sync="searchParam"
                @search="handleFilter"
            >
                <template v-if="isEdit">
                    <template slot="button">
                        <el-button
                            v-waves
                            size="mini"
                            class="filter-button"
                            type="success"
                            @click="handleImport"
                        >调入</el-button>
                        <el-button
                            v-waves
                            :disabled="!tableData.total"
                            size="mini"
                            class="filter-button"
                            type="warning"
                            @click="handleExport"
                        >调出</el-button>
                        <ImportButton
                            :upload-data="importData"
                            :download-method="handleDownloadMethod"
                            action="approvalServiceCharge/import"
                            class="filter-button"
                            template-name="导入模板.xlsx"
                            @success="handleImportSuccess"
                        />
                    </template>
                </template>
                <component
                    slot="filter"
                    :is="filterName"
                    :search-param="searchParam"
                    @change="handleFilter"
                />
                <component
                    slot="filter-popup"
                    :is="filterPopupName"
                    :search-params="searchParam"
                    @change="handleFilter"
                />
                <template slot="table">
                    <TableComponent
                        ref="TableComponent"
                        v-bind="tableData"
                        :selected-list="selectList"
                        :page-size.sync="searchParam.pageSize"
                        :page-index.sync="searchParam.pageIndex"
                        @handleSelectionChange="handleSelectionChange"
                    />
                </template>
            </layout-filter>
            <span v-if="isEdit" slot="footer">
                <el-button :loading="loading" size="mini" @click="$emit('update:visible', false)">取 消</el-button>
                <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit">保 存</el-button>
            </span>
        </el-dialog>
        <ExportDialog
            v-bind="exportDialog"
            :visible.sync="exportDialog.visible"
            @change="handleExportChange"
        />
    </div>
</template>

<script>
    // 方法
    // API
    import storageOutApi from '@/api/businessDocuments/storageOut'
    import serviceChargeRefundApi from '@/api/businessDocuments/serviceChargeRefund'
    // 组件
    import ExportDialog from './ExportDialog'
    import ImportButton from '@/components/customizeFormItem/ImportButton'
    // 表格配置
    import smart_4 from '@/views/inventoryManagement/intelligentDevice/tableColumns/smart_4'
    import pop_smart_4 from '@/views/inventoryManagement/intelligentDevice/filterPopup/smart_4'
    import FilterSmart from '@/views/inventoryManagement/intelligentDevice/filter/index_1'

    export default {
        name: 'ConfigDialog',
        components: {
            pop_smart_4,
            FilterSmart,
            ImportButton,
            ExportDialog
        },
        props: {
            isEdit: { type: Boolean, default: false },
            visible: { type: Boolean, default: false },
            rowData: Object,
            billsData: Object
        },
        data() {
            return {
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: smart_4.columns,
                    options: {
                        height: '634px',
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        curRowKey: 'guidId',
                        mutiSelect: this.isEdit,
                        mutiSelectedKey: 'guidId'
                    }
                },
                importData: {},
                selectList: [],
                filterName: 'FilterSmart',
                filterPopupName: 'pop_smart_4',
                searchParam: {
                    listType: 1,
                    pageSize: 15,
                    pageIndex: 1,
                    productCategory: 'B16C3151-11D2-4364-8F45-63EFFFFCF424' // 智能设备
                },
                exportDialog: {
                    visible: false
                },
                activeRowData: null
            }
        },
        computed: {
            loading() {
                return this.tableData.options.loading
            }
        },
        watch: {
            'searchParam.pageSize'() {
                this.getList()
            },
            'searchParam.pageIndex'() {
                this.getList()
            }
        },
        mounted() {
            let { deviceIds, productId, serviceEndDate, sectionSalesType, originalOutContractId } = this.rowData
            let { sectionId } = this.billsData
            this.deviceIds = deviceIds
            this.importData = {
                sectionId,
                productId,
                serviceEndDate,
                sectionSalesType,
                originalOutContractId
            }
            this.getList()
        },
        methods: {
            // 请求列表数据
            async getList() {
                this.tableData.options.loading = true
                try {
                    let ids = this.deviceIds.filter(v => v.flag === 0).map(v => v.id)
                    if (ids.length) {
                        let res = await storageOutApi.getDeviceList({
                            ...this.searchParam,
                            selectDeviceIds: ids
                        })
                        this.tableData.list = res.data.records
                        this.tableData.total = res.data.total
                    } else {
                        this.tableData.list = []
                        this.tableData.total = 0
                    }
                } catch (err) {
                    console.log(err)
                }
                this.tableData.options.loading = false
            },
            // 筛选列表
            handleFilter() {
                if (this.searchParam.pageIndex !== 1) {
                    this.searchParam.pageIndex = 1
                } else {
                    this.getList()
                }
            },
            // 点击调入按钮时触发
            handleImport() {
                this.exportDialog = {
                    visible: true,
                    deviceIds: this.deviceIds
                }
            },
            // 点击调出按钮时触发
            handleExport() {
                if (this.selectList.length) {
                    this.selectList.forEach(item => {
                        let data = this.deviceIds.find(v => v.id === item.guidId)
                        if (data) {
                            data.flag = 1
                        }
                    })
                    this.selectList = []
                    this.getList()
                } else {
                    this.$message.warning('请至少选中一项！')
                }
            },
            // 点击提交按钮时触发
            handleSubmit() {
                let count = this.deviceIds.filter(v => v.flag === 0)
                if (count) {
                    this.$emit('change', this.deviceIds)
                    this.$emit('update:visible', false)
                } else {
                    this.$message.warning('请至少配置一台退费设备！')
                }
            },
            // 设备调入后触发
            handleExportChange(list) {
                list.forEach(item => {
                    let data = this.deviceIds.find(v => v.id === item.guidId)
                    if (data) {
                        data.flag = 0
                    }
                })
                this.getList()
            },
            // 下载导入模板
            handleDownloadMethod() {
                serviceChargeRefundApi.downloadTemplate()
            },
            // 导入成功时触发
            handleImportSuccess(data) {
                if (data.message) {
                    this.$message({
                        type: 'warning',
                        duration: 0,
                        showClose: true,
                        message: data.message
                    })
                }
                this.deviceIds.forEach(item => {
                    if (data.data.findIndex(v => v.guidId === item.id) > -1) {
                        item.flag = 0
                    }
                })
                this.handleFilter()
            },
            // 多选-选中表格行时触发
            handleSelectionChange(val) {
                this.selectList = val
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
