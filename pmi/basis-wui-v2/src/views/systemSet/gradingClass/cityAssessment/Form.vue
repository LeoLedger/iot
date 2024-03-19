<!--
* @description 表单
* @author 姜庆博
!-->
<template>
    <el-form class="FormConfig"
             :model="params" label-position="right" ref="baseForm"
             @submit.native.prevent="submitHandler()"
             :label-width="labelWidth ? (labelWidth + 'px') : ''"
             size="mini"
    >
        <el-row>
            <el-col v-for="(form, index) in forms" :span="form.span || 12" :key="form.prop">
                <template v-if="form.itemType === 'select' && isTopNode"><span/></template>
                <el-form-item
                        v-else
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
                                   :label="(typeof option === 'object') ? option[form.labelKey || 'label'] : option"/>
                    </el-select>
                    <el-input-number v-else-if="form.itemType === 'inputNumber'"
                                     v-model="params[form.prop]"
                                     size="mini"
                                     :disabled="form.disabled || form.isEdit === false"
                                     :controls-position="form.controlsPosition || 'right'"
                                     :class="form.className"
                                     :controls="form.controls"
                                     :precision="form.precision || 0"
                                     :min="0"
                                     :max="form.max || 99999999"
                                     :placeholder="form.placeholder"
                    >
                        <template v-if="form.append" slot="append">{{form.append}}</template>
                    </el-input-number>
                    <el-input v-else-if="form.itemType === 'input'|| form.itemType === 'textarea'"
                              :type="form.itemType"
                              v-model="params[form.prop]"
                              :disabled="form.disabled || form.isEdit === false"
                              :size="form.size"
                              :placeholder="'请输入' + form.label"
                              resize="none"
                              clearable
                              :maxlength="form.maxlength || 200"
                    >
                        <template v-if="form.append" slot="append">{{form.append}}</template>
                    </el-input>
                    <el-cascader v-else-if="form.itemType === 'cascader'"
                                 v-model="params[form.prop]"
                                 :size="form.size"
                                 :disabled="form.disabled || form.isEdit === false"
                                 :placeholder="form.placeholder || '请选择' + form.label"
                                 clearable
                                 filterable
                                 :show-all-levels="form.showAllLevels"
                                 :options="form.options"
                                 @change="form.change && form.change"
                                 :props="{ checkStrictly: true }"
                    />
                </el-form-item>
            </el-col>
        </el-row>
        <div class="footer" v-if="isShowFooter">
            <el-button size="mini" @click="closeDialog">取消</el-button>
            <el-button type="primary" size="mini" @click="submitHandler" :loading="loading">提交</el-button>
        </div>
    </el-form>
</template>

