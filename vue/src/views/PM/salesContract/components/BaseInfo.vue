<!--
* @description 销售合同基础信息
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
                        :disabled="!isEdit"
                        :is-create="isCreate"
                        :history-renew="historyRenew"
                        :permission-props="permissionProps"
                        @update="handleUpdateData"
                        @update-product="handleUpdateProduct"
                        :is-import="isImport"
                    />
                </div>
            </el-collapse-item>
            <el-collapse-item name="2" class="hide-arrow" disabled>
                <div slot="title" class="title">
                    <div class="text">产品及服务内容</div>
                    <el-button
                        type="warning"
                        @click="export1"
                    >导出</el-button>
                    <ImportButton
                        v-if="isImport"
                        :before-upload="beforeUpload"
                        type="primary"
                        class="filter-button"
                        template-name="导入模板.xlsx"
                        :download-method="handleDownloadMethod"
                        title="导入"
                        :action="importAction"
                        :upload-data="uploadData"
                        @success="handleImportSuccess"
                    />
                    <el-button v-if="!isImport && isEdit && ![2,3].includes(formData.type) && checkPermissionProps('productList')" type="success" size="mini" icon="el-icon-plus" @click="handleAddProduct"/>
                </div>
                <div v-loading="proListLoading" class="body-wrap">
                    <ProductList
                        ref="ProductList"
                        :type="formData.type"
                        :is-edit="isEdit && checkPermissionProps('productList')"
                        :is-create="isCreate"
                        :form-data="formData"
                        :history-renew="historyRenew"
                        @change="handleProductListChange"
                    />
                </div>
            </el-collapse-item>
            <template v-if="otherInfo">
                <el-collapse-item name="3">
                    <div slot="title" class="title">
                        <div class="text">收款信息</div>
                    </div>
                    <div class="body-wrap">
                        <PaymentInfo
                            ref="PaymentInfo"
                            :form-data="formData"
                        />
                    </div>
                </el-collapse-item>
                <el-collapse-item name="4">
                    <div slot="title" class="title">
                        <div class="text">票据信息</div>
                    </div>
                    <div class="body-wrap">
                        <InvoiceInfo
                            ref="InvoiceInfo"
                            :form-data="formData"
                        />
                    </div>
                </el-collapse-item>
                <el-collapse-item name="5">
                    <div slot="title" class="title">
                        <div class="text">出库记录</div>
                    </div>
                    <div class="body-wrap">
                        <StorageOutRecord
                            ref="StorageOutRecord"
                            :data-id="dataId"
                        />
                    </div>
                </el-collapse-item>
            </template>
        </el-collapse>
    </div>
</template>

