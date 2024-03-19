<!--
* @description 配置续费设备
* @author yc
!-->
<template>
    <div>
        <el-dialog
            v-if="visible"
            :title="title"
            :visible="visible"
            :close-on-click-modal="false"
            width="900px"
            append-to-body
            @close="$emit('update:visible', false)"
        >
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
                        type="success"
                        @click="handleImport"
                    >调入</el-button>
                    <el-button
                        v-waves
                        size="mini"
                        class="filter-button"
                        type="warning"
                        @click="handleExport"
                    >调出</el-button>
                    <ImportButton
                        :upload-data="uploadData"
                        :download-method="handleDownloadMethod"
                        action="sales-contract/import"
                        class="filter-button"
                        template-name="导入模板.xlsx"
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
                        ref="TableComponent"
                        v-bind="tableData"
                        :selected-list="selectList"
                        :page-index.sync="searchParam.pageIndex"
                        :page-size.sync="searchParam.pageSize"
                        @handleSelectionChange="handleSelectionChange"
                    />
                </template>
            </layout-filter>
            <span v-if="isEdit" slot="footer">
                <el-button :loading="loading" size="mini" @click="$emit('update:visible', false)">取 消</el-button>
                <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit">保 存</el-button>
            </span>
        </el-dialog>
        <!-- 调入续费设备 -->
        <ImportDevice
            v-bind="importDevice"
            :visible.sync="importDevice.visible"
            @change="handelImportChange"
        />
    </div>
</template>

<script>
    // 方法
    import enums from '@/utils/enum'
    import { filterList } from '@/utils'
    // API
    import contractApi from '@/api/PM/contract'
    // 组件
    import ImportDevice from './ImportDevice'

    export default {
        name: 'RenewDevice',
        components: {
            ImportDevice
        },
        props: {
            isEdit: { type: Boolean, default: false },
            visible: { type: Boolean, default: false },
            rowData: Object,
            extendParams: Object
        },
        data() {
            return {
                dataList: [],
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            minWidth: 155,
                            disabled: true
                        },
                        {
                            prop: 'imei',
                            label: 'IMEI',
                            minWidth: 180,
                            disabled: true
                        },
                        {
                            prop: 'sim',
                            label: 'SIM卡号',
                            width: 140
                        },
                        {
                            type: 'status',
                            enums: enums.deviceStatus,
                            prop: 'unitStatus',
                            label: '设备状态',
                            width: 100
                        },
                        {
                            type: 'date',
                            prop: 'serviceEndDate',
                            label: '到期时间',
                            width: 130
                        }
                    ],
                    options: {
                        height: '60vh',
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        curRowKey: 'id',
                        mutiSelect: this.isEdit,
                        mutiSelectedKey: 'id'
                    }
                },
                searchParam: {
                    imei: '',
                    pageSize: 15,
                    pageIndex: 1
                },
                selectList: [],
                importDevice: {
                    visible: false
                }
            }
        },
        computed: {
            title() {
                return this.isEdit ? '配置续费设备' : '查看续费设备'
            },
            loading() {
                return this.tableData.options.loading
            },
            uploadData() {
                let { guidId, salesType, productId } = this.rowData
                return {
                    salesType,
                    productId,
                    contractProductId: guidId,
                    ...this.extendParams
                }
            }
        },
        watch: {
            'searchParam.pageSize'() {
                this.filterData()
            },
            'searchParam.pageIndex'() {
                this.filterData()
            }
        },
        mounted() {
            let { deviceList } = this.rowData
            if (this.isEdit) {
                this.dataList = deviceList.map(v => v)
                this.filterData()
            } else {
                this.searchParam = {
                    ...this.searchParam,
                    ...this.extendParams
                }
                this.getList()
            }
        },
        methods: {
            // 筛选数据
            filterData() {
                var { pageSize, pageIndex } = this.searchParam
                var list = filterList(this.dataList.filter(item => item.calloutFlag === 0), this.searchParam, [
                    { name: 'imei', type: 'string' }
                ])
                this.tableData.total = list.length
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
            },
            // 请求列表数据
            async getList() {
                this.tableData.options.loading = true
                try {
                    var res = await contractApi.getRenewDevice({
                        ...this.searchParam,
                        pageSize: -1
                    })
                    this.dataList = res.data.records
                    this.filterData()
                } catch (err) {
                    console.log(err)
                }
                this.tableData.options.loading = false
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
                let count = this.dataList.filter(v => v.calloutFlag === 0).length
                if (count) {
                    this.$emit('update:visible', false)
                    this.$emit('change', this.dataList)
                } else {
                    this.$message.warning('请至少调入一台设备')
                }
            },
            // 点击调入按钮时触发
            handleImport() {
                this.importDevice = {
                    visible: true,
                    deviceList: this.dataList
                }
            },
            // 点击调出按钮时触发
            handleExport() {
                if (this.selectList.length) {
                    this.selectList.forEach(item => {
                        item.calloutFlag = 1
                    })
                    this.selectList = []
                    this.filterData()
                } else {
                    this.$message.warning('请至少选择一项')
                }
            },
            // 调入成功时触发
            handelImportChange(list) {
                list.forEach(item => {
                    item.calloutFlag = 0
                })
                this.handleFilter()
            },
            // 下载导入模板
            handleDownloadMethod() {
                // contractApi.export({
                //     flag: 1
                // })
                contractApi.exportTemplateByPost({
                    flag: 1
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
                    let data = this.dataList.find(v => v.deviceId === item.deviceId)
                    if (data) {
                        data.calloutFlag = 0
                    }
                })
                this.handleFilter()
            },
            // 下载导入失败的列表文件
            handleDownloadFailure(batchId) {
                contractApi.downloadFailureList({
                    batchId
                })
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
