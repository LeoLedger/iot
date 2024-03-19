<!--
* @description 基础信息
* @author yc
!-->
<template>
    <div v-loading="loading">
        <el-collapse v-model="collapseValue" class="layou-collapse">
            <el-collapse-item name="1" disabled>
                <div slot="title" class="title">
                    <div class="text">基础信息</div>
                </div>
                <div class="body-wrap">
                    <BaseForm
                        ref="BaseForm"
                        :form-data="formData"
                        :is-edit="isEdit"
                        :is-create="isCreate"
                        :locked-props="lockedProps"
                        :extend-params="extendParams"
                        @data-change="handleDataChange"
                    />
                </div>
            </el-collapse-item>
            <el-collapse-item name="2" class="hide-arrow" disabled>
                <div slot="title" class="title">
                    <div class="text">抽检明细</div>
                    <template v-if="isEdit">
                        <ImportButton
                            :upload-data="uploadData"
                            :before-upload="handleBeforeUpload"
                            :download-method="handleDownloadMethod"
                            action="device-incoming-inspection/import"
                            class="filter-button"
                            type="primary"
                            template-name="导入模板.xlsx"
                            @success="handleImportSuccess"
                        />
                        <el-button
                            type="success"
                            size="mini"
                            icon="el-icon-plus"
                            style="margin-left: 10px;"
                            @click="handleAdd"
                        />
                    </template>
                </div>
                <div class="body-wrap">
                    <TableComponent
                        v-bind="tableData"
                        :page-index.sync="searchParam.pageIndex"
                        :page-size.sync="searchParam.pageSize"
                        empty-hide-table
                    >
                        <template slot="操作" slot-scope="{$index}">
                            <el-button
                                type="danger"
                                size="mini"
                                icon="el-icon-delete"
                                title="删除"
                                @click="handleDelete($index)"
                            />
                        </template>
                    </TableComponent>
                </div>
            </el-collapse-item>
        </el-collapse>
    </div>
</template>

