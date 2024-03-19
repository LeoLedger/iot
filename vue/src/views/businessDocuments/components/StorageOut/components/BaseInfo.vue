<!--
* @description 基础信息表单
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
                        :today="today"
                        :is-edit="isEdit"
                        :is-create="isCreate"
                        :form-data="formData"
                        :is-approval="isApproval"
                        :process-index="processIndex"
                        @change="handleFormChange"
                        @out-type-change="handleOutTypeChange"
                        @contract-change="queryContractInfo"
                    />
                </div>
            </el-collapse-item>
            <el-collapse-item name="2" disabled>
                <div slot="title" class="title">
                    <div class="text">出库产品</div>
                </div>
                <div class="body-wrap">
                    <TableComponent
                        v-bind="tableData"
                        empty-hide-table
                    >
                        <template v-if="!row._isBom" slot="操作" slot-scope="{row}">
                            <el-button
                                type="primary"
                                size="mini"
                                icon="el-icon-setting"
                                style="height: 28px"
                                @click="handleConfigButton(row)"
                            />
                        </template>
                    </TableComponent>
                </div>
            </el-collapse-item>
            <el-collapse-item v-if="showProductTest" name="3" disabled>
                <div slot="title" class="title">
                    <div class="text">领料批次检测</div>
                    <el-button v-if="processIndex === 3 && isApproval" type="success" size="mini" icon="el-icon-plus" @click="handleProductTest"/>
                </div>
                <div class="body-wrap">
                    <ProductTest
                        ref="ProductTest"
                        :is-edit="processIndex === 3"
                        :form-data="formData"
                        @update="$emit('update:jsonData', $event)"
                    />
                </div>
            </el-collapse-item>
            <el-collapse-item v-if="processIndex >= 4" name="4" disabled>
                <div slot="title" class="title">
                    <div class="text">电子签名</div>
                </div>
                <div class="body-wrap">
                    <ElectronicSignature
                        ref="ElectronicSignature"
                        v-model="formData.sign"
                        :readonly="!isApproval"
                    />
                </div>
            </el-collapse-item>
        </el-collapse>
        <!-- 设备选择 -->
        <SelectDialog
            v-if="missingDevice.visible"
            v-bind="missingDevice"
            :visible.sync="missingDevice.visible"
            :title="missingDevice.onlyShow ? '已丢失设备': '选择已丢失设备'"
            type="device"
        />
        <!-- 配置非智能设备清单 -->
        <IntelligentNon
            v-if="hasNonIntelligent && configDeviceDialog.visible"
            :is-edit="isEditConfigDevice"
            :visible.sync="configDeviceDialog.visible"
            :contract="formData"
            :row-data="activeRowData"
            :is-create="isCreate"
            :select-device-ids="activeSelectDeviceIds"
            @change="handleConfigDeviceChange"
        />
        <!-- 配置智能设备清单 -->
        <Intelligent
            v-else-if="configDeviceDialog.visible"
            :is-edit="isEditConfigDevice"
            :visible.sync="configDeviceDialog.visible"
            :contract="formData"
            :row-data="activeRowData"
            :is-create="isCreate"
            :select-device-ids="activeSelectDeviceIds"
            :select-device-imeis="activeSelectDeviceImeis"
            @change="handleConfigDeviceChange"
        />
        <!-- 配置补购设备清单 -->
        <BuyInPicker
            v-if="buyInPicker.visible"
            v-bind="buyInPicker"
            :contract="formData"
            :row-data="activeRowData"
            :is-create="isCreate"
            :visible.sync="buyInPicker.visible"
            :select-device-ids="activeSelectDeviceIds"
            @change="handleMissingDeviceChange"
        />
    </div>
</template>

