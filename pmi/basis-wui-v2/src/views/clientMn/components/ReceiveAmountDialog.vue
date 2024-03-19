<!--
* @description
* @fileName list.vue
* @author 姜庆博
* @date 2019/06/17 17:57:44
* @version V1.0.0
!-->
<template>
    <div>
        <!-- 添加收款 ReceiveAmountDialog -->
        <el-dialog class="formDialog"
                   :title="title"
                   :visible="visible"
                   :close-on-click-modal="false"
                   width="500px"
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
                            <template v-if="form.itemType === 'selectInput'">
                                <el-input v-model="params[form.prop].label" size="mini" readonly
                                          :placeholder="'请选择' + form.label" style="width: 86%;">
                                </el-input>
                                <el-button type="primary" :disabled="form.isEdit === false" @click="selectContract(form)">选</el-button>
                            </template>
                            <el-select v-if="form.itemType === 'select'"
                                       v-model="params[form.prop]" size="mini"
                                       :disabled="form.disabled || form.isEdit === false"
                                       :placeholder="'请选择' + form.label">
                                <el-option v-for="(option, optionIndex) in form.options" :key="optionIndex + '_local'"
                                           :value="option[form.valueKey || 'value']"
                                           :label="option[form.labelKey || 'label']" />
                            </el-select>
                            <el-date-picker
                                    v-else-if="form.itemType === 'datePicker'"
                                    :disabled="form.disabled || form.isEdit === false"
                                    value-format="yyyy-MM-dd"
                                    v-model="params[form.prop]"
                                    type="date" size="mini" placeholder="选择日期">
                            </el-date-picker>
                            <el-input-number v-else-if="form.itemType === 'inputNumber'"
                                             v-model="params[form.prop]"
                                             size="mini"
                                             :disabled="form.disabled || form.isEdit === false"
                                             controls-position="right"
                                             :controls="form.controls"
                                             :precision="form.precision || 0" :min="0" :max="form.max"
                                             :placeholder="form.placeholder || '请输入' + form.label"
                                             @blur="form.blur && form.blur(params[form.prop])"
                            />
                            <el-input v-else-if="form.itemType === 'input'|| form.itemType === 'textarea'"
                                      :type="form.itemType"
                                      v-model="params[form.prop]"
                                      :size="form.size"
                                      :placeholder="'请输入' + form.label"
                                      :autosize="form.autosize"
                                      resize="none"
                                      clearable
                                      :maxlength="form.maxlength || 200"
                            >
                                <!--:style="form.select && {width: '84%'}"-->
                                <template v-if="form.append" slot="append">{{form.append}}</template>
                            </el-input>
                            <Upload v-else-if="form.itemType === 'upload'"
                                    :form="form"
                                    :params="params"/>
                            <p class="tip" v-if="form.showTip && referenceAmount">
                                提示：合同未收款<span style="color: #f00;">{{referenceAmount}}</span>元
                            </p>
                        </el-form-item>
                    </el-col>
                </el-row>
                <div class="footer">
                    <el-button size="mini" @click="closeDialog">取消</el-button>
                    <el-button type="primary" size="mini" @click="submitHandler" :loading="loading">提交</el-button>
                </div>
            </el-form>
        </el-dialog>
        <!-- 选择合同 -->
        <SelectContractDialog
                v-if="selectContractVisible"
                v-bind:visible.sync="selectContractVisible"
                v-bind="$attrs"
                @updateSelectContract="updateSelectContract"/>
    </div>
</template>

