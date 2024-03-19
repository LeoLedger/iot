<!--
* @description 更新续费内容
* @author yc
!-->
<template>
    <div v-loading="loading">
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
                        <el-form-item prop="salesType">
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
                        <el-form-item prop="endDateOrigin">
                            <div class="label-wrap">原服务期限</div>
                            <div class="content">
                                <el-date-picker
                                    v-model="model.endDateOrigin"
                                    :default-time="['00:00:00', '23:59:59']"
                                    type="date"
                                    format="yyyy-MM-dd"
                                    value-format="yyyy-MM-dd HH:mm:ss"
                                    placeholder="原服务期限"
                                    size="mini"
                                    disabled
                                />
                            </div>
                        </el-form-item>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <el-form-item prop="count">
                            <div class="label-wrap">续期设备数量</div>
                            <div class="content">
                                <pick-input
                                    :value="model.count"
                                    :disabled="!isEdit"
                                    placeholder="选择续期设备"
                                    readonly
                                    @pick="renewDeviceVisible = true"
                                >
                                    <span slot="icon">选</span>
                                </pick-input>
                            </div>
                        </el-form-item>
                    </div>
                    <div class="col">
                        <el-form-item prop="endDate">
                            <div class="label-wrap">续期至</div>
                            <div class="content">
                                <el-date-picker
                                    v-model="model.endDate"
                                    disabled
                                    placeholder="续期至"
                                    format="yyyy-MM-dd"
                                    value-format="yyyy-MM-dd HH:mm:ss"
                                    type="date"
                                />
                            </div>
                        </el-form-item>
                    </div>
                </div>
            </div>
            <div>
                <div class="label-wrap">单价</div>
                <div class="content price-wrap">
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
                </div>
                <div class="label-wrap">总价</div>
                <div class="content price-wrap">
                    <el-form-item prop="unitPriceServices" class="item">
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
                    <el-form-item prop="serviceRate" class="item">
                        <div class="price-input">
                            <div class="label">服务费</div>
                            <el-input-number
                                v-model="model.serviceRate"
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
        <!-- 配置续费设备 -->
        <RenewDevice
            v-if="renewDeviceVisible"
            :row-data="model"
            :extend-params="extendParams"
            :visible.sync="renewDeviceVisible"
            is-edit
            @change="handelDeviceUpdate"
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
    import productApi from '@/api/purchase/product'
    import contractApi from '@/api/PM/contract'
    // 方法
    import mixin from './mixin'
    import moment from 'moment'
    import { isEmpty } from '@/utils'
    // 组件
    import RenewDevice from './RenewDevice'
    import PickInput from '@/components/customizeFormItem/PickInput'

    export default {
        name: 'RenewForm',
        components: {
            PickInput,
            RenewDevice
        },
        mixins: [mixin],
        data() {
            return {
                model: {
                    count: 0,
                    endDate: '',
                    salesType: 0,
                    productId: '',
                    productPic: '',
                    deviceList: null,
                    productName: '- -',
                    productTypeName: '- -',
                    originCount: 0,
                    unitPriceSales: 0,
                    unitPriceInstall: 0,
                    unitPriceServices: 0,
                    unitPriceSalesTotal: 0,
                    unitPriceInstallTotal: 0,
                    unitPriceServicesTotal: 0,
                    serviceRate: 0.06,
                    installRate: 0.06
                },
                rulesData: {
                    productId: [
                        { required: true, message: '请选择产品', trigger: 'blur' }
                    ],
                    endDate: [
                        { required: true, message: '请选择续期至日期', trigger: 'blur' }
                    ],
                    unitPriceServices: [
                        { required: true, message: '请输入服务费', trigger: 'blur' }
                    ],
                    unitPriceInstall: [
                        { required: true, message: '请输入安装费', trigger: 'blur' }
                    ]
                },
                loading: false,
                renewDeviceVisible: false
            }
        },
        mounted() {
            if (this.formData) {
                this.model = {
                    ...this.model,
                    ...this.formData
                }
            }
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
                            unitPriceSales: 0,
                            unitPriceSalesTotal: 0,
                            unitPriceDeposit: 0,
                            unitPriceDepositTotal: 0
                        }
                        let { endDate, endDateOrigin } = model
                        if (endDateOrigin && moment(endDate).isBefore(moment(endDateOrigin))) {
                            return this.$message.warning('续期日期不能早于原服务期限！')
                        }
                        callback && callback(model)
                    } else {
                        errorCallback && errorCallback(valid)
                    }
                })
            },
            // 获取基础信息
            getBaseInfo() {
                this.loading = true
                let model = this.model
                // 只在创建时和数据没有被更改时
                if (this.isCreate && !model._isDirty) {
                    // 获取产品原价格
                    this.queryOriginPrice().then(({ data }) => {
                        model.unitPriceInstall = data.unitPriceInstall || 0
                        this.updateTotalPrice()
                    })
                }
                if (isEmpty(model.deviceList) && this.isEdit) {
                    // 获取续费设备列表
                    contractApi.getRenewDevice({
                        ...this.extendParams,
                        pageSize: -1
                    }).then(({ data }) => {
                        model.deviceList = data.records
                    })
                }
                // 获取产品详情
                productApi.detail(model.productId).then(({ data }) => {
                    model.productPic = data.photoFile
                    model.productTypeName = (this.getDict('productType').find(item => item.value === res1.data.type) || {}).label || '- -'
                })
                this.loading = false
            },
            // 续期设备数量更新时触发
            handelDeviceUpdate(list) {
                this.model.deviceList = list
                this.model.count = list.filter(v => v.calloutFlag === 0).length
                this.updateTotalPrice()
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
