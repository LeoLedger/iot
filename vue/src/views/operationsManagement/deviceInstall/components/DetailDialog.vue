<!--
* @description 合同详情
* @author yc
!-->
<template>
    <div>
        <el-dialog
            :visible="visible"
            title="设备安装管理"
            width="800px"
            class="not-padding"
            append-to-body
            @close="$emit('update:visible', false)"
        >
            <div v-loading="loading" class="detail-wrap">
                <el-tabs v-model="tabActiveName" class="layout-tabs">
                    <el-tab-pane name="1" label="单据信息">
                        <div class="container">
                            <el-collapse v-model="collapseValue" class="layou-collapse">
                                <el-collapse-item name="1" disabled>
                                    <div slot="title" class="title">
                                        <div class="text">基础信息</div>
                                    </div>
                                    <div class="body-wrap">
                                        <BaseForm
                                            ref="BaseForm"
                                            :form-data="formData"
                                        />
                                    </div>
                                </el-collapse-item>
                                <el-collapse-item name="2" disabled>
                                    <div slot="title" class="title">
                                        <div class="text">申请安装清单</div>
                                    </div>
                                    <div class="body-wrap">
                                        <TableComponent
                                            ref="TableComponent"
                                            v-bind="tableData"
                                            :page-index.sync="publicParam.pageIndex"
                                            :page-size.sync="publicParam.pageSize"
                                            empty-hide-table
                                        />
                                    </div>
                                </el-collapse-item>
                            </el-collapse>
                        </div>
                    </el-tab-pane>
                    <el-tab-pane name="2" label="已安装设备明细">
                        <div class="container">
                            <DeviceList
                                ref="DeviceList"
                                :extend-params="deviceListParams"
                            />
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </div>
        </el-dialog>
        <DeviceListDialog
            v-bind="deviceListDialog"
            :visible.sync="deviceListDialog.visible"
        />
    </div>
</template>

<script>
    // API
    import deviceInstallApi from '@/api/operationsManagement/deviceInstall'
    // 方法
    // 组件
    import BaseForm from './BaseForm'
    import DeviceList from '../DeviceList'
    import DeviceListDialog from './DeviceListDialog'

    export default {
        name: 'DetailDialog',
        components: {
            BaseForm,
            DeviceList,
            DeviceListDialog
        },
        props: {
            visible: { type: Boolean, default: false },
            dataId: { type: [Number, String] }
        },
        data() {
            return {
                loading: false,
                formData: {},
                dataList: [],
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'contractCode',
                            label: '合同编号',
                            minWidth: 155,
                            idKey: 'contractId',
                            isClick: true,
                            dialogType: 'salesContract'
                        },
                        {
                            prop: 'customerName',
                            label: '企业',
                            minWidth: 200
                        },
                        {
                            label: '标段',
                            prop: 'sectionName',
                            minWidth: 155
                        },
                        {
                            prop: 'count',
                            label: '申请安装数量',
                            width: 100
                        },
                        {
                            prop: 'installCount',
                            label: '安装完成数量',
                            width: 100,
                            isCopy: false,
                            isClick: true,
                            onClick: (data) => {
                                this.deviceListDialog = {
                                    visible: true,
                                    extendParams: {
                                        installId: this.formData.guidId,
                                        installListId: data.guidId
                                    }
                                }
                            }
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: null,
                        maxHeight: null,
                        showAsterisk: this.isEdit,
                        onePageHidePagination: true
                    }
                },
                publicParam: {
                    pageSize: 10,
                    pageIndex: 1
                },
                tabActiveName: '1',
                collapseValue: ['1', '2'],
                deviceListDialog: {
                    visible: false,
                    extendParams: {}
                }
            }
        },
        computed: {
            deviceListParams() {
                if (this.formData.guidId) {
                    return {
                        installId: this.formData.guidId
                    }
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
            'publicParam.pageSize'() {
                this.filterData()
            },
            'publicParam.pageIndex'() {
                this.filterData()
            }
        },
        mounted() {
        },
        methods: {
            // 筛选数据
            filterData() {
                var pageSize = this.publicParam.pageSize
                var pageIndex = this.publicParam.pageIndex
                var list = this.dataList || []
                this.tableData.total = list.length
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
            },
            // 获取基础信息
            async queryBaseInfo() {
                if (this.dataId) {
                    this.loading = true
                    var res = await deviceInstallApi.detail(this.dataId)
                    this.formData = {
                        ...this.formData,
                        ...res.data
                    }
                    this.dataList = res.data.deviceInstallListDetail || []
                    this.filterData()
                    this.loading = false
                }
            }
        }
    }
</script>

<style lang='scss' scoped>
.detail-wrap {
    padding: 0 10px 10px;
    .container {
        height: 70vh;
        overflow: auto;
    }
}
</style>
