<!--
* @description 更新续费内容
* @author yc
!-->
<template>
    <div>
        <el-form ref="ruleForm" :model="model" :rules="rulesData" label-width="0" class="form-wrap">
            <div class="product-wrap">
                <div class="label-wrap">产品</div>
                <div class="content info-wrap" @click="handleClickProduct">
                    <el-image v-if="!loading" :src="productImage">
                        <i slot="error" class="el-image-error-slot el-icon-picture-outline"/>
                    </el-image>
                    <div class="info">
                        <div v-if="model.productName" class="name">{{ model.productName }}</div>
                        <div class="type">{{ model.productTypeName }}</div>
                    </div>
                </div>
            </div>
            <div class="wrap-box not-margin">
                <div class="row">
                    <div class="col">
                        <el-form-item prop="xxx">
                            <div class="label-wrap">原销售模式</div>
                            <div class="content">
                                <DictSelect
                                    v-model="model.salesType"
                                    type="salesType"
                                    placeholder="原销售模式"
                                    disabled
                                    size="mini"
                                />
                            </div>
                        </el-form-item>
                    </div>
                    <div class="col">
                        <el-form-item prop="xxx">
                            <div class="label-wrap">在运营数量</div>
                            <div class="content">
                                <el-input
                                    v-model="model.originCount"
                                    disabled
                                    placeholder="在运营数量"
                                    size="mini"
                                />
                            </div>
                        </el-form-item>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <el-form-item prop="count">
                            <div class="label-wrap">补购数量</div>
                            <div class="content">
                                <el-input-number
                                    v-model="model.count"
                                    :min="1"
                                    :precision="0"
                                    :max="model.originCount"
                                    :disabled="!isEdit"
                                    controls-position="right"
                                    @change="updateTotalPrice()"
                                />
                                <div class="tips">提示：补购数量不能大于在运营数量</div>
                            </div>
                        </el-form-item>
                    </div>
                </div>
            </div>
            <div>
                <div class="label-wrap">单价</div>
                <div class="content price-wrap">
                    <el-form-item prop="unitPriceSales" class="item">
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
                </div>
                <div class="label-wrap">总价</div>
                <div class="content price-wrap">
                    <el-form-item prop="unitPriceSales" class="item">
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
                    <el-form-item prop="unitPriceInstall" class="item">
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
                </div>
                <div class="label-wrap">税率</div>
                <div class="content price-wrap">
                    <el-form-item prop="salesRate" class="item">
                        <div class="price-input">
                            <div class="label">销售</div>
                            <el-input-number
                                v-model="model.salesRate"
                                :min="0"
                                :max="1"
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
                                :min="0"
                                :max="1"
                                :precision="2"
                                :disabled="!isEdit"
                                controls-position="right"
                                @change="updateTotalPrice('rate')"
                            />
                        </div>
                    </el-form-item>
                </div>
            </div>
        </el-form>
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
    import { updateTreeId } from '../utils'
    // 组件

    export default {
        name: 'BuyInForm',
        mixins: [mixin],
        data() {
            return {
                model: {
                    count: 0,
                    bomList: [],
                    salesType: 0,
                    productId: '',
                    productPic: '',
                    productName: '- -',
                    productTypeName: '- -',
                    originCount: 0,
                    unitPriceSales: 0,
                    unitPriceInstall: 0,
                    unitPriceServices: 0,
                    unitPriceSalesTotal: 0,
                    unitPriceInstallTotal: 0,
                    unitPriceServicesTotal: 0,
                    salesRate: 0.13,
                    installRate: 0.06
                },
                loading: false,
                rulesData: {
                    productId: [
                        { required: true, message: '请选择产品', trigger: 'blur' }
                    ],
                    count: [
                        { required: true, message: '请输入补购数量', trigger: 'blur' }
                    ],
                    salesType: [
                        { required: true, message: '请选择销售模式', trigger: 'blur' }
                    ],
                    unitPriceSales: [
                        { required: true, message: '请输入销售单价', trigger: 'blur' }
                    ],
                    unitPriceServices: [
                        { required: true, message: '请输入服务费', trigger: 'blur' }
                    ],
                    unitPriceInstall: [
                        { required: true, message: '请输入安装费', trigger: 'blur' }
                    ]
                }
            }
        },
        mounted() {
            this.model = { ...this.model, ...this.formData }
            this.getBaseInfo()
        },
        methods: {
            // 提交表单
            submit(callback, errorCallback) {
                this.$refs.ruleForm.validate(valid => {
                    if (valid) {
                        let model = {
                            ...this.model,
                            unitPriceMove: 0,
                            unitPriceMoveTotal: 0,
                            unitPriceDeposit: 0,
                            unitPriceDepositTotal: 0,
                            unitPriceServices: 0,
                            unitPriceServicesTotal: 0
                        }
                        updateTreeId(model)
                        callback && callback(model)
                    } else {
                        errorCallback && errorCallback(valid)
                    }
                })
            },
            // 获取基础信息
            async getBaseInfo() {
                this.loading = true
                try {
                    let model = this.model
                    let promises = [this.queryBaseInfo()]
                    if (this.isCreate && !model._isDirty) {
                        promises.push(this.queryOriginPrice())
                    }
                    let [res1, res2] = await Promise.all(promises)
                    if (res1) {
                        model.productPic = res1.info.photoFile
                        model.productTypeName = (this.getDict('productType').find(item => item.value === res1.info.type) || {}).label || '- -'
                    }
                    if (res2 && res2.data) {
                        model.unitPriceSales = res2.data.unitPriceSales || 0
                        model.unitPriceInstall = res2.data.unitPriceInstall || 0
                        this.updateTotalPrice()
                    }
                } catch (err) {
                    console.error(err)
                }
                this.loading = false
            }
        }
    }
</script>

<style lang='scss' scoped>
.form-wrap {
    .product-wrap {
        margin-bottom: 15px;
    }
    .label-wrap {
        font-size: 14px;
    }
    .content {
        font-size: 13px;
        line-height: 1.4em;
        margin-top: 6px;
    }
    .wrap-box {
        width: 470px;
        .row {
            display: flex;
            flex-wrap: wrap;
            .col {
                width: 220px;
            }
        }
        .col {
            & + .col {
                margin-left: 30px;
            }
        }
        .tips {
            color: #999;
            margin-top: 5px;
        }
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
    .price-wrap {
        display: flex;
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
