<!--
* @description 配置补购设备
* @author yc
!-->
<template>
    <div>
        <el-dialog
            v-if="visible"
            :visible="visible"
            :close-on-click-modal="false"
            title="配置丢失设备"
            width="800px"
            append-to-body
            @close="$emit('update:visible', false)"
        >
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
                        :action="importAction"
                        :upload-data="importData"
                        :download-method="handleDownloadMethod"
                        class="filter-button"
                        title="导入出库清单"
                        template-name="出库清单导入模板.xlsx"
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
                    <el-input
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
            <span slot="footer">
                <el-button :loading="loading" size="mini" @click="$emit('update:visible', false)">取 消</el-button>
                <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit">保 存</el-button>
            </span>
        </el-dialog>
        <!-- 设备选择 -->
        <SelectDialog
            v-if="selectDialog.visible"
            v-bind="selectDialog"
            :visible.sync="selectDialog.visible"
            title="选择已丢失设备"
            multiple
            @change="handleDeviceChange"
        />
    </div>
</template>

<script>
    // 方法
    import { filterList } from '@/utils'
    // API
    import storageOutApi from '@/api/businessDocuments/storageOut'
    // 组件
    import SelectDialog from '@/components/SelectDialog'
    import ImportButton from '@/components/customizeFormItem/ImportButton'

    export default {
        name: 'BuyInPicker',
        components: {
            SelectDialog,
            ImportButton
        },
        props: {
            isEdit: { type: Boolean, default: false },
            visible: { type: Boolean, default: false },
            rowData: { type: Object, required: true },
            excludes: { type: Array },
            contract: { type: Object, required: true },
            isCreate: { type: Boolean, default: false },
            extendParams: { type: Object },
            selectDeviceIds: { type: Array, default: () => [] }
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
                            minWidth: 155
                        },
                        {
                            prop: 'imei',
                            label: 'IMEI',
                            minWidth: 155
                        },
                        {
                            prop: 'sim',
                            label: 'SIM卡号',
                            minWidth: 155
                        }
                    ],
                    options: {
                        height: '60vh',
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        curRowKey: 'guidId',
                        mutiSelect: true,
                        mutiSelectedKey: 'guidId'
                    }
                },
                importData: {},
                selectList: [],
                searchParam: {
                    pageSize: 15,
                    pageIndex: 1
                },
                selectDialog: {
                    visible: false
                },
                importAction: 'approval-device-out/loss-device/import',
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
                this.filterData()
            },
            'searchParam.pageIndex'() {
                this.filterData()
            }
        },
        mounted() {
            this.importData = {
                productId: this.rowData.productId,
                sectionId: this.contract.sectionId
            }
            this.dataList = this.rowData.lostList || []
            this.handleFilter()
        },
        methods: {
            // 筛选数据
            filterData() {
                let list = []
                let { pageSize, pageIndex } = this.searchParam
                list = filterList(this.dataList, this.searchParam, [
                    { name: 'sim', type: 'string' },
                    { name: 'imei', type: 'string' }
                ])
                this.tableData.total = list.length
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
            },
            // 筛选列表
            handleFilter() {
                if (this.searchParam.pageIndex !== 1) {
                    this.searchParam.pageIndex = 1
                } else {
                    this.filterData()
                }
            },
            // 点击调入按钮时触发
            handleImport() {
                let { count, countEd, countIng, productId, productCode, productCategoryId } = this.rowData
                let maxCount = count - countEd - countIng - this.dataList.length
                if (maxCount > 0) {
                    this.selectDialog = {
                        type: 'device',
                        visible: true,
                        maxCount,
                        multiple: true,
                        overageMessage: `已丢失设备数量不能大于补购数量-已出库-出库中的数量（最多可选${maxCount}项）`,
                        extendParams: {
                            sectionId: this.contract.sectionId, // 标段id
                            productId, // 产品id
                            unitStatus: 1, // 设备状态
                            productCode,
                            productCategory: productCategoryId, // 产品种类
                            warehousesId: 'bc5fe3a9-5b92-4aad-b7fe-acc62dcc82de', // 仓库id
                            typeId: this.getWarehousesSpaceType(0, '在运营'), // 仓位id
                            selectDeviceIds: this.dataList.map(v => v.guidId).concat(this.selectDeviceIds),
                            lockedProps: ['productCode', 'sectionId']
                        }
                    }
                } else {
                    this.$message.warning('已达最大补购数量，请调出部分设备后再试！')
                }
            },
            // 点击调出按钮时触发
            handleExport() {
                if (this.selectList.length) {
                    this.selectList.forEach(item => {
                        this.dataList.splice(this.dataList.indexOf(item), 1)
                    })
                    this.selectList = []
                    this.handleFilter()
                } else {
                    this.$message.warning('请至少选中一项！')
                }
            },
            // 点击提交按钮时触发
            handleSubmit() {
                this.$emit('change', this.dataList)
                this.$emit('update:visible', false)
            },
            // 选择设备后触发
            handleDeviceChange(list) {
                this.dataList = this.dataList.concat(list)
                this.selectList = []
                this.handleFilter()
            },
            // 下载导入模板
            handleDownloadMethod() {
                storageOutApi.downloadTemplate({
                    category: this.rowData.productCategoryId
                })
            },
            // 导入成功时触发
            handleImportSuccess(data) {
                let { count, countEd, countIng } = this.rowData
                let index = 0
                let maxCount = count - countEd - countIng - this.dataList.length
                let failure = data.reduce((a, b) => {
                    if (b.code > 0) {
                        return a + 1
                    } else if (this.dataList.findIndex(v => v.guidId === b.data.guidId) > -1) {
                        b.code = 1
                        b.errorMsg = '设备已在列表中'
                        return a + 1
                    } else if (this.selectDeviceIds.findIndex(v => v === b.data.guidId) > -1) {
                        b.code = 1
                        b.errorMsg = '设备已被该产品的其他销售模式添加'
                        return a + 1
                    } else if (index >= maxCount) {
                        b.code = 1
                        b.errorMsg = '已达最大补购数量'
                        return a + 1
                    }
                    index += 1
                    return a
                }, 0)
                var succeed = data.length - failure
                var messageNode = `<p style="margin-bottom: 4px;">导入成功${succeed}条数据，导入失败${failure}条数据</p>`
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
                this.dataList = data.filter(item => item.code === 0).map(item => item.data).concat(this.dataList)
                this.selectList = []
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
