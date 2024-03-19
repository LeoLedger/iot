<template>
    <!-- 后期可能会做优化 __ temptemptemp _ lanceJiang -->
    <el-form
        ref="baseForm"
        :class="['FormConfig', hasDefaultFormClass && 'defaultFormWrapClass', formWrapClass, {disabled: disabled}]"
        :model="params"
        :label-position="labelPosition"
        :label-width="labelWidth ? (labelWidth + 'px') : ''"
        :size="size"
        :rules="(isEdit && !disabled) ? rules : null"
        @submit.native.prevent="submitHandler()"
    >
        <el-row :class="{scroll: scroll}" class="form_wrap">
            <template v-for="(form, index) in forms" >
                <el-col
                    v-if="form.visible !== false"
                    :key="index"
                    :span="form.span || span"
                    :xs="form.xs || xs"
                >
                    <el-form-item
                        :prop="form.prop"
                        :label="form.label"
                        :rules="getRules(form)"
                        :label-width="form.labelWidth ? (form.labelWidth + 'px') : ''"
                    >
                        <span
                            slot="label"
                            :class="form.label ? '' : 'labelHidden' "
                        >{{ form.label || '- -' }}</span>

                        <!-- 判断整体表单是否编辑状态 -->
                        <!-- 处于编辑状态 没有编辑权限的 form disabled为true -->
                        <template v-if="isEdit">
                            <template v-if="form.prependRender">
                                <ExpandDom
                                    :render="form.prependRender"
                                />
                            </template>
                            <div class="form-item-body">
                                <div v-if="!form.label" style="height: 28px;" />
                                <!-- :disabled="form.disabled || form.isEdit === false" 表示： 在不允许编辑的情况 disabled为false -->
                                <el-tooltip
                                    v-else-if="form.itemType === 'input'|| form.itemType === undefined"
                                    :value="!!(form.tooltipVisible && form.tooltipContent)"
                                    :content="form.tooltipContent"
                                    effect="light"
                                    manual
                                    placement="top-start"
                                >
                                    <span @click="handleInputClick(form)">
                                        <el-input
                                            :prefix-icon="form.prefixIcon"
                                            :suffix-icon="form.suffixIcon"
                                            :value="getInputValue(form)"
                                            :type="getDisabled(form) ? 'text' : form.type"
                                            :size="form.size ? form.size : size"
                                            :readonly="form.readonly"
                                            :disabled="getDisabled(form)"
                                            :placeholder="getPlaceholder(form)"
                                            :style="itemStyle + (form.itemWidth ? `width: ${form.itemWidth}px;` : '')"
                                            :clearable="getDefaultValue(form.clearable, !form.rules)"
                                            :maxlength="form.maxlength || 200"
                                            :show-password="form.showPassword"
                                            :autocomplete="form.autocomplete"
                                            :class="{link: getIsClick(form)}"
                                            @focus="form.focus && form.focus(params[form.prop], $event)"
                                            @blur="form.blur && form.blur(params[form.prop], $event)"
                                            @input="handleInput($event, form)"
                                            @change="form.change && form.change($event, params, form)"
                                        >
                                            <template v-if="form.prepend" slot="prepend">{{ form.prepend }}</template>
                                            <template v-if="form.append" slot="append">{{ form.append }}</template>
                                        </el-input>
                                    </span>
                                </el-tooltip>
                                <el-select
                                    v-else-if="form.itemType === 'select'"
                                    v-model="params[form.prop]"
                                    :size="form.size ? form.size : size"
                                    :disabled="getDisabled(form)"
                                    :placeholder="getPlaceholder(form)"
                                    :style="itemStyle + (form.itemWidth ? `width: ${form.itemWidth}px;` : '')"
                                    :clearable="getDefaultValue(form.clearable, !form.rules)"
                                    @change="handleChange($event, form)"
                                >
                                    <!-- select 通过 change事件更改 params 需要把当前的params  拿到外面做操作 合并成新的对象然后 更新 formData -->
                                    <el-option
                                        v-for="(option, optionIndex) in form.options"
                                        :key="optionIndex + '_local'"
                                        :value="(typeof option === 'object') ? option[form.valueKey || 'value'] : option"
                                        :label="(typeof option === 'object') ? option[form.labelKey || 'label'] : option"
                                    />
                                </el-select>
                                <el-switch
                                    v-else-if="form.itemType === 'switch'"
                                    v-model="params[form.prop]"
                                    :size="form.size ? form.size : size"
                                    :disabled="getDisabled(form)"
                                    :active-color="getDefaultValue(form.activeColor, '#13ce66')"
                                    :active-text="getDefaultValue(form.activeText, '')"
                                    :active-value="getDefaultValue(form.activeValue, true)"
                                    :inactive-color="getDefaultValue(form.inactiveColor, '#ff4949')"
                                    :inactive-text="getDefaultValue(form.inactiveText, '')"
                                    :inactive-value="getDefaultValue(form.inactiveValue, false)"
                                    :width="form.itemWidth"
                                    @change="handleChange($event, form)"
                                />
                                <el-radio-group
                                    v-else-if="form.itemType === 'radio'"
                                    v-model="params[form.prop]"
                                    :size="form.size ? form.size : size"
                                    :disabled="getDisabled(form)"
                                    :style="itemStyle + (form.itemWidth ? `width: ${form.itemWidth}px;` : '')"
                                    @change="handleChange($event, form)"
                                >
                                    <template v-for="(option, optionIndex) in form.options">
                                        <el-radio
                                            v-if="option.visible !== false"
                                            :key="optionIndex + '_local'"
                                            :label="(typeof option === 'object') ? option[form.valueKey || 'value'] : option"
                                            :disabled="option.disabled || form.disabled"
                                        >
                                            {{ (typeof option === 'object') ? option[form.labelKey || 'label'] : option }}
                                        </el-radio>
                                    </template>
                                </el-radio-group>
                                <el-date-picker
                                    v-else-if="form.itemType === 'date'"
                                    v-model="params[form.prop]"
                                    :placeholder="getPlaceholder(form)"
                                    :size="form.size ? form.size : size"
                                    :disabled="getDisabled(form)"
                                    :readonly="form.readonly"
                                    :editable="form.editable"
                                    :clearable="getDefaultValue(form.clearable, !form.rules)"
                                    :style="itemStyle + (form.itemWidth ? `width: ${form.itemWidth}px;` : '')"
                                    :format="form.format || 'yyyy-MM-dd'"
                                    :value-format="form.valueFormat || 'yyyy-MM-dd HH:mm:ss'"
                                    :picker-options="form.pickerOptions || {}"
                                    type="date"
                                    @change="handleChange($event, form)"
                                />
                                <el-date-picker
                                    v-else-if="form.itemType === 'daterange'"
                                    v-model="params[form.prop]"
                                    :size="form.size ? form.size : size"
                                    :disabled="getDisabled(form)"
                                    :readonly="form.readonly"
                                    :editable="form.editable"
                                    :clearable="getDefaultValue(form.clearable, !form.rules)"
                                    :style="itemStyle + (form.itemWidth ? `width: ${form.itemWidth}px;` : '')"
                                    :range-separator="form.rangeSeparator || '至'"
                                    :start-placeholder="form.startPlaceholder || '开始日期'"
                                    :end-placeholder="form.endPlaceholder || '结束日期'"
                                    :format="form.format || 'yyyy-MM-dd'"
                                    :value-format="form.valueFormat || 'yyyy-MM-dd HH:mm:ss'"
                                    :default-time="form.defaultTime || ['00:00:00', '23:59:59']"
                                    :picker-options="form.pickerOptions || {}"
                                    type="daterange"
                                    @change="handleChange($event, form)"
                                />
                                <el-input-number
                                    v-else-if="form.itemType === 'inputNumber'"
                                    v-model="params[form.prop]"
                                    :size="form.size ? form.size : size"
                                    :disabled="getDisabled(form)"
                                    :controls-position="form.controlsPosition || 'right'"
                                    :class="form.className"
                                    :controls="form.controls"
                                    :precision="form.precision || 0"
                                    :min="form.min"
                                    :max="form.max"
                                    :clearable="getDefaultValue(form.clearable, !form.rules)"
                                    :placeholder="getPlaceholder(form)"
                                    :style="itemStyle + (form.itemWidth ? `width: ${form.itemWidth}px;` : '')"
                                />
                                <!-- 级联选择器 -->
                                <el-cascader
                                    v-else-if="form.itemType === 'cascader'"
                                    v-model="params[form.prop]"
                                    :size="form.size ? form.size : size"
                                    :disabled="getDisabled(form)"
                                    :placeholder="getPlaceholder(form)"
                                    :style="itemStyle + (form.itemWidth ? `width: ${form.itemWidth}px;` : '')"
                                    :show-all-levels="form.showAllLevels"
                                    :options="form.options"
                                    :props="{ checkStrictly: true }"
                                    :clearable="getDefaultValue(form.clearable, !form.rules)"
                                    filterable
                                    @change="handleChange($event, form)"
                                />
                                <TextArea
                                    v-else-if="form.itemType === 'textarea'"
                                    :form="form"
                                    :params="params"
                                    :disabled="getDisabled(form)"
                                    :placeholder="getPlaceholder(form)"
                                />
                                <MoneyInput
                                    v-else-if="form.itemType === 'moneyInput'"
                                    :value="params[form.prop]"
                                    :form="form"
                                    :params="params"
                                    :disabled="getDisabled(form)"
                                    :class="{link: getIsClick(form)}"
                                    :placeholder="getPlaceholder(form)"
                                    @input="handleInput($event, form)"
                                    @blur="handleBlur($event, form)"
                                    @click="handleInputClick"
                                />
                                <OnlyShowItem
                                    v-else-if="form.itemType === 'onlyshow'"
                                    :form="form"
                                    :params="params"
                                    :form-data="formData"
                                />
                                <Upload
                                    v-else-if="form.itemType === 'upload'"
                                    :form="form"
                                    :params="params"
                                    :is-edit="!disabled && !form.disabled"
                                    @success="handleChange($event, form)"
                                />
                                <ImageUpload
                                    v-else-if="form.itemType === 'imageUpload'"
                                    :form="form"
                                    :params="params"
                                    :disabled="getDisabled(form)"
                                />
                                <AddressInput
                                    v-else-if="form.itemType === 'addressInput'"
                                    v-model="params"
                                    :form="form"
                                    :size="form.size ? form.size : size"
                                    :disabled="getDisabled(form)"
                                    :placeholder="getPlaceholder(form)"
                                    :style="itemStyle + (form.itemWidth ? `width: ${form.itemWidth}px;` : '')"
                                    show-map-types
                                    @change="handleChange($event, form)"
                                />
                                <!-- 弹窗选择器 -->
                                <DialogPick
                                    v-else-if="form.itemType === 'dialogPick'"
                                    v-model="params"
                                    :type="form.type"
                                    :params="form"
                                    :disabled="getDisabled(form)"
                                    :placeholder="getPlaceholder(form)"
                                    @change="handleChange($event, form)"
                                    @clear="handleClear($event, form)"
                                />
                                <!-- 字典选择器 -->
                                <DictSelect
                                    v-else-if="form.itemType === 'dictSelect'"
                                    v-model="params[form.prop]"
                                    :type="form.type"
                                    :size="getDefaultValue(form.size, size)"
                                    :exclude="form.exclude"
                                    :label-key="form.labelKey"
                                    :value-key="form.valueKey"
                                    :disabled="getDisabled(form)"
                                    :clearable="getDefaultValue(form.clearable, !form.rules)"
                                    :filterable="getDefaultValue(form.filterable, true)"
                                    :placeholder="getPlaceholder(form)"
                                    @change="handleChange($event, form)"
                                />
                                <!-- 远程搜索选择器 -->
                                <RemoteSelect
                                    v-else-if="form.itemType === 'remoteSelect'"
                                    v-model="params[form.prop]"
                                    :method="form.method"
                                    :label-key="form.labelKey"
                                    :value-key="form.valueKey"
                                    :page-size="form.pageSize"
                                    :allow-create="form.allowCreate"
                                    :filter-label-key="form.filterLabelKey"
                                    :filter-value-key="form.filterValueKey"
                                    :disabled="getDisabled(form)"
                                    :clearable="getDefaultValue(form.clearable, !form.rules)"
                                    :placeholder="getPlaceholder(form)"
                                    :has-page-demanding="form.hasPageDemanding"
                                    :default-select-first="form.defaultSelectFirst"
                                    @change="handleChange($event, form)"
                                />
                                <!--  区域级联选择器 -->
                                <RegionCascader
                                    v-else-if="form.itemType === 'regionCascader'"
                                    v-model="params[form.prop]"
                                    :size="form.size ? form.size : size"
                                    :disabled="getDisabled(form)"
                                    :placeholder="getPlaceholder(form)"
                                    :style="itemStyle + (form.itemWidth ? `width: ${form.itemWidth}px;` : '')"
                                    :show-all-levels="form.showAllLevels"
                                    :clearable="getDefaultValue(form.clearable, !form.rules)"
                                    @change="handleChange($event, form)"
                                />
                                <!-- 仓库选择器 -->
                                <WarehouseCascader
                                    v-else-if="form.itemType === 'warehouseCascader'"
                                    :type="form.type"
                                    :form-data="params"
                                    :stock-key="form.prop"
                                    :place-key="form.placeKey"
                                    :type-id-key="form.typeIdKey"
                                    :excludes="form.excludes"
                                    :size="form.size ? form.size : size"
                                    :disabled="getDisabled(form)"
                                    :placeholder="getPlaceholder(form)"
                                    :style="itemStyle + (form.itemWidth ? `width: ${form.itemWidth}px;` : '')"
                                    :clearable="getDefaultValue(form.clearable, !form.rules)"
                                    :can-select-stock="form.canSelectStock"
                                    @change="handleChange($event, form)"
                                />
                            </div>
                            <template v-if="form.appendRender">
                                <ExpandDom
                                    :render="form.appendRender"
                                />
                            </template>
                        </template>
                        <!-- 非编辑状态下 且有label 才展示 -->
                        <template v-else-if="form.label">
                            <template v-if="form.formatter">
                                <span
                                    :style="form.style"
                                    class="text"
                                    v-html="form.formatter(params, formData)"
                                />
                            </template>
                            <template v-else>
                                <span
                                    v-if="form.itemType === 'select'"
                                    :style="form.style"
                                    class="text"
                                >{{ getSelectOptionValue(params[form.prop], form) }}</span>
                                <span
                                    v-else-if="form.itemType === 'daterange'"
                                    :style="form.style"
                                    class="text"
                                >{{ (params[form.prop] && params[form.prop].join(' 至 ')) || '- -' }}</span>
                                <span
                                    v-else-if="form.itemType === 'inputNumber'"
                                    :style="form.style"
                                    class="text"
                                >
                                    <!-- number类型默认赋值 -->
                                    {{ typeof (params[form.prop]) === 'number' && (params[form.prop]).toLocaleString('zh', { minimumFractionDigits: 2 }) || '- -' }}
                                </span>
                                <Upload
                                    v-else-if="form.itemType === 'upload'"
                                    :form="form"
                                    :is-edit="false"
                                    :params="params"
                                />
                                <ImageUpload
                                    v-else-if="form.itemType === 'imageUpload'"
                                    :form="form"
                                    :is-edit="false"
                                    :params="params"
                                />
                                <DialogPick
                                    v-else-if="form.itemType === 'dialogPick'"
                                    v-model="params"
                                    :type="form.type"
                                    :params="form"
                                    only-show
                                />
                                <DictSelect
                                    v-else-if="form.itemType === 'dictSelect'"
                                    v-model="params[form.prop]"
                                    :type="form.type"
                                    only-show
                                />
                                <span
                                    v-else
                                    :style="form.style"
                                    class="text"
                                    @click="detailClick(form.prop, form.click)"
                                >{{ params[form.prop] || '- -' }}</span>
                            </template>
                        </template>
                    </el-form-item>
                </el-col>
            </template>
        </el-row>
        <div v-if="showFooter" class="footer">
            <el-button
                v-if="showResetBtn"
                :plain="true"
                :size="size"
                type="primary"
                @click="resetForm"
            >{{ resetBtnText }}</el-button>
            <el-button v-if="showCancelBtn" :size="size" @click="cancel">{{ cancelBtnText }}</el-button>
            <el-button
                :size="size"
                :loading="submitLoading"
                type="primary"
                @click="submitHandler"
            >{{ submitBtnText }}</el-button>
        </div>
        <!-- 详情弹窗 -->
        <PublicDetailDialog
            v-if="publicDetailDialogVisible"
            v-bind="publicDetailDialog"
            :visible.sync="publicDetailDialogVisible"
        />
    </el-form>