<script>
    // API
    import materialTestingApi from '@/api/operationsManagement/materialTesting'
    // 方法
    import enums from '@/utils/enum'
    // 组件
    import BaseForm from './BaseForm'

    export default {
        name: 'BaseInfo',
        components: {
            BaseForm
        },
        props: {
            dataId: { type: [Number, String] },
            isEdit: { type: Boolean, default: false },
            lockedProps: { type: Array, default: () => [] },
            extendParams: { type: Object }
        },
        data() {
            return {
                error: [],
                loading: false,
                formData: {},
                dataList: [],
                tableData: {
                    total: 0,
                    list: [],
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'imei',
                            label: 'IMEI',
                            width: 200,
                            render: this.isEdit && ((h, { row, column }) => {
                                var key = column.prop
                                return (
                                    <el-input
                                        size='mini'
                                        type='text'
                                        value={row[key]}
                                        class={row._error.includes(key) ? 'error' : ''}
                                        placeholder={column.label}
                                        onBlur={() => { this.validate(false) }}
                                        onInput={res => { row[key] = res }}
                                    />
                                )
                            })
                        },
                        {
                            type: this.isEdit ? '' : 'status',
                            style: this.isEdit ? '' : 'block',
                            enums: enums.checkResult,
                            prop: 'checkResult',
                            label: '检测结果',
                            width: 120,
                            render: this.isEdit && ((h, { row, column }) => {
                                var key = column.prop
                                return (
                                    <dict-select
                                        size='mini'
                                        type='checkResult'
                                        value={row[key]}
                                        class={row._error.includes(key) ? 'error' : ''}
                                        placeholder='检测结果'
                                        onChange={res => {
                                            row[key] = res
                                            this.validate(false)
                                            this.updateBaseData()
                                        }}
                                    />
                                )
                            })
                        },
                        {
                            prop: 'remark',
                            label: '备注说明',
                            render: this.isEdit && ((h, { row, column }) => {
                                var key = column.prop
                                return (
                                    <el-input
                                        size='mini'
                                        type='text'
                                        value={row[key]}
                                        onInput={res => { row[key] = res }}
                                        placeholder={column.label}
                                    />
                                )
                            })
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: null,
                        maxHeight: null,
                        onePageHidePagination: true
                    },
                    // 列操作按钮
                    operates: {
                        width: 55,
                        fixed: 'right',
                        show: this.isEdit
                    }
                },
                searchParam: {
                    pageSize: 10,
                    pageIndex: 1
                },
                collapseValue: ['1', '2']
            }
        },
        computed: {
            isCreate() {
                return !this.dataId
            },
            uploadData() {
                let { productId, productTestType } = this.formData
                let { outType, approvalId } = this.extendParams || {}
                return {
                    outType,
                    productId,
                    approvalId,
                    productTestType
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
            let formData = {}
            this.lockedProps.forEach(key => {
                formData[key] = this.extendParams[key]
            })
            this.formData = formData
        },
        methods: {
            // 验证表单
            validate(message = true) {
                var pass = true
                this.dataList.forEach((item, index) => {
                    var error = [];
                    ['imei', 'checkResult'].forEach(key => {
                        if (item[key] === '') {
                            pass = false
                            error.push(key)
                        }
                    })
                    item._error = error
                })
                if (!pass && message) {
                    this.$message.warning('IMEI和检测结果不能为空')
                }
                return pass
            },
            // 点击提交按钮时触发
            async submit() {
                this.loading = true
                try {
                    let data = await this.$refs.BaseForm.submit()
                    let dataList = this.dataList
                    if (dataList.length) {
                        let res = await materialTestingApi.update({
                            ...this.formData,
                            ...data,
                            listInspectionDetail: dataList
                        })
                        if (!this.isCreate) {
                            // 获取最新的数据，出入库时需要更新列表
                            data = (await materialTestingApi.detail(this.dataId)).data
                        }
                        this.$notify({
                            title: '保存成功',
                            message: res.msg,
                            type: 'success',
                            duration: 2000
                        })
                        return data
                    } else {
                        this.$message.warning('检测明细不能为空！')
                    }
                } catch (e) {
                    console.log(e)
                }
                this.loading = false
                return Promise.reject()
            },
            // 获取基础信息
            async queryBaseInfo() {
                if (this.dataId) {
                    this.loading = true
                    let res = await materialTestingApi.detail(this.dataId)
                    this.dataList = res.data.listInspectionDetail.map(item => {
                        item._error = []
                        return item
                    })
                    this.formData = {
                        ...this.formData,
                        ...res.data
                    }
                    this.filterData()
                    this.loading = false
                }
            },
            // 筛选数据
            filterData() {
                let { pageSize, pageIndex } = this.searchParam
                let list = this.dataList
                this.tableData.total = list.length
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
            },
            // 更新表单数据
            updateBaseData() {
                let list = this.dataList
                this.formData = {
                    ...this.formData,
                    ...this.$refs.BaseForm.getFormData(),
                    count: list.length,
                    countInvalid: list.filter(v => v.checkResult === 1).length
                }
            },
            // 新增
            handleAdd() {
                this.dataList.splice(0, 0, {
                    imei: '',
                    checkResult: '',
                    remark: '',
                    _error: []
                })
                this.filterData()
                this.updateBaseData()
            },
            // 删除
            handleDelete(index) {
                this.dataList.splice(index, 1)
                this.filterData()
                this.updateBaseData()
            },
            // 点击导入按钮前触发
            handleBeforeUpload() {
                return this.$refs.BaseForm.validateField(['productCode', 'productTestType'])
            },
            // 基础表单数据改变时触发
            handleDataChange(data) {
                this.formData = {
                    ...this.formData,
                    ...data
                }
            },
            // 下载模板
            handleDownloadMethod() {
                materialTestingApi.downloadTemplate()
            },
            // 导入成功时触发
            handleImportSuccess(data) {
                this.$message({
                    type: 'success',
                    duration: 2000,
                    showClose: true,
                    message: '导入成功'
                })
                this.dataList = data.map(item => {
                    item._error = []
                    return item
                })
                this.filterData()
                this.updateBaseData()
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