<script>
    // API
    import contractApi from '@/api/PM/contract'
    // 方法
    import moment from 'moment'
    import rigorous from '@/utils/rigorous'
    import { updateTreeId } from './utils'
    import { generateUUID, getPriceFormat } from '@/utils'
    // 组件
    import BaseForm from './BaseForm'
    import ProductList from './product/ProductList'
    import PaymentInfo from './PaymentInfo'
    import InvoiceInfo from './InvoiceInfo'
    import StorageOutRecord from './StorageOutRecord'
    import ImportButton from '@/components/customizeFormItem/ImportButton'

    export default {
        name: 'BaseInfo',
        components: {
            BaseForm,
            ProductList,
            PaymentInfo,
            InvoiceInfo,
            StorageOutRecord,
            ImportButton
        },
        props: {
            dataId: { type: [Number, String] },
            isEdit: { type: Boolean, default: false },
            otherInfo: { type: Boolean, default: false },
            historyRenew: Boolean,
            permissionProps: Array,
            isImport: Boolean
        },
        data() {
            return {
                uploadData: {},
                importAction: '/sales-contract/importXfDevice',
                loading: false,
                formData: {
                    type: this.historyRenew ? 3 : 0,
                    isStamp: 0,
                    productList: [],
                    version: generateUUID()
                },
                tabsGroupData: [
                    { label: '应收账款', value: 5604, border: true },
                    { label: '已账款', value: 5604, border: true },
                    { label: '收款进度', value: '90%', border: false }
                ],
                tabsGroupActive: 0,
                collapseValue: ['1', '2', '3', '4', '5'],
                proListLoading: false
            }
        },
        computed: {
            isCreate() {
                return !this.dataId
            }
        },
        watch: {
            dataId: {
                immediate: true,
                handler() {
                    this.queryBaseInfo()
                }
            },
            formData: {
                immediate: true,
                handler(data) {
                    if (data) {
                        var { type, version, sectionId, _period } = data
                        this.uploadData = {
                            version,
                            salesType: type,
                            sectionId,
                            _period
                        }
                        // this.updateTabelConfig()
                    }
                }
            }
        },
        mounted() {
        },
        methods: {
            async export1() {
                await contractApi.exportDevice({ contractId: this.formData.guidId })
            },
            // 导入弹窗加载前
            beforeUpload() {
                return new Promise((resolve, rejecte) => {
                    if (!this.uploadData._period || this.uploadData._period.length !== 2) {
                        this.$message.warning('请选择合同期限!')
                    } else if (!this.uploadData.sectionId) {
                        this.$message.warning('请选择标段!')
                    } else {
                        resolve()
                    }
                })
            },
            // 下载导入模板
            handleDownloadMethod() {
                contractApi.exportTemplateByPost({
                    flag: 1
                })
            },
            // 导入成功时触发
            handleImportSuccess(data) {
                if (data.errorMsg) {
                    this.$message({
                        message: data.errorMsg,
                        type: 'error',
                        duration: 0,
                        showClose: true
                    })
                }
                if (data.status) {
                    this.formData = {
                        ...this.formData,
                        productList: data.data
                    }
                }
            },
            // 验证产品列表
            validate(formData) {
                return new Promise((resolve, reject) => {
                    let list = this.$refs.ProductList.tableData.list
                    let errorMessage = ''
                    let productList = list
                    // 过滤掉未更改过任何数据的列表
                    if (!this.isImport) {
                        productList = productList.filter(v => v._isDirty)
                    }

                    if (!list.length) {
                        errorMessage = '产品及服务内容不能为空！'
                    } else if (!productList.length && !this.isImport) {
                        errorMessage = '请至少配置一项产品！'
                    } else if (formData.type === 3 && !this.isImport) {
                        productList = productList.filter(v => v.count)
                        if (this.isCreate && !productList.length) {
                            errorMessage = '请至少配置一台续费设备！'
                        } else {
                            let index = productList.findIndex(item => {
                                let date1 = moment(item.endDateOrigin)
                                let date2 = moment(item.endDate)
                                if (date1.isValid() && date2.isValid()) {
                                    return !date1.isBefore(date2)
                                }
                            })
                            if (index > -1) {
                                errorMessage = `第${index + 1}行产品的续费日期不能早于原服务日期，请删除该产品或修改合同期限后再试！`
                            }
                        }
                    }
                    if (errorMessage) {
                        this.$message.warning(errorMessage)
                        reject()
                    } else {
                        resolve(productList)
                    }
                })
            },
            // 点击提交按钮时触发
            async submit() {
                this.loading = true
                try {
                    let data = await this.$refs.BaseForm.submit()
                    let productList = await this.validate(data)
                    console.log(productList, 'productList')
                    if (this.historyRenew) {
                        await contractApi.updateHistory({
                            ...data,
                            productList
                        })
                    } else {
                        await contractApi.update({
                            ...data,
                            productList
                        })
                    }
                    this.getCanApprovalCount()
                    return this.$notify({
                        title: '保存成功',
                        message: '成功',
                        type: 'success',
                        duration: 2000
                    })
                } catch (err) {
                    console.error(err)
                }
                this.loading = false
                return Promise.reject()
            },
            // 获取基础信息
            async queryBaseInfo() {
                if (this.dataId) {
                    this.loading = true
                    let { data } = await contractApi.detail(this.dataId)
                    let _period = []
                    if (data.startDate && data.endDate) {
                        _period = [data.startDate, data.endDate]
                    }
                    this.formData = {
                        ...data,
                        productList: data.productList.map(item => {
                            updateTreeId(item)
                            item._isDirty = true
                            return item
                        }),
                        _period,
                        _amount: getPriceFormat(data.amount)
                    }
                    this.$emit('update', this.formData)
                    this.loading = false
                }
            },
            // 获取产品及服务内容列表
            async queryProList() {
                let { type, version, sectionId, sectionIds, signedDate } = this.formData
                sectionIds = sectionIds || []
                // 只有补购、续费才请求
                if ([2, 3].includes(type) && (sectionId || sectionIds.length)) {
                    this.proListLoading = true
                    let res
                    if (this.historyRenew) {
                        res = await contractApi.getHistoryProList({
                            version,
                            salesType: type,
                            sectionIds
                        })
                        if (type === 3) {
                            // 初始化续费设备列表
                            await contractApi.generateDeviceList({
                                version,
                                sectionIds
                            })
                        }
                    } else {
                        res = await contractApi.getProList({
                            version,
                            salesType: type,
                            sectionId
                        })
                        if (type === 3) {
                            // 初始化续费设备列表
                            await contractApi.generateDeviceList({
                                version,
                                sectionId
                            })
                        }
                    }
                    this.formData = {
                        ...this.formData,
                        productList: (res.data || []).map(item => {
                            if (type === 3) {
                                // 合同类型为续费时，设置count等于原数量
                                item.count = item.originCount
                                // 设置续费时间为签订日期
                                item.endDate = signedDate
                            } else {
                                updateTreeId(item)
                            }
                            return item
                        })
                    }
                    this.proListLoading = false
                }
            },
            // 点击添加产品按钮时触发
            handleAddProduct() {
                this.$refs.ProductList.handleUpdate()
            },
            // 更新formData
            handleUpdateData(data) {
                this.formData = {
                    ...this.formData,
                    ...data
                }
            },
            // 更新产品及服务内容列表
            async handleUpdateProduct(data) {
                this.formData = {
                    ...this.formData,
                    ...data,
                    productList: []
                }
                // 新增时需要根据合同类型请求产品及服务内容列表  导入时不请求
                if (this.isCreate && !this.isImport) {
                    this.queryProList()
                }
                if (this.isImport) {
                    let { version, sectionId } = this.formData
                    // 初始化续费设备列表
                    await contractApi.generateDeviceList({
                        version,
                        sectionId
                    })
                }
            },
            // 产品列表改变时触发
            handleProductListChange(list) {
                this.formData = {
                    ...this.formData,
                    ...this.$refs.BaseForm.getFormData(),
                    _amount: getPriceFormat(list.reduce((t, v) => {
                        return rigorous.floatAdd(t, v.unitPriceSalesTotal || 0, v.unitPriceDepositTotal || 0, v.unitPriceInstallTotal || 0, v.unitPriceServicesTotal || 0)
                    }, 0)),
                    productList: list
                }
            },
            // 点击选项卡组合时触发
            handleTabsGroupChange(data, index) {
                if (data.border) {
                    this.tabsGroupActive = index
                }
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