</template>

<script>
    import { isEmpty, getPriceFormat } from '@/utils'
    import pickTypes from '@/components/SelectDialog/types'

    import TextArea from './customizeFormItem/TextArea'
    import OnlyShowItem from './customizeFormItem/OnlyShowItem'
    import Upload from './customizeFormItem/Upload'
    import ImageUpload from './customizeFormItem/ImageUpload'
    import AddressInput from './customizeFormItem/AddressInput'
    import MoneyInput from '@/components/customizeFormItem/MoneyInput'
    import WarehouseCascader from '@/components/customizeFormItem/WarehouseCascader'

    const determine = function(value, params) {
        switch (typeof value) {
        case 'boolean':
            return value
        case 'function':
            return value(params)
        }
    }
    const sizeValidator = value => {
        const methodTypes = ['large', 'small', 'mini']
        const valid = methodTypes.indexOf(value) !== -1 || value === ''
        if (!valid) {
            console.error('Size must be one of [\'large\', \'small\', \'mini\']')
        }
        return valid
    }
    const ExpandDom = {
        functional: true,
        props: {
            render: Function
        },
        render: (h, ctx) => {
            return ctx.props.render(h, ctx)
        }
    }

    export default {
        name: 'FormConfig',
        components: {
            MoneyInput,
            TextArea,
            OnlyShowItem,
            Upload,
            ImageUpload,
            AddressInput,
            ExpandDom,
            WarehouseCascader
        },
        props: {
            forms: {
                type: Array,
                required: true
            },
            rules: {
                type: Object,
                default: () => ({})
            },
            disabled: {
                type: Boolean,
                default: false
            },
            formData: {
                // 后台传递的初始值 对象 【后期拿操作的表单数据  请使用 submit 的params】
                type: Object,
                default: () => {
                    return {}
                }
            }, // 后台传递过来的 数据
            size: {
                type: String,
                default: 'mini',
                validator: sizeValidator
            },
            scroll: {
                type: Boolean,
                default: true
            },
            labelPosition: {
                type: String, // right/left/top
                default: 'right'
            },
            labelWidth: Number,
            itemWidth: Number, // 具体输入框 内容宽度（eg: input/select/radio... 支持 具体像素 可能导致不兼容 手机端 不太建议使用）
            hasDefaultFormClass: {
                type: Boolean,
                default: false
            },
            formWrapClass: {
                type: String,
                default: ''
            },
            span: {
                type: Number,
                default: 24
            },
            xs: {
                type: Object,
                default: () => {
                    return {
                        span: 24
                    }
                }
            },
            showFooter: {
                type: Boolean,
                default: true
            },
            submit: Function,
            submitLoading: {
                type: Boolean,
                default: false
            },
            submitBtnText: {
                type: String,
                default: '提交'
            },
            showCancelBtn: {
                type: Boolean,
                default: false
            },
            cancel: {
                type: Function,
                default: function() {
                    console.warn('请输入 cancel 函数')
                }
            },
            cancelBtnText: {
                type: String,
                default: '取消'
            },
            showResetBtn: {
                type: Boolean,
                default: false
            },
            resetBtnText: {
                type: String,
                default: '重置'
            },
            isEdit: {
                type: Boolean,
                default: true
            },
            isAssessment: {
                type: Boolean,
                default: false
            },
            groupId: {
                type: Number
            }
        },
        data() {
            return {
                params: {},
                format: {},
                pickTypes: Object.keys(pickTypes),
                publicDetailDialog: {},
                publicDetailDialogVisible: false
            }
        },
        computed: {
            itemStyle() {
                const { itemWidth } = this
                if (itemWidth) {
                    return `width: ${itemWidth}px;`
                }
                return ''
            }
        },
        watch: {
            formData: {
                handler(newData) {
                    this.changeFormData(newData)
                }
            }
        },
        mounted() {
            this.changeFormData(this.$props.formData)

            var format = {}
            // 遍历 集成format对象
            this.$props.forms.forEach((v) => {
                var { prop, format: _format } = v
                if (typeof v.format === 'function') {
                    format[prop] = _format
                }
            })
            this.format = format
        },
        methods: {
            getIsClick(form) {
                return this.getDisabled(form) && !isEmpty(this.params[form.prop]) ? form.isClick : false
            },
            getDisabled(form) {
                return form.disabled || this.disabled || form.isEdit === false
            },
            getInputValue(form) {
                var value = this.params[form.prop]
                if (form.itemType === 'input') {
                    if (this.disabled || form.disabled) {
                        switch (form.format) {
                        case 'money':
                            if (!['', null, undefined].includes(value)) {
                                return getPriceFormat(value, form.digit)
                            }
                        }
                    }
                }
                if (this.getDisabled(form)) {
                    return isEmpty(value) ? '- -' : value
                } else {
                    return value
                }
            },
            getPlaceholder(form) {
                if (!form.itemType || this.disabled || form.disabled) {
                    return '- -'
                }
                let itemType = form.itemType.toLocaleLowerCase()
                if (form.itemType && (itemType.indexOf('input') > -1)) {
                    return this.getDefaultValue(form.placeholder, '请输入' + form.label)
                } else {
                    return this.getDefaultValue(form.placeholder, '请选择' + form.label)
                }
            },
            // 如果传入的value为undefined，则返回传入的defaultValue，否则返回value
            getDefaultValue(value, defaultValue) {
                return value === void 0 ? defaultValue : value
            },
            // 更新选人组件的 提交参数 // 若为单选 返回一个对象 多选 返回一个数组对象 提交关键字{id, userName}
            updateSelectUserParam({ value, key, isChooseMore } = {}) {
                // isChooseMore  isChooseMore
                // console.log(value, key, isChooseMore, 'value, key, isChooseMore...');
                const selectUsers = value && (isChooseMore ? value : value[0]) // 如果是单选 选取数组的第一个值  多选则传递该数组
                // console.log(selectUsers, 'selectUsers')
                this.params[key] = selectUsers
            },
            changeFormData(formData) {
                const { forms } = this
                const params = {}
                const bindProps = []
                forms.forEach((v, i) => {
                    const _prop = v.prop
                    const propType = typeof _prop
                    const props = v.props // 绑定的其他数据
                    if (propType === 'string') {
                        params[_prop] = formData[_prop]
                        switch (v.itemType) {
                        case 'upload':
                        case 'cascader':
                        case 'daterange':
                            params[_prop] = params[_prop] || []
                            break
                        default:
                            // 如果是弹窗选择器组件，把formData上属性名formKey的赋值给params
                            if (v.itemType === 'dialogPick' && v.formKey) {
                                var keys = Array.isArray(v.formKey) ? v.formKey : [v.formKey]
                                keys.forEach(key => {
                                    params[key] = formData[key]
                                })
                            } else if (v.itemType === 'warehouseCascader') {
                                params[v.placeKey] = formData[v.placeKey]
                                if (v.typeIdKey) {
                                    params[v.typeIdKey] = formData[v.typeIdKey]
                                }
                            }
                            break
                        }
                    }
                    // 若该formItem  包含forms列表中未定义的prop 需要从formData取值
                    if (Array.isArray(props)) {
                        bindProps.push(...props)
                    }
                })
                // 赋值其他被绑的的值
                bindProps.map(prop => {
                    params[prop] = formData[prop] // 被绑定的其他数据初始化
                })
                this.params = params
                this.$nextTick(() => {
                    this.$emit('ready', this.params)
                })
            },
            isArray(value) {
                return (
                    typeof value === 'object' &&
                    Object.prototype.toString.call(value) === '[object Array]'
                )
            },
            submitHandler(submitCallback, errorCallback) {
                if (!this.disabled && this.isEdit) {
                    this.getParams((error, params) => {
                        if (!error) {
                            // debugger;
                            // 若在父级组件使用 自定义的操作按钮， 可调用callback函数 作为提交操作
                            if (typeof submitCallback === 'function') {
                                return submitCallback(params)
                            }
                            const { submit } = this
                            if (submit) {
                                submit(params)
                            } else {
                                console.error('请添加 submit 方法')
                            }
                        } else {
                            errorCallback(error, params)
                            console.warn(
                                error,
                                '错误rule数组.... 如果需要对该错误数组 操作 请在此处添加'
                            )
                            // eg:
                            /* var errObj = error;
                        // 提示弹窗的 示例代码
                        var keys = Object.keys(errObj);
                        console.log(errObj[keys[0]], 'errObj[keys[0]]');
                        var errTipObj = (errObj[keys[0]][0] || {});
                        debugger;
                        if (errTipObj.message) {
                            this.$message.error(errTipObj.message)
                        }*/
                        }
                    })
                } else {
                    if (submitCallback) {
                        submitCallback(this.params)
                    } else {
                        this.submit && this.submit(this.params)
                    }
                }
            },
            getRules(form) {
                if (!this.getDisabled(form)) {
                    if (Array.isArray(form.validatePremise)) {
                        // 验证前提，如果配置了validatePremise，会判断formData中属性名为配置的prop是否存在配置includes内，
                        // 只有存在才会返回验证规则
                        if (form.validatePremise.findIndex(item => item.includes.indexOf(this.params[item.prop]) === -1) > -1) {
                            return
                        }
                    }
                    if (form.itemType === 'imageUpload') {
                        return this.rules[form.props[0]] || []
                    }
                    return form.rules || []
                }
            },
            validate(callback) {
                this.$refs['baseForm'].validate((valid, err) => {
                    callback && callback(valid, err)
                })
            },
            getParams(callback) {
                this.validate((valid, errObj) => {
                    const { params, format, forms } = this
                    const formattedForm = {} // 最后提交后台使用的params对象
                    forms.forEach(form => {
                        var key = form.prop
                        if (['imageUpload'].indexOf(form.itemType) === -1) {
                            formattedForm[key] = format[key] ? format[key](params[key], key) : params[key]
                        }
                        if (form.itemType === 'input' && form.type === 'number') {
                            formattedForm[key] = Number(formattedForm[key])
                        } else if (form.itemType === 'dialogPick' && form.formKey) {
                            var keys = Array.isArray(form.formKey) ? form.formKey : [form.formKey]
                            keys.forEach(key => {
                                formattedForm[key] = params[key]
                            })
                        } else if (form.itemType === 'warehouseCascader') {
                            formattedForm[form.placeKey] = params[form.placeKey]
                            if (form.typeIdKey) {
                                formattedForm[form.typeIdKey] = params[form.typeIdKey]
                            }
                        }
                        // 对含有 其他prop的数据 赋值
                        if (Array.isArray(form.props)) {
                            form.props.map(_key => {
                                formattedForm[_key] = params[_key]
                            })
                        }
                    })
                    if (valid) {
                        if (callback) callback(null, formattedForm)
                    } else {
                        // console.error(errObj, 'errObj..................')
                        if (callback) callback(errObj, formattedForm)
                    }
                })
            },
            resetForm(isAsync) {
                // 是否异步 传入的 formData 重置
                if (isAsync) {
                    // 由于 formData 从父级传入后 内部并没有直接使用 固可用做 重置功能
                    this.changeFormData(this.formData)
                } else {
                    this.$refs['baseForm'].resetFields()
                }
            },
            getSelectOptionValue(value, form) {
                // console.log(value, form, 'getSelectOptionValue')
                var labelKey = form.labelKey || 'label',
                    valueKey = form.valueKey || 'value'
                return (
                    ((form.options || []).find(item => {
                        // 写全等于 需要注意 eg: 比如 列表的id 为 string 返回的dataForm为 number 的情况   【目前后台未统一 数据类型】
                        return item[valueKey] == value
                    }) || {})[labelKey] || '- -'
                )
            },
            setItemData(value, defaultValue) {
                if (typeof value !== 'boolean' && typeof value !== 'number') {
                    return value || defaultValue
                }
                return value
            },
            detailClick(prop, clickCallBack) {
                if (typeof clickCallBack === 'function') {
                    // console.log('可以触发 当前  点击回调')
                    const formData = JSON.parse(JSON.stringify(this.formData))
                    clickCallBack(prop, formData)
                }
            },
            // 组件输入时触发
            handleInput($event, form) {
                this.params[form.prop] = $event
                if (typeof form.input === 'function') {
                    form.input($event, this.params, form)
                }
            },
            // 组件改变时触发
            handleChange($event, form) {
                if (typeof form.change === 'function') {
                    form.change($event, this.params, form)
                }
            },
            handleBlur($event, form) {
                if (typeof form.blur === 'function') {
                    form.blur($event, this.params, form)
                }
            },
            handleClear($event, form) {
                if (typeof form.clear === 'function') {
                    form.clear($event, this.params, form)
                }
            },
            // 点击input组件时触发
            handleInputClick(form) {
                if (this.getIsClick(form)) {
                    var params = {
                        data: this.params,
                        config: form
                    }
                    if (determine(form.isClick, params) && !isEmpty(this.params[form.prop])) {
                        var key = form.idKey || 'guidId'
                        var type = form.dialogType
                        if (typeof form.dialogType === 'function') {
                            type = form.dialogType(params)
                        }
                        if (type) {
                            var extendParams = form.extendParams || {}
                            if (typeof extendParams === 'function') {
                                extendParams = form.extendParams(params)
                            }
                            this.publicDetailDialog = {
                                type,
                                dataId: extendParams.dataId || this.formData[key],
                                extendParams
                            }
                            this.publicDetailDialogVisible = true
                        }
                        form.onClick && form.onClick(params)
                    }
                }
            }
        }
    }

