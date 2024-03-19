<!--
* @description 维修费结算
* @author yc
!-->
<template>
    <div>
        <el-dialog
            :visible="visible"
            :close-on-click-modal="false"
            title="维修费结算"
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
                                :is-edit="isEdit"
                                disabled
                            />
                        </div>
                    </el-collapse-item>
                    <el-collapse-item name="2" class="hide-arrow flex" disabled>
                        <div slot="title" class="title">
                            <div class="text">结算详情</div>
                        </div>
                        <layout-col class="device-wrap">
                            <layout-filter
                                :table-columns.sync="columns"
                                :filter-model.sync="searchParam"
                                :filter-button="false"
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
                                        action="repair-bill-settle/import"
                                        class="filter-button"
                                        template-name="导入模板.xlsx"
                                        style="margin-left: 10px;"
                                        @success="handleImportSuccess"
                                    />
                                </template>
                                <template slot="table">
                                    <TableComponent
                                        ref="TableComponent"
                                        v-bind="tableData"
                                        :columns="columns"
                                        :page-index.sync="searchParam.pageIndex"
                                        :page-size.sync="searchParam.pageSize"
                                    >
                                        <template slot="操作" slot-scope="{row}">
                                            <el-dropdown trigger="click" size="small">
                                                <el-button
                                                    size="mini"
                                                    icon="el-icon-more"
                                                    title="操作"
                                                />
                                                <el-dropdown-menu slot="dropdown">
                                                    <div class="layout-dropdown-item" @click="handleDelete(row)">
                                                        <el-dropdown-item icon="el-icon-delete" divided>删除</el-dropdown-item>
                                                    </div>
                                                </el-dropdown-menu>
                                            </el-dropdown>
                                        </template>
                                    </TableComponent>
                                </template>
                            </layout-filter>
                        </layout-col>
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
            v-if="selectDialogDevice.visible"
            v-bind="selectDialogDevice"
            :visible.sync="selectDialogDevice.visible"
            title="选择维修费账单"
            @change="handleSelectDialogChange"
        />
    </div>
</template>

