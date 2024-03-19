<!--
* @description 更新产品及服务内容
* @author yc
!-->
<template>
    <div>
        <el-form ref="ruleForm" :model="model" :rules="rulesData" label-width="0" class="form-wrap">
            <el-form-item prop="productId">
                <div class="label-wrap">产品</div>
                <div class="content info-wrap" @click="handlePickProduct">
                    <el-image v-if="!loading" :src="productImage">
                        <i slot="error" class="el-image-error-slot el-icon-picture-outline"/>
                    </el-image>
                    <div class="info">
                        <div v-if="model.productName" class="name">{{ model.productName }}</div>
                        <div class="type">{{ model.productTypeName }}</div>
                    </div>
                    <div v-if="isEdit" class="iconfont iconzhankai"/>
                </div>
            </el-form-item>
            <el-form-item prop="count">
                <div class="label-wrap">数量</div>
                <div class="content">
                    <el-input-number
                        v-model="model.count"
                        :min="1"
                        :precision="0"
                        :disabled="!isEdit"
                        controls-position="right"
                        @change="updateTotalPrice()"
                    />
                </div>
            </el-form-item>
            <el-form-item prop="salesType">
                <div class="label-wrap">销售模式</div>
                <div class="content model-wrap">
                    <div
                        v-for="item in salesTypeEnum"
                        :key="item.value"
                        :class="{hover: model.salesType === item.value, disabled: !isEdit}"
                        class="item"
                        @click="handleModelClick(item)"
                    >{{ item.label }}</div>
                </div>
            </el-form-item>
            <el-form-item class="not-margin">
                <div class="label-wrap">单价</div>
                <div class="content price-wrap">
                    <el-form-item v-if="model.salesType === 1" prop="unitPriceDeposit" class="item">
                        <div class="price-input">
                            <div class="label">押金</div>
                            <el-input-number
                                v-model="model.unitPriceDeposit"
                                :min="0"
                                :precision="2"
                                :disabled="!isEdit"
                                controls-position="right"
                                @change="updateTotalPrice('unit')"
                            />
                        </div>
                    </el-form-item>
                    <el-form-item v-if="model.salesType === 0" prop="unitPriceSales" class="item">
                        <div class="price-input">
                            <div class="label">销售</div>
                            <el-input-number
                                v-model="model.unitPriceSales"
                                :min="0"
                                :precision="2"
                                :disabled="!isEdit"
                                controls-position="right"
                                @change="updateTotalPrice('unit')"
                            />
                        </div>
                    </el-form-item>
                    <el-form-item prop="unitPriceServices" class="item">
                        <div class="price-input">
                            <div class="label">服务费</div>
                            <el-input-number
                                v-model="model.unitPriceServices"
                                :min="0"
                                :precision="2"
                                :disabled="!isEdit"
                                controls-position="right"
                                @change="updateTotalPrice('unit')"
                            />
                        </div>
                    </el-form-item>
                    <el-form-item prop="unitPriceInstall" class="item">
                        <div class="price-input">
                            <div class="label">安装费</div>
                            <el-input-number
                                v-model="model.unitPriceInstall"
                                :min="0"
                                :precision="2"
                                :disabled="!isEdit"
                                controls-position="right"
                                @change="updateTotalPrice('unit')"
                            />
                        </div>
                    </el-form-item>
                    <el-form-item v-if="salesType === 9" prop="unitPriceMove" class="item">
                        <div class="price-input">
                            <div class="label">迁装费</div>
                            <el-input-number
                                v-model="model.unitPriceMove"
                                :min="0"
                                :precision="2"
                                :disabled="!isEdit"
                                controls-position="right"
                                @change="updateTotalPrice('unit')"
                            />
                        </div>
                    </el-form-item>
                </div>
            </el-form-item>
            <el-form-item class="not-margin">
                <div class="label-wrap">总价</div>
                <div class="content price-wrap">
                    <el-form-item v-if="model.salesType === 1" prop="unitPriceDepositTotal" class="item">
                        <div class="price-input">
                            <div class="label">押金</div>
                            <el-input-number
                                v-model="model.unitPriceDepositTotal"
                                :min="0"
                                :precision="2"
                                :disabled="!isEdit"
                                controls-position="right"
                                @change="updateTotalPrice('total')"
                            />
                        </div>
                    </el-form-item>
                    <el-form-item v-if="model.salesType === 0" prop="unitPriceSalesTotal" class="item">
                        <div class="price-input">
                            <div class="label">销售</div>
                            <el-input-number
                                v-model="model.unitPriceSalesTotal"
                                :min="0"
                                :precision="2"
                                :disabled="!isEdit"
                                controls-position="right"
                                @change="updateTotalPrice('total')"
                            />
                        </div>
                    </el-form-item>
                    <el-form-item prop="unitPriceServicesTotal" class="item">
                        <div class="price-input">
                            <div class="label">服务费</div>
                            <el-input-number
                                v-model="model.unitPriceServicesTotal"
                                :min="0"
                                :precision="2"
                                :disabled="!isEdit"
                                controls-position="right"
                                @change="updateTotalPrice('total')"
                            />
                        </div>
                    </el-form-item>
                    <el-form-item prop="unitPriceInstallTotal" class="item">
                        <div class="price-input">
                            <div class="label">安装费</div>
                            <el-input-number
                                v-model="model.unitPriceInstallTotal"
                                :min="0"
                                :precision="2"
                                :disabled="!isEdit"
                                controls-position="right"
                                @change="updateTotalPrice('total')"
                            />
                        </div>
                    </el-form-item>
                    <el-form-item v-if="salesType === 9" prop="unitPriceMoveTotal" class="item">
                        <div class="price-input">
                            <div class="label">迁装费</div>
                            <el-input-number
                                v-model="model.unitPriceMoveTotal"
                                :min="0"
                                :precision="2"
                                :disabled="!isEdit"
                                controls-position="right"
                                @change="updateTotalPrice('total')"
                            />
                        </div>
                    </el-form-item>
                </div>
            </el-form-item>
            <el-form-item class="not-margin">
                <div class="label-wrap">税率</div>
                <div class="content price-wrap">
                    <el-form-item v-if="model.salesType === 1" prop="unitPriceDepositRate" class="item">
                        <div class="price-input">
                            <div class="label">押金</div>
                            <el-input-number
                                v-model="model.unitPriceDepositRate"
                                :max="1"
                                :min="0"
                                :precision="2"
                                :disabled="true"
                                controls-position="right"
                            />
                        </div>
                    </el-form-item>
                    <el-form-item v-if="model.salesType === 0" prop="salesRate" class="item">
                        <div class="price-input">
                            <div class="label">销售</div>
                            <el-input-number
                                v-model="model.salesRate"
                                :max="1"
                                :min="0"
                                :precision="2"
                                :disabled="!isEdit"
                                controls-position="right"
                                @change="updateTotalPrice('rate')"
                            />
                        </div>
                    </el-form-item>
                    <el-form-item prop="serviceRate" class="item">
                        <div class="price-input">
                            <div class="label">服务费</div>
                            <el-input-number
                                v-model="model.serviceRate"
                                :max="1"
                                :min="0"
                                :precision="2"
                                :disabled="!isEdit"
                                controls-position="right"
                                @change="updateTotalPrice('rate')"
                            />
                        </div>
                    </el-form-item>
                    <el-form-item prop="installRate" class="item">
                        <div class="price-input">
                            <div class="label">安装费</div>
                            <el-input-number
                                v-model="model.installRate"
                                :max="1"
                                :min="0"
                                :precision="2"
                                :disabled="!isEdit"
                                controls-position="right"
                                @change="updateTotalPrice('rate')"
                            />
                        </div>
                    </el-form-item>
                </div>
            </el-form-item>
        </el-form>
        <!-- 选择产品 -->
        <SelectDialog
            v-if="selectDialog.visible"
            v-bind="selectDialog"
            :visible.sync="selectDialog.visible"
            @change="handlePickChange"
        />
        <!-- 详情弹窗 -->
        <PublicDetailDialog
            v-if="dialogData.visible"
            v-bind="dialogData"
            :visible.sync="dialogData.visible"
        />
    </div>