/**
 * eg:  示例  实例参考 TestForm.vue
 */
/* <FormConfig
        ref="configForm"
        :forms="formOptions.forms" // 遍历formItem 的数组
        :formData="formOptions.formData" // 初始化 form数据
        :size="formOptions.size" // form size, 默认 mini
        :labelPosition='right/left/top' // label位置 textAlign 默认 right
        :labelWidth="formOptions.labelWidth" // formLabel 宽度 // 除此之外可以 用 class类名更改
        :itemWidth="formOptions.itemWidth" // formItem 中 input/select 的 width
        :hasDefaultFormClass='Boolean'// 是否展示 默认的 formClass 默认 false
        :formWrapClass='formWrapClassTest'// form 类名 在父级添加 类的样式
        :span="formOptions.span" // formItem 的 col 属性 默认 24
        :xs="formOptions.xs" // formItem col 在 手机端的 span 对象 默认 {span: 20}
        :showFooter="Boolean" // 是否展示 操作按钮 // 默认 true
        :submit="submit" // form 表单提交使用： 会传递 form 对应的值
        :submit-loading="loading" // 提交按钮点击提交使用 loading
        :submitBtnText="formOptions.submitBtnText" // 提交按钮 text

        :showCancelBtn="formOptions.showCancelBtn" // 是否展示取消按钮
        :cancel="close" // 取消按钮点击操作
        :cancelBtnText="String" // 取消按钮 text

        :showResetBtn="formOptions.showResetBtn" // 是否展示重置按钮
        :resetBtnText="formOptions.resetBtnText" // 取消按钮 text

        :isEdit="formOptions.isEdit" // 是否以 纯展示方式 展示数据 //(不可编辑) // 需要传递的 参数也最少

        />

        var formOptions = {
            // resetBtnText: 'resetBtnText',
            showResetBtn: true,
            showCancelBtn: true,
            labelWidth: 80,
            // span: 24,
            // xs: {
            //     span: 24
            // },
            // itemWidth: 200, // 默认 表单元素的宽度
            forms: [
            {
                prop: '邮件标题',
                label: '邮件标题',
                itemType: 'input',
                // span: 11,
                // xs: {span: 20}
            },
            { // 选人
                prop: '传阅人员',
                label: '传阅人员',
                itemType: 'select',
                options: [
                    // '小三', '请选择传阅人员'
                    {value: '', label: '请选择传阅人员'},
                    {value: 0, label: '小三'},
                    {value: 1, label: '小四'}
                ]
            },
            {
                prop: '邮件内容',
                label: '邮件内容',
                itemType: 'textarea',
                autosize: {minRows: 3, maxRows: 6},
                numLimit: 300,
                textAreaInput: function (input) {
                    console.log(input, "prop   textAreaInput")
                },
                rules: [
                    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
                    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
                ]
            }
        ]
    }*/