<script>
    import {
        editSysClass, // 编辑 / 新增
    } from "@/api/systemSet/SysClass";
    import {classLevelEnum} from '@/utils/enum'
    import { PARENT_ID, classLevel } from './config'
    const [_, smallClass] = classLevel
    const defaultForms = [
        {
            prop: 'name',
            label: '分类名称',
            itemType: 'input',
            span: 24,
            rules: [{required: true, message: "分类名称", trigger: "blur"}],
        }, { // [1]
            prop: 'code',
            label: '分类编号',
            itemType: 'input',
            isEdit: false
        }, { // [2]
            prop: 'parentIdStr',
            label: '上级分类', // option
            itemType: 'cascader',
            options: [],
            showAllLevels: false,
            // isEdit: false
        }, { // [3]
            prop: 'sort',
            label: '分类排序',
            itemType: 'inputNumber',
            controlsPosition: 'none',
            className: 'textCenter',
            unPrecision: true,
            rules: [{required: true, message: "请输入分类排序", trigger: ['blur', 'change']}],
        }, { // [4]
            prop: 'type',
            label: '分类级别',
            itemType: 'select',
            options: classLevelEnum,
            rules: [{required: true, message: "请选择分类级别", trigger: "change"}],
            // isEdit: false // 不许编辑为 大小类
        },
    ]

    const smallType = [
        {
            prop: 'deduction',
            label: '扣分标准(分)',
            itemType: 'inputNumber',
            precision: 1,
        }, {
            prop: 'chargebacks',
            label: '扣款标准(元)',
            itemType: 'inputNumber',
            precision: 2,
        }, {
            prop: 'performanceAssess',
            label: '考核标准',
            itemType: 'textarea',
            span: 24,
            rules: [{required: true, message: "请输入考核标准", trigger: "blur"}]
        }]
    const bigType = [{
        prop: 'remarks',
        label: '备注',
        itemType: 'textarea',
        span: 24,
        rules: [{required: true, message: "请输入备注", trigger: "blur"}]
    }]
    export default {
        name: 'Form',
        props: {
            formData: {
                type: Object,
                default: () => {
                    return {}
                }
            },
            isShowFooter: {
                type: Boolean,
                default: false
            },
            isEdit: { // 大小类 类型 是否可编辑
                type: Boolean,
                default: false
            },
            isFormBasic: {
                type: Boolean,
                default: false
            },
            treeData: {
                type: Array,
                default: () => []
            },
            isTopNode: {
                type: Boolean,
                default: false
            },
        },
        data() {
            const {formData} = this.$props;
            let params = {}
            const forms = defaultForms.concat(formData.type === smallClass && smallType || [], bigType)

            forms.forEach((v, i) => {
                const _prop = v.prop,
                    propType = typeof _prop;
                if (propType === 'string') {
                    params[_prop] = formData[_prop]; // 数据初始化
                    if (v.itemType === 'upload') {
                        params[_prop] = params[_prop] || []; // 变成数组
                    } else if (v.itemType === 'cascader') { // 级联数据为数组
                        params[_prop] = params[_prop] || []; // 变成数组  // 若不是数组 怎么操作
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
            this.$set(this.forms[4], 'change', (res) => {
                if (res === smallClass) { // classLevelEnum   14003: 小类
                    this.forms = defaultForms.concat(smallType, bigType)
                } else {
                    this.forms = defaultForms.concat(bigType)
                }
                this.changeFormData({...this.formData, ...this.params})
            })
        },
        watch: {
            formData: {
                handler: function (newData, oldData) {
                    if (newData.type === smallClass) {
                        this.forms = defaultForms.concat(smallType, bigType)
                    } else {
                        this.forms = defaultForms.concat(bigType)
                    }
                    if(!newData.sort) {
                        newData.sort = 0
                    }
                    this.changeFormData(newData)
                },
                // deep: true
            },
            forms: {
                immediate: true,
                handler(newData) {
                    if(this.isEdit) { // 是否编辑状态
                        if(this.isFormBasic) {
                            this.$set(this.forms[4], 'isEdit', false);
                            // this.$set(this.forms[2], 'isEdit', false);
                        }
                    } else {
                        this.$set(this.forms[4], 'isEdit', true); // 大类可编辑
                    }
                }
            },
            treeData:{ // 被选中的分类
                immediate: true,
                handler(newData) {
                    // console.warn(JSON.stringify(newData), '添加分类')
                    this.$set(this.forms[2], 'options', newData)
                }
            },
            isTopNode: {
                immediate: true,
                handler(newData) {
                    if(newData) {
                        this.forms.forEach((form, index) => {
                            this.$set(this.forms[index], 'isEdit', false)
                        })
                    } else {
                        this.forms.forEach((form, index) => {
                            // 分类编号  上级分类   分类级别
                            if(index === 1 /*|| index === 2 || index === 4 */  ) {
                                return
                            }
                            this.$set(this.forms[index], 'isEdit', true)
                        })
                    }
                }
            },
            isEdit: {
                immediate: true,
                handler(newData) {
                    /*if(newData) { // 在编辑 状态: 不许更改上级分类
                        this.$set(this.forms[2], 'isEdit', false);
                    } else {
                        this.$set(this.forms[2], 'isEdit', true);
                    }*/
                }
            },
        },
        methods: {
            closeDialog() {
                this.changeDialog(false)
            },
            changeDialog(bool) {
                this.$emit("updateVisible", bool)
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
                        const {params, format} = this
                        this.formDialogSubmit(params)
                    } else {
                        console.error(errObj)
                    }
                })
            },
            // 表单弹窗 提交
            formDialogSubmit(params) {
                const submitParams = {
                    ...this.formData,
                    ...params,
                    typeEnum: 2, // 目前这个字段写死 之前这个字段用于 提交 车类型用的
                }
                submitParams.parentId = params.parentIdStr.slice(-1)[0] || PARENT_ID
                if (params.parentIdStr.includes(submitParams.id)) {
                    this.$message.error('修改的上级分类不可以是自己本身 或 本身的子级')
                    return
                }
                this.loading = true
                editSysClass(submitParams).then(res => {
                    const {success, message} = res.data;
                    if (success) {
                        this.$message.success('请求处理成功');
                        this.changeDialog(false); // 关闭按钮
                        this.$emit('editSubmitCallBack'); // 触发操作成功的回调
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

        /deep/ .textCenter .el-input__inner {
            text-align: center;
        }
    }
</style>