<script>
    // API
    import storageOutApi from '@/api/businessDocuments/storageOut'
    // 方法
    import enums from '@/utils/enum'
    import { updateTreeId } from '@/views/PM/salesContract/components/utils'
    // 组件
    import BaseForm from './BaseForm'
    import BuyInPicker from './BuyInPicker'
    import ProductTest from './ProductTest'
    import Intelligent from './ConfigDevice/Intelligent'
    import IntelligentNon from './ConfigDevice/IntelligentNon'
    import ElectronicSignature from '@/components/ElectronicSignature'

    export default {
        components: {
            BaseForm,
            BuyInPicker,
            ProductTest,
            Intelligent,
            IntelligentNon,
            ElectronicSignature
        },
        props: {
            dataId: { type: [Number, String] },
            isEdit: { type: Boolean, default: false },
            rowData: { type: Object },
            jsonData: { type: null },
            isApproval: { type: Boolean, default: false },
            processIndex: { type: Number, default: 0 }
        },
        data() {
            return {
                today: null,
                loading: false,
                formData: {
                    sign: null
                },
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: null,
                        maxHeight: null,
                        indent: 2,
                        rowKey: '_treeId',
                        defaultExpandAll: true,
                        treeProps: {
                            children: 'bomList'
                        }
                    },
                    // 列操作按钮
                    operates: {
                        width: 67,
                        fixed: 'right',
                        show: false
                    }
                },
                buyInPicker: {
                    visible: false
                },
                missingDevice: {
                    value: [],
                    visible: false,
                    onlyShow: false,
                    dataList: [],
                    maxCount: 0,
                    overageMessage: '',
                    extendParams: {}
                },
                collapseValue: ['1', '2', '3', '4'],
                activeRowData: null,
                activeSelectDeviceIds: [],
                activeSelectDeviceImeis: [],
                putDialogVisible: false,
                isEditConfigDevice: false,
                deviceSelectVisible: false,
                configDeviceDialog: {
                    visible: false
                }
            }
        },
        computed: {
            isCreate() {
                return !this.dataId
            },
            // 是否非智能设备
            hasNonIntelligent() {
                if (this.activeRowData) {
                    var category = enums.productCategoryId.find(item => item.id === this.activeRowData.productCategoryId)
                    if (category) {
                        return category.value === 2
                    }
                }
                return false
            },
            // 是否显示配置按钮
            hasConfigButton() {
                return this.processIndex === 4 && this.isApproval
            },
            // 是否显示领料检测
            showProductTest() {
                return this.processIndex >= 3 && this.includeIntelligentProduct
            },
            // 入库产品是否包含智能产品
            includeIntelligentProduct() {
                var category = enums.productCategoryId.find(item => item.value === 0)
                return this.tableData.list.findIndex(item => item.productCategoryId === category.id) > -1
            }
        },
        watch: {
            dataId: {
                deep: true,
                immediate: true,
                handler() {
                    this.queryBaseInfo()
                }
            },
            processIndex() {
                this.updateTabelConfig()
            }
        },
        mounted() {
            // 表格配置
            this.TabelConfig = {
                default: [
                    {
                        prop: 'productCode',
                        label: '产品编号',
                        minWidth: 130,
                        isCopy: false,
                        isClick: true,
                        idKey: 'productId',
                        dialogType: 'product'
                    },
                    {
                        type: 'dict',
                        dictType: 'productType',
                        prop: 'productType',
                        label: '产品类型',
                        minWidth: 120
                    },
                    {
                        type: 'dict',
                        dictType: 'salesType',
                        prop: 'salesType',
                        label: '销售模式',
                        width: 80
                    },
                    {
                        prop: 'count',
                        label: '销售/租用数量',
                        width: 100
                    },
                    {
                        prop: 'countEd',
                        label: '已出库',
                        width: 80,
                        visible: true
                    },
                    {
                        prop: 'countIng',
                        label: '出库中',
                        width: 80,
                        visible: true
                    },
                    {
                        prop: 'countApply',
                        label: '申请出库数量',
                        width: 120,
                        render: (h, { row, column }) => {
                            var key = column.prop
                            return (
                                <el-input-number
                                    value={row[key]}
                                    onBlur={() => {
                                        this.handleValidate(row, column)
                                    }}
                                    onInput={res => {
                                        row[key] = res
                                    }}
                                    onChange={() => {
                                        this.handleValidate(row, column)
                                    }}
                                    placeholder={column.label}
                                    min={0}
                                    size='mini'
                                    style='width:100%'
                                    precision={0}
                                    controls-position='right'
                                />
                            )
                        },
                        isRender: ({ row }) => !row._isBom && this.isEdit
                    },
                    {
                        prop: 'countConf',
                        label: '配置出库数量',
                        width: 100,
                        visible: false,
                        isCopy: false,
                        isClick: ({ row }) => this.processIndex > 4 && !row._isBom,
                        onClick: (data) => {
                            this.activeRowData = data
                            this.isEditConfigDevice = false
                            this.configDeviceDialog = {
                                visible: true
                            }
                        }
                    }
                ],
                // 补购
                buyIn: [
                    {
                        prop: 'productCode',
                        label: '产品编号',
                        minWidth: 130,
                        isCopy: false,
                        isClick: true,
                        idKey: 'productId',
                        dialogType: 'product'
                    },
                    {
                        type: 'dict',
                        dictType: 'productType',
                        prop: 'productType',
                        label: '产品类型',
                        minWidth: 120
                    },
                    {
                        prop: 'count',
                        label: '补购数量',
                        width: 100
                    },
                    {
                        prop: 'countEd',
                        label: '已出库',
                        width: 100,
                        visible: true
                    },
                    {
                        prop: 'countIng',
                        label: '出库中',
                        width: 100,
                        visible: true
                    },
                    {
                        prop: 'countApply',
                        label: '申请出库数量',
                        width: 100,
                        isCopy: false,
                        isClick: ({ row }) => !row._isBom && !this.isEdit,
                        onClick: (data) => {
                            this.missingDevice = {
                                visible: true,
                                onlyShow: true,
                                dataList: data.lostList,
                                extendParams: {
                                    productCode: data.productCode,
                                    productCategory: data.productCategoryId,
                                    warehousesId: 'bc5fe3a9-5b92-4aad-b7fe-acc62dcc82de', // 仓库id
                                    typeId: this.getWarehousesSpaceType(0, '在运营') // 仓位id
                                }
                            }
                        }
                    },
                    {
                        prop: 'countConf',
                        label: '配置出库数量',
                        width: 100,
                        visible: false,
                        isCopy: false,
                        isClick: ({ row }) => this.processIndex > 4 && !row._isBom,
                        onClick: (data) => {
                            this.activeRowData = data
                            this.isEditConfigDevice = false
                            this.configDeviceDialog = {
                                visible: true
                            }
                        }
                    }
                ]
            }
            this.updateTabelConfig()
        },
        methods: {
            // 点击提交按钮时触发
            async submit() {
                this.loading = true
                try {
                    var index = this.tableData.list.findIndex(item => item.countApply)
                    if (this.tableData.list.length && index > -1) {
                        var data = await this.$refs.BaseForm.submit()
                        var res = await storageOutApi.update({
                            ...this.formData,
                            ...data,
                            // 过滤出库数量为0的数据
                            products: this.tableData.list.filter(item => item.countApply)
                        })
                        this.getCanApprovalCount()
                        return this.$notify({
                            title: '保存成功',
                            message: res.msg,
                            type: 'success',
                            duration: 2000
                        })
                    } else {
                        this.$message.warning('请至少选择一台出库设备')
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
                    let { warehouseOutType } = this.rowData || {}
                    let { data: data1 } = await storageOutApi.detail({
                        guidId: this.dataId,
                        type: warehouseOutType
                    })
                    let data2 = {}
                    if (this.isEdit) {
                        let res = await storageOutApi.contractDetail({
                            contractId: data1.contractId,
                            outType: data1.outType
                        })
                        data2 = res.data
                    }
                    let { startDate, endDate } = data1
                    // 更新出库数量
                    this.tableData.list = data1.products.map(item => {
                        if (this.isEdit) {
                            // 只有撤回时才更新出库数量
                            let data = data2.products.find(v => v.productId === item.productId && v.productCategoryId === item.productCategoryId)
                            if (data) {
                                item.countEd = data.countEd || 0
                                item.countIng = data.countIng || 0
                                item.countInventory = data.countInventory || 0
                                item.bomList = item.bomList || []
                                item.bomList.forEach(bom1 => {
                                    data.bomList = data.bomList || []
                                    let bom2 = data.bomList.find(v => v.productId === bom1.productId)
                                    if (bom2) {
                                        bom1.countEd = bom2.countEd || 0
                                        bom1.countIng = bom2.countIng || 0
                                        bom1.countInventory = bom2.countInventory || 0
                                    }
                                    bom1.countIng = Math.max(bom1.countIng - bom1.countApply, 0)
                                    bom1.countApplyOld = bom1.countApply
                                })
                            }
                            item.countIng = Math.max(item.countIng - item.countApply, 0)
                        } else {
                            item.countEd = item.countEd || 0
                            item.countIng = item.countIng || 0
                        }
                        // 补购类型
                        if (data1.contractType === 2) {
                            item.devices = null
                        }
                        updateTreeId(item)
                        item.countApplyOld = item.countApply
                        return item
                    })
                    this.today = data1.outWarehouseTime
                    this.formData = {
                        ...this.formData,
                        ...data1,
                        _period: startDate && endDate ? [startDate, endDate] : []
                    }
                    await this.updateTabelConfig()
                    this.$emit('data-update', this.formData)
                    this.loading = false
                }
            },
            // 获取销售合同基础信息
            async queryContractInfo({ formData, guidId }) {
                this.loading = true
                let res = await storageOutApi.contractDetail({
                    contractId: guidId,
                    outType: formData.outType
                })
                let {
                    contractCode,
                    contractName,
                    contractType,
                    signedDate,
                    projectId,
                    projectName,
                    customerId,
                    customerName,
                    sectionId,
                    sectionName,
                    startDate,
                    endDate
                } = res.data
                let list = res.data.products
                this.tableData.list = list.filter(item => {
                    return item.count - item.countEd - item.countIng > 0
                }).map(item => {
                    updateTreeId(item)
                    item.countApply = 0
                    item.lostList = []
                    return item
                })
                this.formData = {
                    ...this.formData,
                    ...formData,
                    contractId: guidId,
                    contractCode,
                    contractName,
                    contractType,
                    projectId,
                    projectName,
                    customerId,
                    customerName,
                    sectionId,
                    sectionName,
                    signedDate,
                    _period: startDate && endDate ? [startDate, endDate] : []
                }
                this.updateTabelConfig()
                this.loading = false
            },
            // 获取配置的出库设备
            async queryConfigDeviceList(data) {
                let res = await storageOutApi.getConfigDeviceList({
                    outId: this.formData.guidId,
                    category: data.productCategoryId,
                    outProdId: data.guidId,
                    pageSize: data.countApply
                })
                let list = res.data.records.map(item => {
                    item.tempFlag = 1
                    return item
                })
                if (list.length) {
                    data.tempFlag = 1
                    if (this.hasNonIntelligent) {
                        // 非智能设备
                        data.otherList = list.map(v => {
                            v.count = v.num
                            return v
                        })
                        data.countConf = list.reduce((a, b) => {
                            return a + b.count
                        }, 0)
                    } else {
                        // 智能设备
                        var type = this.formData.contractType
                        if (type === 2) {
                            // 补购
                            data.countConf = list.reduce((a, b) => {
                                if (b.guidId) {
                                    return a + 1
                                }
                                return a
                            }, 0)
                        } else {
                            data.countConf = list.length
                        }
                        data.devices = list
                    }
                }
            },
            // 更新表格配置
            async updateTabelConfig() {
                var type = this.formData.contractType
                if (type === 2) {
                    // 补购
                    this.tableData.columns = this.TabelConfig.buyIn
                } else if (type !== 3) {
                    // 不是续费的其他合同
                    this.tableData.columns = this.TabelConfig.default
                }
                if (this.isApproval && this.processIndex === 4) {
                    await Promise.all(this.tableData.list.map(v => this.queryConfigDeviceList(v)))
                    this.$emit('update:jsonData', this.formData)
                }
                if (this.isEdit) {
                    if (type === 2) {
                        this.tableData.operates.show = true
                    } else if (type !== 3) {
                        this.tableData.operates.show = false
                    }
                } else {
                    if (this.tableData.columns.length) {
                        // 如果当前流程环节是设备出库且可以审批，获取在设备出库环节之后，显示不同的表单项
                        if ((this.processIndex === 4 && this.isApproval) || this.processIndex > 4) {
                            this.tableData.columns.find(item => item.prop === 'countEd').visible = false
                            this.tableData.columns.find(item => item.prop === 'countIng').visible = false
                            this.tableData.columns.find(item => item.prop === 'countConf').visible = true
                        }
                    }
                    // if (type === 2) {
                    //     // 如果当前合同类型为补购，且需要配置出库清单
                    //     if (this.hasConfigButton) {
                    //         this.tableData.list.forEach(item => {
                    //             item.devices = item.lostList.map(v => {
                    //                 return {
                    //                     ...v,
                    //                     sim: '',
                    //                     imei: '',
                    //                     guidId: '',
                    //                     _sim: '',
                    //                     _imei: '',
                    //                     _guidId: '',
                    //                     _error: false,
                    //                     oldImei: v.imei,
                    //                     oldDeviceId: v.guidId
                    //                 }
                    //             })
                    //             return item
                    //         })
                    //     } else if (this.processIndex >= 4) {
                    //         this.tableData.list.forEach(item => {
                    //             item.devices = item.lostList.map(v => {
                    //                 return {
                    //                     ...v,
                    //                     _imei: v.outImei,
                    //                     _guidId: v.guidId,
                    //                     oldImei: v.imei
                    //                 }
                    //             })
                    //             return item
                    //         })
                    //     }
                    // }
                    this.tableData.operates.show = this.hasConfigButton
                }
            },
            // 更新BOM数量
            updateBomCount(data) {
                if (Array.isArray(data.bomList)) {
                    data.bomList.forEach(item => {
                        let count = Math.max(item.count / data.count, 1)
                        item.countApply = data.countApply * count
                        item.countConf = data.countConf * count
                    })
                }
            },
            // 验证输入的申请数量
            handleValidate(data) {
                let content
                let contents = []
                let { countApply } = data
                // 更新物料出库数量
                this.updateBomCount(data)
                // 根据申请出库数量不能大于（销售/租用数量-已出库-出库中）的规则来获取最大可出库数量
                let maxCount = Math.min.apply(null, [
                    Math.max(data.count - data.countEd - data.countIng, 0),
                    ...data.bomList.map(v => Math.max(v.count - v.countEd - v.countIng, 0))
                ])
                if (countApply > maxCount) {
                    contents.push({
                        label: '申请出库数量不能大于（销售/租用数量-已出库-出库中）',
                        value: maxCount
                    })
                }
                /**
                 * 根据申请出库数量不能大于全新库存数量的规则来获取最大可出库数量
                 * 因为可能存在相同产品，所以需要把相同产品的申请出库数量相加
                 */
                maxCount = Math.min.apply(null, [
                    data.countInventory,
                    ...data.bomList.map(item => {
                        // 该物料在该产品中所需要的数量
                        let count = Math.max(item.count / data.count, 1)
                        return Math.floor(item.countInventory / count)
                    })
                ])
                if (countApply > maxCount) {
                    contents.push({
                        label: '申请出库数量不能大于（全新库存数量-该产品的其他销售模式的申请出库数量）',
                        value: maxCount
                    })
                }
                if (contents.length) {
                    content = contents.reduce((a, b) => b.value < a.value ? b : a)
                }
                if (content) {
                    this.$nextTick(() => {
                        data.bomList.forEach(item => {
                            item.countApply = content.value
                        })
                        data.countApply = content.value
                    })
                    this.$message.warning(content.label)
                }
            },
            // 表单组件改变时触发
            handleFormChange({ data }) {
                this.formData = {
                    ...this.formData,
                    ...data
                }
                this.$emit('update:jsonData', this.formData)
            },
            // 点击配置按钮时触发（补购类型）
            handleConfigButton(data) {
                let selectDeviceIds = []
                let selectDeviceImeis = []
                if (this.isEdit) {
                    this.tableData.list.forEach(item => {
                        if (item !== data && item.productId === data.productId) {
                            item.lostList.forEach(device => {
                                selectDeviceIds.push(device.guidId)
                            })
                        }
                    })
                    // 选择丢失设备
                    this.buyInPicker = {
                        visible: true
                    }
                } else {
                    this.tableData.list.forEach(item => {
                        if (item.devices === null) {
                            item.devices = item.lostList.map(v => {
                                return {
                                    sim: '',
                                    imei: '',
                                    guidId: '',
                                    outImei: '',
                                    productId: '',
                                    productCode: v.productCode,
                                    oldSim: v.sim,
                                    oldImei: v.imei,
                                    oldDeviceId: v.guidId,
                                    oldProductId: v.productId,
                                    _error: false
                                }
                            })
                        }
                        if (item !== data) {
                            item.devices.forEach(device => {
                                selectDeviceIds.push(device.guidId)
                                if (device.outImei) {
                                    selectDeviceImeis.push(device.outImei)
                                }
                            })
                        }
                    })
                    // 配置出库清单
                    this.isEditConfigDevice = true
                    this.configDeviceDialog = {
                        visible: true
                    }
                }
                this.activeSelectDeviceIds = selectDeviceIds
                this.activeSelectDeviceImeis = selectDeviceImeis
                this.activeRowData = data
            },
            // 点击新增来料批次按钮时触发
            handleProductTest() {
                this.$refs.ProductTest.handleConfig()
            },
            // 出库类型改变时触发
            handleOutTypeChange(data) {
                this.formData = {
                    outType: data.outType
                }
                this.tableData.list = []
            },
            // 选择丢失设备后触发
            handleMissingDeviceChange(list) {
                this.activeRowData.lostList = list
                this.activeRowData.countApply = list.length
                this.updateBomCount(this.activeRowData)
            },
            // 选择出库清单后触发
            handleConfigDeviceChange(list) {
                if (this.hasNonIntelligent) {
                    // 非智能设备
                    this.activeRowData.otherList = list
                    this.activeRowData.countConf = list.reduce((a, b) => {
                        return a + b.count
                    }, 0)
                } else {
                    // 智能设备
                    var type = this.formData.contractType
                    if (type === 2) {
                        // 补购
                        this.activeRowData.countConf = list.reduce((a, b) => {
                            if (b.guidId) {
                                return a + 1
                            }
                            return a
                        }, 0)
                        this.activeRowData.devices = list
                    } else {
                        this.activeRowData.devices = list
                        this.activeRowData.countConf = list.length
                    }
                }
                this.updateBomCount(this.activeRowData)
                this.$emit('update:jsonData', this.formData)
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
