<!--
* @description 维修费账单详情
* @author yc
!-->
<template>
    <div>
        <el-dialog
            :visible="visible"
            :close-on-click-modal="false"
            title="维修费账单"
            width="1300px"
            class="not-padding"
            append-to-body
            @close="$emit('update:visible', false)"
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
                                disabled
                            />
                        </div>
                    </el-collapse-item>
                    <el-collapse-item name="2" class="hide-arrow flex" disabled>
                        <div slot="title" class="title">
                            <div class="text">账单详情</div>
                        </div>
                        <layout-col class="device-wrap">
                            <layout-row auto not-flex class="body-wrap">
                                <TableComponent
                                    ref="TableComponent"
                                    v-bind="tableData"
                                    :page-index.sync="searchParam.pageIndex"
                                    :page-size.sync="searchParam.pageSize"
                                />
                            </layout-row>
                        </layout-col>
                    </el-collapse-item>
                </el-collapse>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    // API
    import maintenanceBillApi from '@/api/operationsManagement/maintenanceBill'
    // 方法
    import rigorous from '@/utils/rigorous'
    import peopleColumns from '../../columns/peopleColumns'
    import vehicleColumns from '../../columns/vehicleColumns'
    // 组件
    import BaseForm from './BaseForm'

    export default {
        name: 'ConfirmDialog',
        components: {
            BaseForm
        },
        props: {
            visible: { type: Boolean, default: false },
            dataId: { type: [Number, String] }
        },
        data() {
            return {
                isEdit: false,
                loading: false,
                formData: {},
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [],
                    options: {
                        rules: {
                            companyBearCost: { required: true, message: '请输入公司承担费用', trigger: 'change' },
                            enterpriseBearCost: { required: true, message: '请输入企业承担费用', trigger: 'change' }
                        },
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: '100%',
                        showAsterisk: this.isEdit
                    }
                },
                dataList: [],
                searchParam: {
                    pageSize: 10,
                    pageIndex: 1
                },
                collapseValue: ['1', '2']
            }
        },
        computed: {
        },
        watch: {
            dataId: {
                immediate: true,
                handler() {
                    this.queryBaseInfo()
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
        },
        methods: {
            // 筛选数据
            filterData() {
                var pageSize = this.searchParam.pageSize
                var pageIndex = this.searchParam.pageIndex
                var list = this.dataList || []
                this.tableData.total = list.length
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
            },
            // 获取基础信息
            async queryBaseInfo() {
                if (this.dataId) {
                    this.loading = true
                    var res = await maintenanceBillApi.detail(this.dataId)
                    var { type, listRepairBillDetail } = res.data
                    this.formData = {
                        ...this.formData,
                        ...res.data,
                        cost: listRepairBillDetail.reduce((a, b) => {
                            switch (type) {
                            case 0:
                                return rigorous.floatAdd(a, b.labourCost, b.cost)
                            case 1:
                                return rigorous.floatAdd(a, b.cost)
                            }
                        }, 0)
                    }
                    this.dataList = res.data.listRepairBillDetail
                    this.filterData()
                    this.updateTabelConfig()
                    this.loading = false
                }
            },
            // 更新表格配置
            updateTabelConfig() {
                // this.isEdit = this.formData.status === 0
                this.tableData.columns = ([vehicleColumns, peopleColumns][this.formData.type]).get.call(this)
                if (this.formData.type === 1) {
                    this.$set(this.tableData.columns.find(v => v.prop === 'enterpriseBearCost'), 'visible', this.formData.sendRevisedType !== 1)
                }
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
            // 费用改变时触发
            handleCostChange(prop) {
                switch (prop) {
                case 'companyBearCost':
                    // 公司承担费用
                    this.formData.companyBearCost = this.dataList.reduce((a, b) => {
                        return rigorous.floatAdd(a, b.companyBearCost)
                    }, 0)
                    break
                case 'enterpriseBearCost':
                    // 企业承担费用
                    this.formData.enterpriseBearCost = this.dataList.reduce((a, b) => {
                        return rigorous.floatAdd(a, b.enterpriseBearCost)
                    }, 0)
                    break
                }
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