<script>
    import {
        getSurplusAmount, // 查询未收款
        addContractPayPlan, // 新增收款
    } from "@/api/clientMn";
    import {getDeepValue} from '@/utils/commonUtil'
    import Upload from "@/components/customizeFormItem/Upload"
    import SelectContractDialog from "./SelectContractDialog"

    export default { // 收款 接收ReceiveAmount 金额
        name: 'ReceiveAmountDialog',
        components: {
            Upload,
            SelectContractDialog,
        },
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            formData: {
                type: Object,
                default: () => {
                    return {}
                }
            },
            canSelectedContract: {
                type: Boolean,
                default: true
            }
        },
        data() {
            const {formData, canSelectedContract} = this.$props;
            let params = {}
            const forms = [
                {
                    prop: 'contractObj',
                    label: '对应合同',
                    // itemType: 'select',
                    itemType: 'selectInput',
                    isEdit: canSelectedContract,
                    showTip: true
                },
                {
                    prop: 'gatheringDate',
                    label: '收款日期',
                    itemType: 'datePicker', // date
                },
                {
                    prop: 'gatheringName',
                    label: '收款人',
                    itemType: 'input',
                },
                { // [3]
                    prop: 'gatheringAmount',
                    label: '收款金额（元）',
                    itemType: 'inputNumber',
                    precision: 2
                },
                {
                    prop: 'remarks',
                    label: '备注说明',
                    itemType: 'textarea',
                    autosize: {minRows: 3, maxRows: 6},
                },
                {
                    prop: 'files',
                    label: '附件',
                    itemType: 'upload',
                },
            ]
            forms.forEach((v, i) => {
                const _prop = v.prop,
                    propType = typeof _prop;
                if (propType === 'string') {
                    params[_prop] = formData[_prop]; // 数据初始化
                    if (v.itemType === 'upload') {
                        params[_prop] = params[_prop] || []; // 变成数组
                    } else if(v.itemType === 'selectInput') {
                        params[_prop] = params[_prop] || {label: '', value: ''}; // 变成对象
                    }
                }
            })
            return {
                params,
                // 配置弹窗
                title: '添加收款',
                labelWidth: 110,
                loading: false,
                forms,
                referenceAmount: '',
                surplusAmount: 0, // 未收款余额 （输入限制）

                selectContractVisible: false, // 选合同 弹窗
            }
        },
        created() {
            const {formData} = this;
            if(Object.keys(formData).length) {
                this.querySurplusAmount(formData)
            }
        },
        watch: {
            formData: {
                handler: function (newData, oldData) {
                    this.changeFormData(newData)
                },
                // deep: true
            },
            /*forms: {
                handler: function (newData, oldData) {
                    console.log(JSON.stringify(newData))
                    console.error( JSON.stringify(oldData))
                    this.changeFormData(this.formData)
                },
            }*/
        },
        methods: {
            closeDialog() {
                this.changeDialog(false)
            },
            changeDialog(bool) {
                this.$emit("update:visible", bool)
            },
            changeFormData(formData) {
                const {forms} = this,
                    params = {};
                // console.log(formData, 'formData0000000000000000000000000  set..........')
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
                const submitParams = {...this.formData , ...params}
                addContractPayPlan(submitParams).then(res => {
                    const {success, message} = res.data;
                    if (success) {
                        this.$message.success('请求处理成功');
                        this.changeDialog(false); // 关闭按钮
                        this.$emit('amountSubmitCallBack'); // 触发操作成功的回调
                    } else {
                        this.$message.error(message);
                    }
                })
                this.loading = false;
            },
            selectContract(form) {
                this.selectContractVisible = true
                console.error(JSON.stringify(form), 'form'); // active
                this.ACTIVE_PROP = form.prop;
            },
            updateSelectContract(obj) {
                // console.log(obj , '更新的 合同选择 ACTIVE_PROP')
                const {code, id} = obj;
                const result = {label: code, value: id}
                this.$set(this.params, this.ACTIVE_PROP, result); // 展示用
                this.$set(this.params, 'contractId', id); // 提交用
                this.querySurplusAmount({contractId: id}); // 根据合同id 查询 合同未收款
            },
            querySurplusAmount(formData) {
                getSurplusAmount(formData).then((res) => {
                    // console.log(res.data, 'res............. 合同未收款  金额.... 查询数据')
                    const amount = getDeepValue(res, ['data', 'data'])
                    this.surplusAmount = amount;
                    // this.$set(this.forms[3], 'max',amount); // 限制 输入
                    this.$set(this.forms[3], 'blur',(value) => {
                        if(value > amount) {
                            this.$message.warning('输入金额大于未收款，被置为未收款的最大值');
                            this.$set(this.params, 'gatheringAmount', amount)
                        }
                    }); // 限制 输入
                    this.referenceAmount = (+amount).toLocaleString('zh', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                })
            }
        }
    }
</script>

<style lang='scss' scoped>
    .FormConfig {
        .el-input-number,
        .el-date-editor,
        .el-select{
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
        margin: 0;
        color: #aaa;
    }
</style>
