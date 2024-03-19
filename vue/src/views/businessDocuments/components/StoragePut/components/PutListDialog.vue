<!--
* @description 配置续费设备
* @author yc
!-->
<template>
    <div>
        <el-dialog
            v-if="visible"
            :visible="visible"
            :close-on-click-modal="false"
            title="产品入库清单"
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
                    <ImportButton
                        :before-upload="handleBeforeUpload"
                        :action="importAction"
                        :download-method="handleDownloadTemplate"
                        class="filter-button"
                        title="导入入库清单"
                        template-name="入库清单导入模板.xlsx"
                        @success="handleImportSuccess"
                    />
                    <el-button
                        v-waves
                        v-if="!isPaging"
                        :disabled="!tableData.total"
                        size="mini"
                        class="filter-button"
                        type="warning"
                        @click="handleExport"
                    >导出</el-button>
                    <el-button
                        v-waves
                        size="mini"
                        class="filter-button"
                        type="danger"
                        @click="handleDelete"
                    >删除</el-button>
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
                    <el-input
                        v-else-if="productCategory === 1"
                        v-model="searchParam.sim"
                        size="mini"
                        placeholder="SIM卡号"
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
    </div>
</template>

<script>
    // 方法
    import enums from '@/utils/enum'
    import { filterList } from '@/utils'
    // API
    import storagePutApi from '@/api/businessDocuments/storagePut'
    // 组件
    import ImportButton from '@/components/customizeFormItem/ImportButton'

    export default {
        name: 'PutListDialog',
        components: {
            ImportButton
        },
        props: {
            dataId: null,
            isEdit: { type: Boolean, default: false },
            visible: { type: Boolean, default: false },
            rowData: { type: Object },
            isCreate: { type: Boolean, default: false },
            extendParams: { type: Object }
        },
        data() {
            return {
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [],
                    options: {
                        height: '60vh',
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        curRowKey: '_index',
                        mutiSelect: this.isEdit,
                        mutiSelectedKey: '_index'
                    }
                },
                searchParam: {
                    sim: '',
                    imei: '',
                    pageSize: 15,
                    pageIndex: 1
                },
                importAction: '',
                selectList: [],
                isImportHandle: false,
                productCategory: 0,
                importDialogVisible: false,
                importDeviceListAction: storagePutApi.importDeviceList
            }
        },
        computed: {
            title() {
                return this.isEdit ? '配置续费设备' : '查看续费设备'
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
            rowData: {
                deep: true,
                immediate: true,
                handler(data) {
                    if (data) {
                        this.searchParam = {
                            ...this.searchParam,
                            productCategory: data.productCategory,
                            approvalDeviceInProdId: data.guidId
                        }
                        var category = enums.productCategoryId.find(item => item.id === data.productCategory)
                        if (category) {
                            this.productCategory = category.value
                        }
                        this.importAction = `approval-device-in/${data.productCode}/${this.dataId}/import`
                        this.handleImportSuccess(data.deviceInDeviceList)
                    }
                }
            },
            'searchParam.pageSize'() {
                this.filterData()
            },
            'searchParam.pageIndex'() {
                this.filterData()
            }
        },
        mounted() {
            var cellRender = (h, { row, column }) => {
                if (this.isEdit) {
                    var content = []
                    switch (column.prop) {
                    case 'sim':
                        switch (this.productCategory) {
                        case 0:
                            if (row.hasSim === false) {
                                content.push('SIM卡号不在库存中')
                            }
                            if (row.hasSimRepeat) {
                                content.push('SIM卡号已被关联')
                            }
                            break
                        case 1:
                            if (row.hasSimRepeat) {
                                content.push('SIM卡号已在库存中')
                            }
                            break
                        }
                        if (row.hasSimRepeatExcel) {
                            content.push('导入文件中存在相同的sim卡号')
                        }
                        break
                    case 'imei':
                        if (row.hasImeiRepeat) {
                            content.push('设备号已存在')
                        }
                        if (row.hasImeiRepeatExcel) {
                            content.push('导入文件中存在相同的imei号')
                        }
                        break
                    case 'psn':
                        if (row.hasPsnRepeat) {
                            content.push('psn号已存在')
                        }
                        break
                    case 'iccid':
                        if (row.hasIccidRepeat) {
                            content.push('ICCID已存在')
                        }
                        if (row.hasIccidRepeatExcel) {
                            content.push('导入文件中存在相同的iccid')
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
                    <span>{row[column.prop]}</span>
                )
            }
            // 表格配置
            this.TabelConfig = {
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
                    },
                    {
                        prop: 'packageCode',
                        label: '包装箱编号',
                        minWidth: 130
                    },
                    {
                        prop: 'sim',
                        label: 'SIM卡号',
                        minWidth: 155,
                        render: cellRender
                    },
                    {
                        prop: 'psn',
                        label: 'psn号',
                        minWidth: 155,
                        render: cellRender
                    },
                    {
                        type: 'date',
                        prop: 'warrantyStartDate',
                        label: '质保开始日期',
                        minWidth: 130
                    }
                ],
                // SIM卡
                sim: [
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
                        prop: 'iccid',
                        label: 'ICCID',
                        minWidth: 155,
                        render: cellRender
                    }
                ]
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
                if (this.isEdit) {
                    let { pageSize, pageIndex } = this.searchParam
                    var list = filterList(this.dataList, this.searchParam, [
                        { name: 'sim', type: 'string' },
                        { name: 'imei', type: 'string' }
                    ])
                    this.tableData.total = list.length
                    this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
                } else {
                    this.queryDeviceList()
                }
            },
            // 获取申请入库设备列表
            async queryDeviceList() {
                this.tableData.options.loading = true
                var res = await storagePutApi.getDeviceList({
                    ...this.searchParam,
                    approvalDeviceInProdId: this.rowData.guidId
                })
                this.tableData.list = res.data.records
                this.tableData.total = res.data.total
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
                if (this.dataList.find(item => item._error)) {
                    this.$message.warning('请先处理标红的设备后再试！')
                } else {
                    var { count, countInbound, countBounding } = this.rowData
                    if (this.dataList.length <= count - countInbound - countBounding) {
                        this.$emit('update:visible', false)
                        this.$emit('change', this.dataList)
                    } else {
                        this.$message.warning('申请入库数量不能大于采购数量-已入库数量-待入库数量，请删除部分设备后再试！')
                    }
                }
            },
            // 点击导出按钮时触发
            handleExport() {
                var data = { ...this.searchParam }
                data.pageSize = this.tableData.total
                storagePutApi.exportDeviceList(data)
            },
            // 点击删除按钮时触发
            handleDelete() {
                if (this.selectList.length) {
                    this.selectList.forEach(item => {
                        this.dataList.splice(this.dataList.indexOf(item), 1)
                    })
                    this.selectList = []
                    this.filterData()
                } else {
                    this.$message.warning('请至少选择一项')
                }
            },
            // 更新表格配置
            updateTabelConfig() {
                switch (this.productCategory) {
                case 0:
                    // 智能设备
                    this.tableData.columns = this.TabelConfig.intelligent
                    break
                case 1:
                    // SIM卡
                    this.tableData.columns = this.TabelConfig.sim
                    break
                }
            },
            // 导入成功时触发
            handleImportSuccess(data) {
                var productCode = this.rowData.productCode
                this.isImportHandle = true
                if (Array.isArray(data)) {
                    this.dataList = data.map((item, index) => {
                        item.productCode = productCode
                        item._index = index
                        return item
                    })
                }
                this.filterData()
            },
            // 点击下载模板按钮时触发
            handleDownloadTemplate() {
                storagePutApi.downloadTemplate(this.rowData.productCode)
            },
            // 多选-选中表格行时触发
            handleSelectionChange(val) {
                this.selectList = val
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