</script>

<style scoped lang="scss">
$themeColor: #ebeef5;
$themeBgColor: #f9f9f9;
// $themeColor: #c7def6;
// $themeBgColor: #e7f1fe;
.FormConfig {
    .form_wrap.scroll {
        max-height: 80vh;
        overflow-y: auto;
    }
    .form-item-body {
        flex: 1;
    }
    &.disabled {
        /deep/ {
            .el-form-item--mini.el-form-item,
            .el-form-item--small.el-form-item {
                margin-bottom: 10px;
            }
        }
    }
    /deep/ {
        .text {
            margin-left: 5px;
        }
        .el-input.link {
            input {
                cursor: pointer;
                color: #409eff;
                &:hover {
                    text-decoration:underline
                }
            }
        }
        .money-input.link {
          input {
            cursor: pointer;
            color: #409eff;
            &:hover {
              text-decoration:underline
            }
          }
        }
        .footer {
            padding-top: 10px;
            border-top: 1px solid #dcdfe6;
            text-align: right;
        }
        .el-col {
            /*padding: 10px 10px 0 0 !important;*/
            border-bottom: 0;
        }
        .labelHidden {
            color: transparent;
        }
        .el-input-group__append {
            border-radius: 0;
        }
        .el-row {
            display: flex;
            flex-wrap: wrap;
        }
        .el-select,
        .el-input-number,
        .el-cascader,
        .el-date-editor.el-input {
            // date 样式
            width: 100%;
        }
        .el-form-item__error {
            left: 5px;
        }
        .el-date-editor--daterange {
            &.el-input__inner {
                // dateRange样式
                height: 28px;
                width: 100%;
            }
        }
        .el-col-24 {
            .el-form-item__label {
                width: 16.67%;
            }
            .el-form-item__content {
                margin-left: 16.67%;
            }
        }
        /* '选'字样式 */
        .el-input__suffix {
            right: 0;
        }
        // 给inputNumber 添加的样式类名
        .textCenter .el-input__inner {
            text-align: center;
        }
        > .form_wrap > .el-col > .el-form-item > .el-form-item__content {
            display: flex;
            align-items: center;
            padding: 0 5px;
        }
    }
}
/* 如果表单有其他的 样式 可参照此处修改 来更改类名 在父级调用 写class 请用 父级类 包裹 */
.defaultFormWrapClass {
    border: 1px solid $themeColor;
    border-bottom: 0;
    /deep/ {
        .form_wrap {
            display: flex;
            flex-wrap: wrap;
            > .el-col {
                border-bottom: 1px solid $themeColor !important;
                flex: 0 0 auto;
                > .el-form-item {
                    background-color: $themeBgColor;
                    margin-bottom: 0;
                    border-bottom: 1px solid $themeColor;
                    height: 100%;
                    &:last-child {
                        border-bottom: 0;
                    }
                    > .el-form-item__label {
                        width: 33.33333%;
                        color: #444;
                        vertical-align: middle;
                    }
                    > .el-form-item__content {
                        margin-left: 33.33333%;
                        border-left: 1px solid $themeColor;
                        background: #fff;
                        height: 100%; /* old End */
                        .el-input__suffix {
                            right: 15px;
                        }
                        .el-input__prefix {
                            left: 15px;
                        }
                        /* inputNumber样式 */
                        &.el-input-number {
                            .el-input__inner {
                                text-align: left;
                            }
                            .el-input-number__decrease,
                            .el-input-number__increase {
                                right: 11px;
                            }
                        }
                        > .el-form-item__error {
                            // 给错误提示更改位置
                            /*transform: translate(0, -18px);*/
                            transform: translate(0, -12px);
                            top: auto;
                        }
                        .areaItem .showNum {
                            // 兼容自定义 textArea组件的 数字展示
                            /*bottom: -14px;
                                right: 5px;*/
                            bottom: -18px;
                            right: 10px;
                        }
                    }
                }
            }
        }
        @media only screen and (max-width: 767px) {
            // 兼容手机端 样式
            .el-row {
                .el-col-12 {
                    &:nth-last-child(2) {
                        border-bottom: 1px solid $themeColor !important;
                    }
                }
            }
        }
    }
}
</style>