</template>

<script>
    // API
    // 方法
    import mixin from './mixin'
    import enums from '@/utils/enum'
    import { updateTreeId } from '../utils'
    // 组件
    import SelectDialog from '@/components/SelectDialog/index.vue'

    export default {
        name: 'DefaultForm',
        components: {
            SelectDialog
        },
        mixins: [mixin],
        props: {
            // 不可选择的产品id列表
            excludes: { type: Array, default: () => [] }
        },
        data() {
            return {
                model: {
                    count: 0,
                    bomList: [],
                    salesType: 0,
                    productId: '',
                    productPic: null,
                    productCode: '',
                    productName: '',
                    productTypeName: this.isEdit ? '点击选择产品' : '- -',
                    unitPriceSales: 0,
                    unitPriceInstall: 0,
                    unitPriceDeposit: 0,
                    unitPriceServices: 0,
                    unitPriceMove: 0,
                    unitPriceSalesTotal: 0,
                    unitPriceDepositTotal: 0,
                    unitPriceInstallTotal: 0,
                    unitPriceServicesTotal: 0,
                    unitPriceMoveTotal: 0,
                    unitPriceDepositRate: 0, // 押金税率永远是0
                    salesRate: 0.13,
                    serviceRate: 0.06,
                    installRate: 0.06
                },
                loading: false,
                rulesData: {
                    productId: [
                        { required: true, message: '请选择产品', trigger: 'change' }
                    ],
                    count: [
                        { required: true, message: '请输入数量', trigger: 'change' }
                    ],
                    salesType: [
                        { required: true, message: '请选择销售模式', trigger: 'change' }
                    ],
                    unitPriceDeposit: [
                        { required: true, message: '请输入押金', trigger: 'change' }
                    ],
                    unitPriceSales: [
                        { required: true, message: '请输入销售单价', trigger: 'change' }
                    ],
                    unitPriceServices: [
                        { required: true, message: '请输入服务费', trigger: 'change' }
                    ],
                    unitPriceInstall: [
                        { required: true, message: '请输入安装费', trigger: 'change' }
                    ]
                },
                salesTypeEnum: enums.salesType.filter(v => v.value !== 2),
                selectDialog: {
                    type: 'product',
                    title: '选择产品',
                    visible: false
                }
            }
        },
        mounted() {
            if (this.formData) {
                this.model = { ...this.model, ...this.formData }
                this.queryProductInfo()
            } else {
                switch (this.salesType) {
                case 9:
                    this.model.salesType = 0
                    break
                default:
                    this.model.salesType = this.salesType || 0
                    break
                }
            }
        },
        methods: {
            // 提交表单
            submit(callback, errorCallback) {
                this.$refs.ruleForm.validate(valid => {
                    if (valid) {
                        let model = { ...this.model }
                        if (!this.formData && Array.isArray(this.excludes)) {
                            let { productId, salesType } = model
                            if (this.excludes.findIndex(v => v.productId === productId && v.salesType === salesType) > -1) {
                                return this.$message.warning('当前产品的此种销售模式已存在！')
                            }
                        }
                        updateTreeId(model)
                        callback && callback(model)
                    } else {
                        errorCallback && errorCallback(valid)
                    }
                })
            },
            // 获取产品信息
            async queryProductInfo() {
                this.loading = true
                try {
                    let res = await this.queryBaseInfo()
                    let model = this.model
                    let productInfo = res.info.productInfo || {}
                    model.productPic = res.info.photoFile
                    model.productTypeName = (this.getDict('productType').find(v => v.value === res.info.type) || {}).label || '- -'
                    model._unitPriceSales = productInfo.salesUnitPrice || 0
                    model._unitPriceDeposit = productInfo.rentalUnitPrice || 0
                    model._unitPriceInstall = productInfo.installCost || 0
                    model._salesFeeYear = productInfo.salesFeeYear || 0
                    model._rentalFeeYear = productInfo.rentalFeeYear || 0
                } catch (err) {
                    console.error(err)
                }
                this.loading = false
            },
            // 销售模式改变时触发
            salesTypeChange() {
                var model = this.model
                // 销售价格和押金还原成建议价格
                switch (model.salesType) {
                case 0:
                    model.unitPriceDeposit = 0
                    model.unitPriceSales = model._unitPriceSales || 0
                    model.unitPriceServices = model._salesFeeYear || 0
                    break
                case 1:
                    model.unitPriceSales = 0
                    model.unitPriceDeposit = model._unitPriceDeposit || 0
                    model.unitPriceServices = model._rentalFeeYear || 0
                    break
                }
                this.updateTotalPrice()
            },
            // 产品改变时触发
            async handlePickChange([data]) {
                this.model = {
                    ...this.model,
                    productId: data.guidId,
                    productCode: data.code,
                    productName: data.name,
                    productPic: data.photoFile,
                    productTypeName: (this.getDict('productType').find(v => v.value === data.type) || {}).label || '- -'
                }
                this.queryProductInfo().then(() => {
                    this.model.unitPriceInstall = this.model._unitPriceInstall
                    this.salesTypeChange()
                })
            },
            // 点击选择产品时触发
            handlePickProduct() {
                if (this.isEdit) {
                    this.selectDialog = {
                        ...this.selectDialog,
                        value: {
                            ...this.model,
                            guidId: this.model.productId
                        },
                        visible: true,
                        excludes: this.excludes
                    }
                } else {
                    this.handleClickProduct()
                }
            }
        }
    }
