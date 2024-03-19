<!--
* @description
* @fileName list.vue
* @author 姜庆博
* @date 2019/06/17 17:57:44
* @version V1.0.0
!-->
<template>
    <div>
        <!-- 配置服务套餐 packageConfig -->
        <el-dialog class="formDialog"
                   :title="title"
                   :visible="visible"
                   :close-on-click-modal="false"
                   width="424px"
                   @close="closeDialog">
            <el-form class="FormConfig"
                     :model="params" label-position="left" ref="baseForm"
                     @submit.native.prevent="submitHandler()"
                     :label-width="labelWidth ? (labelWidth + 'px') : ''"
                     size="mini"
            >
                <el-row>
                    <el-col :span="24"  v-for="(form, index) in forms" :key="form.prop">
                        <el-form-item
                                :prop="form.prop"
                                :label="form.label" :rules="form.rules || []"
                        >
                            <el-select v-if="form.itemType === 'select'"
                                       v-model="params[form.prop]"
                                       size="mini"
                                       :disabled="form.disabled || form.isEdit === false"
                                       :placeholder="'请选择' + form.label"
                                       :clearable="form.clearable"
                                       @change="form.change && form.change($event)">
                                <el-option v-for="(option, optionIndex) in form.options" :key="optionIndex + '_local'"
                                           :value="(typeof option === 'object') ? option[form.valueKey || 'value'] : option"
                                           :label="(typeof option === 'object') ? option[form.labelKey || 'label'] : option" />
                            </el-select>
                            <el-input-number v-else-if="form.itemType === 'inputNumber'"
                                             v-model="params[form.prop]"
                                             size="mini"
                                             :disabled="form.disabled || form.isEdit === false"
                                             controls-position="right"
                                             :controls="form.controls"
                                             :precision="0"
                                             :min="0"
                                             :max="form.max || 99999999"
                                             :placeholder="form.placeholder"
                            >
                                <template v-if="form.append" slot="append">{{form.append}}</template>
                            </el-input-number>
                            <el-input v-else-if="form.itemType === 'input'|| form.itemType === 'textarea'"
                                      :type="form.itemType"
                                      v-model="params[form.prop]"
                                      :size="form.size"
                                      :placeholder="'请输入' + form.label"
                                      resize="none"
                                      clearable
                                      :maxlength="form.maxlength || 200"
                            >
                                <!--:style="form.select && {width: '84%'}"-->
                                <template v-if="form.append" slot="append">{{form.append}}</template>
                            </el-input>
                            <!--<el-button v-if="form.select" type="primary" @click="form.select">选</el-button>-->
                        </el-form-item>
                    </el-col>
                    <p class="tip" v-if="this.referenceAmount">
                        提示：该套餐年服务费参考金额 <span style="color: #f00;">{{this.referenceAmount}}</span>元
                    </p>

                </el-row>
                <div class="footer">
                    <el-button size="mini" @click="closeDialog">取消</el-button>
                    <el-button type="primary" size="mini" @click="submitHandler" :loading="loading">提交</el-button>
                </div>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
    import {
        searchServicePackage, // 搜索
        queryTenantEdit, // 新增或者编辑客户信息
    } from "@/api/clientMn";
    import {getDeepValue} from '@/utils/commonUtil'

    export default {
        name: 'PackageDialog',
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            formData: {
                type: Object,
                default: () => {
                }
            }
        },
        data() {
            const {formData} = this.$props;
            let params = {}
            const forms = [
                {
                    prop: 'servicePackageId',
                    label: '套餐名称',
                    itemType: 'select',
                    labelKey: 'name',
                    valueKey: 'id', // 参考金额
                    options: [],
                    change: (res) => {
                        // console.log(res, 'res.......... 套餐id...')
                        let obj = this.servicePackageList.find(({id}) => {
                            return id === res
                        }) || {}
                        // 格式化展示：
                        this.referenceAmount = (+obj.referenceAmount).toLocaleString('zh', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); // todo...
                        const {smsCount, storageSize, userCount, id: servicePackageId} = obj;
                        // console.log(smsCount, storageSize, userCount, servicePackageId, 'smsCount, storageSize, userCount, servicePackageId')
                        this.params = {...this.params, smsCount, storageSize, userCount}  //  选中套餐后 重置套餐配置的params数据
                    }
                },
                { // 选人
                    prop: 'userCount',
                    label: '用户数量（人）',
                    itemType: 'inputNumber',
                    // itemType: 'input',
                    // append: '人'
                },
                {
                    prop: 'smsCount',
                    label: '短信数量（条）',
                    itemType: 'inputNumber',
                    // itemType: 'input',
                    // append: '条'
                },
                {
                    prop: 'storageSize',
                    label: '存储空间（GB）',
                    itemType: 'inputNumber',
                    // itemType: 'input',
                    // append: 'GB'
                },
                {
                    prop: 'servicePackageRemarks',
                    label: '套餐备注',
                    itemType: 'textarea',
                    autosize: {minRows: 3, maxRows: 6},
                },
            ]
            forms.forEach((v, i) => {
                const _prop = v.prop,
                    propType = typeof _prop;
                if (propType === 'string') {
                    params[_prop] = formData[_prop]; // 数据初始化
                    if (v.itemType === 'upload') {
                        params[_prop] = params[_prop] || []; // 变成数组
                    }
                }
            })
            return {
                params,
                // 配置弹窗
                title: '配置服务套餐',
                labelWidth: 110,
                loading: false,
                forms,
                formOptions: {
                    submitBtnText: '提交',
                    showCancelBtn: true,
                },
                servicePackageList: [],
                referenceAmount: '',
                servicePackageName: ''
            }
        },
        created() {
            searchServicePackage().then((res) => {
                const servicePackageList = getDeepValue(res, ['data', 'data', 'rows']) || []
                this.servicePackageList = servicePackageList;
                // console.log(servicePackageList, '套餐列表shuju')
                this.$set(this.forms[0], 'options', servicePackageList)
            })
        },
        watch: {
            formData: {
                handler: function (newData, oldData) {
                    this.changeFormData(newData)
                },
                // deep: true
            },
        },
        methods: {
            closeDialog() {
                this.changeDialog(false)
            },
            changeDialog(bool) {
                this.$emit("update:visible", bool)
            },
            changeFormData(formData) {
                const {
                        forms
                    } = this,
                    params = {};
                forms.forEach((v, i) => {
                    const _prop = v.prop,
                        propType = typeof _prop;
                    if (propType === 'string') {
                        params[_prop] = formData[_prop]; // 数据初始化
                    }
                })
                this.params = params;
            },
            submitHandler() {
                this.$refs['baseForm'].validate((valid, errObj) => {
                    if (valid) {
                        const { params, format } = this
                        this.formDialogSubmit(params)
                    } else {
                        console.error(errObj)
                    }
                })
            },
            // 表单弹窗 提交
            formDialogSubmit(params) {
                this.loading = true;
                const submitParams = {...this.formData , ...params, servicePackageName: this.servicePackageName}
                queryTenantEdit(submitParams).then(res => {
                    const {success, message} = res.data;
                    if (success) {
                        this.$message.success('请求处理成功');
                        this.changeDialog(false); // 关闭按钮
                        this.$emit('packageSubmitCallBack'); // 触发操作成功的回调
                    } else {
                        this.$message.error(message);
                    }
                })
                this.loading = false;
            },
        }
    }
</script>

<style lang='scss' scoped>
    .FormConfig {
        .el-input-number {
            width: 100%;
        }
        .footer {
            padding-top: 10px;
            border-top: 1px solid #dcdfe6;
            text-align: right;
        }
        .el-col {
            border-bottom: 0;
        }
    }
    .tip {
        padding-left: 80px;
        color: #aaa;
    }
</style>