<script>
    // API
    import maintenanceBillApi from '@/api/operationsManagement/maintenanceBill'
    // 方法
    import enums from '@/utils/enum'
    import rigorous from '@/utils/rigorous'
    // 组件
    import BaseForm from './BaseForm'

    export default {
        name: 'ConfirmDialog',
        components: {
            BaseForm
        },
        props: {
            dataId: { type: [Number, String] },
            isEdit: { type: Boolean, default: false },
            visible: { type: Boolean, default: false }
        },
        data() {
            this.defaultParam = {
                pageSize: 15,
                pageIndex: 1
            }
            return {
                loading: false,
                formData: {
                    cost: 0,
                    labourCost: 0,
                    companyBearCost: 0,
                    enterpriseBearCost: 0
                },
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    options: {
                        rules: {
                            companyBearCost: {
                                validator: (rule, value, callback) => {
                                    if (value === void 0) {
                                        callback(new Error('公司承担费用必须等于维修费用'))
                                    }
                                    callback()
                                },
                                trigger: 'change'
                            },
                            labourCost: {
                                validator: (rule, value, callback) => {
                                    if (value === void 0) {
                                        callback(new Error('公司承担费用必须等于维修费用+人工费'))
                                    }
                                    callback()
                                },
                                trigger: 'change'
                            }
                        },
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: '100%',
                        showAsterisk: this.isEdit
                    },
                    operates: {
                        width: 55,
                        fixed: 'right',
                        show: this.isEdit
                    }
                },
                dataList: [],
                searchParam: {
                    ...this.defaultParam
                },
                collapseValue: ['1', '2'],
                selectDialogDevice: {
                    visible: false
                }
            }
        },
        computed: {
            columns() {
                let inputRender = (h, { row, column }) => {
                    return (
                        <el-input-number
                            value={row[column.prop]}
                            onInput={res => {
                                row[column.prop] = res
                                this.handleCostChange(column.prop)
                            }}
                            placeholder={column.label}
                            size='mini'
                            min={0}
                            controls-position='right'
                            style='width:100%;'
                        />
                    )
                }
                return [
                    {
                        prop: 'imei',
                        label: 'IMEI',
                        minWidth: 155
                    },
                    {
                        prop: 'productCode',
                        label: '产品编号',
                        width: 100
                    },
                    {
                        prop: 'repairCode',
                        label: '维修/寄修单号',
                        minWidth: 150,
                        idKey: 'repairBillId',
                        isClick: true,
                        dialogType: 'maintenanceBill'
                    },
                    {
                        type: 'status',
                        enums: enums.maintenanceBillStatus,
                        prop: 'status',
                        label: '状态',
                        width: 100
                    },
                    {
                        prop: 'supplierName',
                        label: '供应商',
                        minWidth: 210
                    },
                    {
                        prop: 'factoryHandlingWay',
                        label: '厂家处理方式',
                        width: 220,
                        render: this.isEdit && ((h, { row, column }) => {
                            return (
                                <el-input
                                    value={row[column.prop]}
                                    onInput={res => { row[column.prop] = res }}
                                    placeholder={column.label}
                                    size='mini'
                                    type='text'
                                />
                            )
                        })
                    },
                    {
                        type: 'money',
                        prop: 'labourCost',
                        label: '人工费（元）',
                        width: 140,
                        render: this.isEdit && ((h, { row, column }) => {
                            if (row.type === 0) {
                                return inputRender(h, { row, column })
                            }
                            return <span>- -</span>
                        })
                    },
                    {
                        type: 'money',
                        prop: 'cost',
                        label: '维修费用（元）',
                        width: 130,
                        dbProp: 'c_cost',
                        sortable: 'custom',
                        render: this.isEdit && inputRender
                    },
                    {
                        type: 'money',
                        prop: 'companyBearCost',
                        label: '公司承担（元）',
                        width: 130,
                        dbProp: 'c_company_bear_cost',
                        sortable: 'custom',
                        render: this.isEdit && inputRender
                    },
                    {
                        type: 'money',
                        prop: 'enterpriseBearCost',
                        label: '客户承担（元）',
                        width: 130,
                        dbProp: 'c_enterprise_bear_cost',
                        sortable: 'custom',
                        render: this.isEdit && inputRender
                    },
                    {
                        type: 'date',
                        prop: 'buildDate',
                        label: '生成日期',
                        width: 100,
                        dbProp: 'c_build_date',
                        sortable: 'custom'
                    },
                    {
                        prop: 'confirmationUserName',
                        label: '确认人',
                        width: 100
                    },
                    {
                        type: 'date',
                        prop: 'confirmationTime',
                        label: '确认时间',
                        width: 140,
                        format: 'YYYY-MM-DD HH:mm',
                        dbProp: 'c_confirmation_time',
                        sortable: 'custom'
                    }
                ]
            },
            uploadData() {
                return {
                    tempId: this.dataId
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
            // 验证表单
            validate() {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        // 找出验证不通过的列表
                        let dirtys = this.dataList.filter(item => {
                            let pass = true
                            let { cost, labourCost, companyBearCost } = item
                            switch (item.type) {
                            case 0:
                                if (companyBearCost !== cost + labourCost) {
                                    item.labourCost = void 0
                                    pass = false
                                }
                                break
                            case 1:
                                if (companyBearCost !== cost) {
                                    item.companyBearCost = void 0
                                    pass = false
                                }
                                break
                            }
                            return !pass
                        })
                        if (dirtys.length) {
                            // 计算出第一个验证不通过的数据的所在页码
                            let pageIndex = Math.max(Math.ceil((this.dataList.findIndex(v => v === dirtys[0]) + 1) / this.searchParam.pageSize), 1)
                            this.searchParam = {
                                ...this.defaultParam,
                                pageIndex
                            }
                            this.filterData()
                            this.$nextTick(() => {
                                this.$refs.TableComponent.validateRows(dirtys)
                            })
                            reject()
                        } else {
                            resolve(this.dataList)
                        }
                    }, 50)
                })
            },
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
                    var res = await maintenanceBillApi.settleDetail(this.dataId)
                    this.formData = {
                        ...this.formData,
                        ...res.data
                    }
                    this.dataList = res.data.repairBillList
                    this.filterData()
                    this.loading = false
                }
            },
            // 点击提交按钮时触发
            async handleSubmit(storageFlag = false) {
                this.loading = true
                try {
                    let repairBillList = await this.validate()
                    let formData = await this.$refs.BaseForm.submit()
                    console.log(formData)
                    let res = await maintenanceBillApi.updateSettle({
                        ...this.formData,
                        ...formData,
                        cost: rigorous.floatAdd.apply(null, repairBillList.map(v => v.cost || 0)),
                        labourCost: rigorous.floatAdd.apply(null, repairBillList.map(v => v.labourCost || 0)),
                        companyBearCost: rigorous.floatAdd.apply(null, repairBillList.map(v => v.companyBearCost || 0)),
                        enterpriseBearCost: rigorous.floatAdd.apply(null, repairBillList.map(v => v.enterpriseBearCost || 0)),
                        storageFlag,
                        repairBillList
                    })
                    this.$notify({
                        title: '保存成功',
                        message: res.msg,
                        type: 'success',
                        duration: 2000
                    })
                    this.$emit('update')
                    this.$emit('update:visible', false)
                } catch (err) {
                    this.loading = false
                    console.error(err)
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
            // 点击删除按钮时触发
            handleDelete(item) {
                this.dataList.splice(this.dataList.indexOf(item), 1)
                this.filterData()
            },
            // 点击调入按钮时触发
            handleImport() {
                this.selectDialogDevice = {
                    type: 'maintenanceBill',
                    value: this.dataList.map(v => ({ ...v, guidId: v.repairBillId })),
                    visible: true,
                    multiple: true,
                    extendParams: {
                        flag: false,
                        status: 0,
                        // excludeImei: this.dataList.map(v => v.imei),
                        lockedProps: ['status']
                    }
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
            handleCostChange() {
                this.formData = {
                    ...this.formData,
                    cost: rigorous.floatAdd.apply(null, this.dataList.map(v => rigorous.floatAdd(v.cost || 0, v.labourCost || 0))),
                    companyBearCost: rigorous.floatAdd.apply(null, this.dataList.map(v => v.companyBearCost || 0)),
                    enterpriseBearCost: rigorous.floatAdd.apply(null, this.dataList.map(v => v.enterpriseBearCost || 0))
                }
            },
            // 下载导入模板
            handleDownloadMethod() {
                maintenanceBillApi.downloadTemplate()
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
                this.dataList = data.filter(item => item.code === 0).map(item => item.data).map(item => {
                    return {
                        ...item,
                        cost: item.cost || 0,
                        labourCost: item.labourCost || 0,
                        companyBearCost: item.companyBearCost || 0,
                        enterpriseBearCost: item.enterpriseBearCost || 0,
                        id: void 0,
                        guidId: void 0,
                        repairBillId: item.guidId
                    }
                })
                this.filterData()
            },
            // 下载导入失败的列表文件
            handleDownloadFailure(id) {
                maintenanceBillApi.downloadFailureList(id)
            },
            // 选择维修费账单后触发
            handleSelectDialogChange(list) {
                this.dataList = list.map(item => {
                    return {
                        ...item,
                        cost: item.cost || 0,
                        labourCost: item.labourCost || 0,
                        companyBearCost: item.companyBearCost || 0,
                        enterpriseBearCost: item.enterpriseBearCost || 0,
                        id: void 0,
                        guidId: void 0,
                        repairBillId: item.guidId
                    }
                })
                this.filterData()
            }
        }
    }
</script>

<style lang='scss' scoped>
.container {
    height: 80vh;
    padding: 10px;
    .device-wrap {
        height: 100%;
        padding-bottom: 1px;
    }
}
</style>