</script>

<style lang='scss' scoped>
.form-wrap {
    .label-wrap {
        font-size: 14px;
    }
    .content {
        font-size: 13px;
        line-height: 1.4em;
        margin-top: 6px;
    }
    .info-wrap {
        display: inline-flex;
        align-items: center;
        vertical-align: top;
        cursor: pointer;
        .el-image {
            width: 50px;
            height: 50px;
            margin-right: 10px;
            background: #f5f5f5;
        }
        .info {
            margin-right: 15px;
            .name {
                color: #333;
                margin-bottom: 10px;
                font-size: 14px;
            }
            .type {
                color: #999;
                font-size: 14px;
            }
        }
        .iconfont {
            color: #999;
            font-size: 20px;
        }
    }
    .model-wrap {
        display: flex;
        align-items: center;
        .item {
            min-width: 92px;
            height: 28px;
            line-height: 28px;
            font-size: 13px;
            color: #999;
            text-align: center;
            border-radius: 14px;
            background: rgb(244,241,244);
            transition: .2s;
            user-select: none;
            cursor: pointer;
            & + .item {
                margin-left: 10px;
            }
            &.hover {
                color: #fff;
                background: #409EFF;
            }
            &.disabled {
                cursor:initial;
            }
        }
    }
    .price-wrap {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        .item {
            & + .item {
                margin-left: 20px;
            }
            .price-input {
                display: flex;
                align-items: center;
                .label {
                    padding: 0 8px;
                    line-height: 26px;
                    border: solid 1px #DCDFE6;
                    border-right: none;
                    background: rgb(245,247,250);
                }
                /deep/ {
                    .el-input-number {
                        width: 100px;
                        .el-input__inner {
                            padding-left: 8px;
                            padding-right: 36px;
                        }
                    }
                }
            }
            .total {
                color: #999;
                font-size: 13px;
                line-height: 1.4em;
                margin-top: 8px;
            }
        }
    }
    /deep/ {
        .el-input-number {
            &.is-disabled {
                .el-input-number__decrease,
                .el-input-number__increase {
                    display: none;
                }
            }
        }
    }
}
</style>
