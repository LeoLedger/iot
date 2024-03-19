<!--
* @description 延保设备清单
* @author yc
!-->
<template>
    <div>
        <el-dialog
            v-if="visible"
            :visible="visible"
            :close-on-click-modal="!isEdit"
            title="延保设备清单"
            width="860px"
            append-to-body
            @close="$emit('update:visible', false)"
        >
            <PublicTabel
                ref="PublicTabel"
                :is-edit="isEdit"
                :data-list="dataList"
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
                    >导出</el-button>
                    <el-button
                        v-waves
                        size="mini"
                        class="filter-button"
                        type="danger"
                        @click="handleDelete"
                    >剔除</el-button>
                    <ImportButton
                        :upload-data="importData"
                        :download-method="handleDownloadMethod"
                        action="approval-extend/import"
                        class="filter-button"
                        template-name="导入模板.xlsx"
                        @success="handleImportSuccess"
                    />
                </template>
            </PublicTabel>
            <span v-if="isEdit" slot="footer">
                <el-button :loading="loading" size="mini" @click="$emit('update:visible', false)">取 消</el-button>
                <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit">保 存</el-button>
            </span>
        </el-dialog>
        <!-- 选择出库设备 -->
        <ExportList
            :visible.sync="exportListDialogVisible"
            :row-data="rowData"
            :bills-data="billsData"
            :excludes="dataList"
            :is-create="isCreate"
            @update="handleExportUpdate"
        />
    </div>
</template>

<script>
    // 方法
    // API
    import deviceExtendEarrantyApi from '@/api/businessDocuments/deviceExtendEarranty'
    // 组件
    import ExportList from './ExportList'
    import PublicTabel from './PublicTabel'
    import ImportButton from '@/components/customizeFormItem/ImportButton'

    export default {
        name: 'DeviceList',
        components: {
            ExportList,
            PublicTabel,
            ImportButton
        },
        props: {
            isEdit: { type: Boolean, default: false },
            visible: { type: Boolean, default: false },
            rowData: { type: Object, required: true },
            billsData: { type: Object, required: true },
            isCreate: { type: Boolean, default: false }
        },
        data() {
            return {
                loading: false,
                dataList: [],
                importData: {},
                exportListDialogVisible: false
            }
        },
        watch: {
            rowData: {
                immediate: true,
                handler(data) {
                    if (data) {
                        this.dataList = (data.deviceList || []).map(v => v)
                    }
                }
            }
        },
        mounted() {
            this.importData = {
                productId: this.rowData.productId,
                supplierId: this.billsData.purchaseSupplierId
            }
        },
        methods: {
            // 点击提交按钮时触发
            handleSubmit() {
                var list = this.$refs.PublicTabel.dataList
                if (list.length) {
                    this.$emit('update', list)
                    this.$emit('update:visible', false)
                } else {
                    this.$message.warning('设备数量不能小于0！')
                }
            },
            // 点击调入按钮时触发
            handleImport() {
                this.exportListDialogVisible = true
            },
            // 点击导出按钮时触发
            handleExport() {
                this.$refs.PublicTabel.handleExport()
            },
            // 点击剔除按钮时触发
            handleDelete() {
                this.dataList = this.$refs.PublicTabel.handleDelete()
            },
            // 调入设备时触发
            handleExportUpdate(list) {
                this.dataList = [...list, ...this.dataList]
            },
            // 下载导入模板
            handleDownloadMethod() {
                deviceExtendEarrantyApi.export({
                    flag: 1
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
                let messageNode = `<p style="margin-bottom: 4px;">导入成功${succeed}条数据，导入失败${failure}条数据</p>`
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
                let list = data.filter(v => v.code === 0).map(v => v.data).filter(item => {
                    return this.dataList.findIndex(v => v.deviceId === item.deviceId) === -1
                })
                this.dataList = list.concat(this.dataList)
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
