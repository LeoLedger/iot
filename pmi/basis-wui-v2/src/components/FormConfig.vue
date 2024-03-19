<template>
    <el-form
        ref="baseForm"
        :class="['FormConfig', hasDefaultFormClass && 'defaultFormWrapClass', formWrapClass]"
        :model="params"
        :label-position="labelPosition"
        :label-width="labelWidth ? (labelWidth + 'px') : ''"
        :size="size"
        @submit.native.prevent="submitHandler()"
    >
        <el-row>
            <el-col v-for="(form, index) in forms" :key="index" :span="form.span || span" :xs="form.xs || xs">
                <el-form-item
                    :prop="form.prop"
                    :label="form.label"
                    :rules="form.rules || []"
                    :label-width="form.labelWidth ? (form.labelWidth + 'px') : ''"
                >
                    <span slot="label" :class="form.label ? '' : 'labelHidden' ">{{ form.label || '- -' }}</span>
                    <!-- 判断整体表单是否编辑状态 -->
                    <!-- 处于编辑状态 没有编辑权限的 form disabled为true -->
                    <template v-if="isEdit">
                        <div v-if="!form.label" style="height: 29px;" />
                        <!-- :disabled="form.disabled || form.isEdit === false" 表示： 在不允许编辑的情况 disabled为false -->
                        <el-input
                            v-else-if="form.itemType === 'input'|| form.itemType === undefined"
                            v-model="params[form.prop]"
                            :prefix-icon="form.prefixIcon"
                            :suffix-icon="form.suffixIcon"
                            :size="form.size ? form.size : size"
                            :readonly="form.readonly"
                            :disabled="form.disabled || form.isEdit === false"
                            :placeholder="form.placeholder || '请输入' + form.label"
                            :style="itemStyle + (form.itemWidth ? `width: ${form.itemWidth}px;` : '')"
                            :clearable="form.clearable"
                            :maxlength="form.maxlength || 200"
                            @blur="form.blur && form.blur(params[form.prop], params)"
                        >
                            <template v-if="form.prepend" slot="prepend">
                                {{ form.prepend }}
                            </template>
                            <template v-if="form.append">
                                <template v-if="form.click">
                                    <!-- 添加点击事件... -->
                                    <el-button slot="append" :icon="form.appendIcon" @click="form.click(params[form.prop])">
                                        {{ form.appendTxt }}
                                    </el-button>
                                </template>
                                <!-- 纯展示后缀名 -->
                                <template v-else slot="append">
                                    {{ form.append }}
                                </template>
                            </template>
                        </el-input>
                        <el-select
                            v-else-if="form.itemType === 'select'"
                            v-model="params[form.prop]"
                            :size="form.size ? form.size : size"
                            :disabled="form.disabled || form.isEdit === false"
                            :placeholder="form.placeholder || '请选择' + form.label"
                            :style="itemStyle + (form.itemWidth ? `width: ${form.itemWidth}px;` : '')"
                            :clearable="form.clearable"
                        >
                            <el-option
                                v-for="(option, optionIndex) in form.options"
                                :key="optionIndex + '_local'"
                                :value="(typeof option === 'object') ? option[form.valueKey || 'value'] : option"
                                :label="(typeof option === 'object') ? option[form.labelKey || 'label'] : option"
                            />
                            <!--<el-option v-for="(op, opIndex) in selectOptions[selectOptionPrefix + index]" :key="opIndex + '_remote'"
                                       :value="(typeof op === 'object') ? op[form.valueKey || 'value'] : op"
                                       :label="(typeof op === 'object') ? op[form.labelKey || 'label'] : op" />-->
                        </el-select>
                        <el-radio-group
                            v-else-if="form.itemType === 'radio'"
                            v-model="params[form.prop]"
                            :size="form.size ? form.size : size"
                            :disabled="form.disabled || form.isEdit === false"
                            :style="itemStyle + (form.itemWidth ? `width: ${form.itemWidth}px;` : '')"
                        >
                            <el-radio
                                v-for="(option, optionIndex) in form.options"
                                :key="optionIndex + '_local'"
                                :label="(typeof option === 'object') ? option[form.valueKey || 'value'] : option"
                                :disabled="option.disabled || form.disabled"
                            >
                                {{ (typeof option === 'object') ? option[form.labelKey || 'label'] : option }}
                            </el-radio>
                        </el-radio-group>
                        <el-date-picker
                            v-else-if="form.itemType === 'date'"
                            v-model="params[form.prop]"
                            type="date"
                            :placeholder="form.placeholder"
                            :size="form.size ? form.size : size"
                            :disabled="form.disabled || form.isEdit === false"
                            :readonly="form.readonly"
                            :editable="form.editable"
                            :style="itemStyle + (form.itemWidth ? `width: ${form.itemWidth}px;` : '')"
                            :value-format="form.valueFormat || 'yyyy-MM-dd'"
                            :picker-options="form.pickerOptions || {}"
                        />
                        <el-date-picker
                            v-else-if="form.itemType === 'daterange'"
                            v-model="params[form.prop]"
                            :size="form.size ? form.size : size"
                            type="daterange"
                            :disabled="form.disabled || form.isEdit === false"
                            :readonly="form.readonly"
                            :editable="form.editable"
                            :style="itemStyle + (form.itemWidth ? `width: ${form.itemWidth}px;` : '')"
                            :range-separator="form.rangeSeparator"
                            :start-placeholder="form.startPlaceholder || '开始日期'"
                            :end-placeholder="form.endPlaceholder || '结束日期'"
                            :value-format="form.valueFormat || 'yyyy-MM-dd'"
                            :picker-options="form.pickerOptions || {}"
                            @change="date => changeDate(date, (form.startKey || `${form.prop}Start'`), (form.endKey || `${form.prop}End`))"
                        />
                        <el-input-number
                            v-else-if="form.itemType === 'inputNumber'"
                            v-model="params[form.prop]"
                            :size="form.size ? form.size : size"
                            :disabled="form.disabled || form.isEdit === false"
                            :controls-position="form.controlsPosition || 'right'"
                            :class="form.className"
                            :controls="form.controls"
                            :precision="!form.unPrecision && 2 || 0"
                            :min="form.min"
                            :max="form.max"
                            :placeholder="form.placeholder"
                            :style="itemStyle + (form.itemWidth ? `width: ${form.itemWidth}px;` : '')"
                        />
                        <!-- 级联选择器 -->
                        <el-cascader
                            v-else-if="form.itemType === 'cascader'"
                            v-model="params[form.prop]"
                            :size="form.size ? form.size : size"
                            :disabled="form.disabled || form.isEdit === false"
                            :placeholder="form.placeholder || '请选择' + form.label"
                            :style="itemStyle + (form.itemWidth ? `width: ${form.itemWidth}px;` : '')"
                            clearable
                            filterable
                            :show-all-levels="form.showAllLevels"
                            :options="form.options"
                            :props="{ checkStrictly: true }"
                            @change="form.change && form.change"
                        />
                        <TextArea
                            v-else-if="form.itemType === 'textarea'"
                            :form="form"
                            :params="params"
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
                        />
                        <!--
                        <SelectUser v-else-if="form.itemType === 'selectUser'"
                                    :form="form"
                                    :params="params"
                                    @updateSelectUserParam="updateSelectUserParam"
                        />
                        &lt;!&ndash; 仅做测试使用  v-model功能...  &ndash;&gt;
                        <TestItem v-else-if="form.itemType === 'test'"
                                  :form="form"
                                  :params="params"
                        />-->
                    </template>
                    <!-- 非编辑状态下 且有label 才展示 -->
                    <template v-else-if="form.label">
                        <template v-if="form.formatter">
                            <span class="text" v-html="form.formatter(params[form.prop])" />
                        </template>
                        <template v-else>
                            <span v-if="form.itemType === 'select'" class="text">
                                <!-- 仅支持返回也是对象的情况 -->
                                <!--{{params[form.prop][form.labelKey || 'label'] || '- -'}}-->
                                <!-- 根据对应的valueKey labelKey 取值 -->
                                {{ getSelectOptionValue(params[form.prop], form) }}
                            </span>
                            <span v-else-if="form.itemType === 'inputNumber'" class="text">
                                <!-- number类型默认赋值 -->
                                {{
                                    typeof (+params[form.prop]) === 'number'
                                        && (+params[form.prop]).toLocaleString('zh', { minimumFractionDigits: 2 })
                                        || '- -' }}</span>
                            <span v-else class="text">{{ params[form.prop] || '- -' }}</span>
                        </template>
                    </template>
                </el-form-item>
            </el-col>
        </el-row>
        <div v-if="showFooter" class="footer">
            <el-button
                v-if="showResetBtn"
                type="primary"
                :plain="true"
                :size="size"
                @click="resetForm"
            >
                {{ resetBtnText }}
            </el-button>
            <el-button
                v-if="showCancelBtn"
                :size="size"
                @click="cancel"
            >
                {{ cancelBtnText }}
            </el-button>
            <el-button
                type="primary"
                :size="size"
                :loading="submitLoading"
                @click="submitHandler"
            >
                {{ submitBtnText }}
            </el-button>
        </div>
    </el-form>
</template>

<script>
    import TextArea from './customizeFormItem/TextArea'
    import Upload from './customizeFormItem/Upload'
    import OnlyShowItem from './customizeFormItem/OnlyShowItem'

    // import SelectUser from "./customizeFormItem/SelectUser"
    // import TestItem from "./customizeFormItem/TestItem"
    const sizeValidator = (value) => {
        const methodTypes = ['large', 'small', 'mini']
        const valid = methodTypes.indexOf(value) !== -1 || value === ''
        if (!valid) {
            console.error('Size must be one of [\'large\', \'small\', \'mini\']')
        }
        return valid
    }

    export default {
        name: 'FormConfig',
        components: {
            TextArea,
            Upload,
            OnlyShowItem
            // SelectUser,
            // TestItem
        },
        props: {
            forms: {
                type: Array,
                required: true
                // label: String,
                // prop: {
                //   type: [String, Array],
                //   required: true
                // },
                // itemType: {
                //   type: String,
                //   default: 'input',
                //   validator: itemTypeValidator
                // },
                // size: {
                //   type: String,
                //   default: '',
                //   validator: sizeValidator
                // },
                // placeholder: {
                //   type: String,
                //   default: ''
                // },
                // editable: {
                //   type: Boolean,
                //   default: true
                // },
                // disabled: {
                //   type: Boolean,
                //   default: false
                // },
                // readonly: {
                //   type: Boolean,
                //   default: false
                // },
                // options: Array,
                // selectFetch: Function,
                // selectResultField: String,
                // selectResultHandler: Function,
                // selectUrl: String,
                // selectMethod: String,
                // valueKey: String,
                // labelKey: String,
                // format: Function,
                // selectParams: {
                //   type: Object,
                //   default: () => {
                //     return {}
                //   }
                // },
                // rules: Array,
                // pickerOptions: Object
            },
            formData: { // 后台传递的初始值 对象 【后期拿操作的表单数据  请使用 submit 的params】
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
            /* inline: {
                type: Boolean,
                default: false
            },*/
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
            }
        },
        data() {
            const { forms, formData } = this.$props
            const _this = this
            const selectOptionPrefix = 'select-option-prefix'
            /* let dataObj = {
                selectOptions: {},
            }*/
            const params = {}
            const format = {}
            forms.forEach((v, i) => {
                const _prop = v.prop
                const propType = typeof _prop
                if (propType === 'string') {
                    // console.log(formData, 'formData[_prop] ');
                    params[_prop] = this.setItemData(formData[_prop]) // 数据初始化
                    if (v.itemType === 'daterange') {
                        const startKey = v.startKey || _prop + 'Start'
                        const endKey = v.endKey || _prop + 'End'
                        const hasDate = formData[startKey] && formData[endKey]
                        // 仅当 初始日期 和 结束日期 都有的情况下 才赋值 prop值
                        // （只有一个值时，存在 rangeDate不展示对应数据，点选日期 也被置回1970年 的问题）
                        params[_prop] = hasDate ? [formData[startKey], formData[endKey]] : ''
                        // params[_prop] = [formData[startKey] || '', formData[endKey] || ''];
                    } else if (v.itemType === 'cascader') { // 级联数据为数组
                        params[_prop] = params[_prop] || [] // 变成数组  // 若不是数组 怎么操作
                    } else if (v.itemType === 'upload') {
                        params[_prop] = params[_prop] || [] // 变成数组
                    }
                    // format 函数是用作 最后获取getParams 时， 转化为后台需要的 参数类型
                    if (v.format) {
                        format[_prop] = v.format
                    }
                } else if (_this.isArray(_prop)) {
                    _prop.forEach(vv => {
                        // format 函数是用作 最后获取getParams 时， 转化为后台需要的 参数类型
                        params[vv] = formData[vv] || ''
                        if (v.format) {
                            format[vv] = v.format
                        }
                    })
                }
                /* if (v.itemType === 'select' && (v.selectFetch || v.selectUrl)) {
                    const dataKey = selectOptionPrefix + i
                    dataObj.selectOptions[dataKey] = []
                    const { $axios } = this
                    if (!v.selectMethod) {
                        v.selectMethod = 'get'
                    }
                    this.getRemoteData({
                        fetch: v.selectFetch ? v.selectFetch : () => {
                            return $axios[v.selectMethod](v.selectUrl, v.selectMethod.toLowerCase() === 'get' ?
                                { params: v.selectParams } : v.selectParams)
                        },
                        dataKey,
                        resultField: v.selectResultField || 'result',
                        resultHandler: v.selectResultHandler
                    })
                }*/
            })

            // console.log('result,params', params)
            return {
                params,
                selectOptionPrefix,
                format
                // ...dataObj,
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
                handler: function(newData, oldData) {
                    // console.warn(newData, oldData, 'newFormData, oldFormData  formData 发生改变 ...');
                    this.changeFormData(newData)
                }
                // deep: true // 是否深度监测 formData 属性 (可以不使用 请别使用)
            },
            forms: {
                handler(newForms, oldForms) {
                    console.error(newForms, oldForms, 'newForms, oldForms') // 当form发生改变 需要更改 当前的遍历表单 todo...
                }
                // deep: true // 是否深度监测 formData 属性 (可以不使用 请别使用)
            }
        },
        methods: {
            // 更新选人组件的 提交参数 // 若为单选 返回一个对象 多选 返回一个数组对象 提交关键字{id, userName}
            updateSelectUserParam({ value, key, isChooseMore } = {}) { // isChooseMore  isChooseMore
                // console.log(value, key, isChooseMore, 'value, key, isChooseMore...');
                const selectUsers = value && (isChooseMore ? value : value[0]) // 如果是单选 选取数组的第一个值  多选则传递该数组
                // console.log(selectUsers, 'selectUsers')
                this.params[key] = selectUsers
            },
            changeFormData(formData) {
                const {
                    forms
                } = this
                const _this = this
                const params = {}
                forms.forEach((v, i) => {
                    const _prop = v.prop
                    const propType = typeof _prop
                    if (propType === 'string') {
                        params[_prop] = formData[_prop] // 数据初始化
                        if (v.itemType === 'daterange') {
                            const startKey = v.startKey || _prop + 'Start'
                            const endKey = v.endKey || _prop + 'End'
                            const hasDate = formData[startKey] && formData[endKey]
                            params[_prop] = hasDate ? [formData[startKey], formData[endKey]] : ''
                        }
                    } else if (_this.isArray(_prop)) {
                        _prop.forEach(vv => {
                            params[vv] = formData[vv] || ''
                        })
                    }
                })
                this.params = params
            },
            isArray(value) {
                return typeof value === 'object' && Object.prototype.toString.call(value) === '[object Array]'
            },
            submitHandler(submitCallback) {
                this.getParams((error, params) => {
                    if (!error) {
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
                        console.warn(error, '错误rule数组.... 如果需要对该错误数组 操作 请在此处添加')
                    }
                })
            },
            getParams(callback) {
                this.$refs['baseForm'].validate((valid, errObj) => {
                    if (valid) {
                        const { params, format, forms } = this
                        const formattedForm = {} // 最后提交后台使用的params对象

                        /* Object.keys(params).forEach(key => {
                            if (key) {
                                // 对应的form 内部设置有 format 函数的值做提交前的最后操作 fn(value, key)
                                formattedForm[key] = format[key] ? format[key](params[key], key) : params[key]
                            }
                        })*/

                        // forms
                        forms.forEach(form => {
                            const key = form.prop
                            if (key) {
                                // 对应的form 内部设置有 format 函数的值做提交前的最后操作 fn(value, key)
                                if (form.itemType === 'daterange' && form.isSplit) { // isSplit: 若 时间区间 是拆分 传递给后台的话...
                                    const startKey = form.startKey || key + 'Start'
                                    const endKey = form.endKey || key + 'End'
                                    const [startDate, endDate] = params[key]
                                    formattedForm[startKey] = startDate
                                    formattedForm[endKey] = endDate
                                } else {
                                    formattedForm[key] = format[key] ? format[key](params[key], key) : params[key]
                                }
                            }
                        })
                        if (callback) callback(null, formattedForm)
                    } else {
                        // console.error(errObj, 'errObj..................')
                        if (callback) callback(errObj)
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
            changeDate(date, startDate, endDate) {
                console.error(date, startDate, endDate, 'date, startDate, endDate')
                let dates
                if (date === null) {
                    this.params[startDate] = ''
                    this.params[endDate] = ''
                    return
                }
                if (typeof date === 'string') {
                    dates = date.split(' - ')
                } else if (date && date.hasOwnProperty('length')) {
                    // const firstDate = date[0]
                    // const secondDate = date[1]
                    dates = date
                }

                this.params[startDate] = dates[0]
                this.params[endDate] = dates[1]
            },
            /* getRemoteData({ fetch, dataKey, resultField, resultHandler }) {
                fetch().then(response => {
                    let result = response
                    if (typeof response === 'object' && !this.isArray(response)) {
                        if (resultField.indexOf('.') !== -1) {
                            resultField.split('.').forEach(vv => {
                                result = result[vv]
                            })
                        } else {
                            result = response[resultField]
                        }
                    }

                    if (!result || !(result instanceof Array)) {
                        console.warn(`The result of key:${resultField} is not Array. 接口返回的字段:${resultField} 不是一个数组`)
                    }

                    if (this.resultHandler) {
                        this.selectOptions[dataKey] = result.map(this.resultHandler)
                    } else {
                        this.selectOptions[dataKey] = result
                    }
                })
            },*/
            getSelectOptionValue(value, form) {
                // console.log(value, form, 'getSelectOptionValue')
                var labelKey = form.labelKey || 'label'; var valueKey = form.valueKey || 'value'
                return ((form.options || []).find((item) => {
                    // 写全等于 需要注意 eg: 比如 列表的id 为 string 返回的dataForm为 number 的情况   【目前后台未统一 数据类型】
                    return item[valueKey] == value
                }) || {})[labelKey] || '- -'
            },
            setItemData(value, defaultValue) {
                if (typeof value !== 'boolean' && typeof value !== 'number') {
                    return value || defaultValue
                }
                return value
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
    .FormConfig {
        /deep/ {
            .text {
                margin-left: 10px;
            }
            .footer {
                padding-top: 10px;
                border-top: 1px solid #dcdfe6;
                text-align: right;
            }
            .el-col {
                border-bottom: 0;
            }
            .labelHidden {
                color: transparent;
            }
            .el-select,
            .el-input-number {
                width: 100%;
            }
            .el-date-editor--daterange.el-input__inner { // dateRange样式
                width: 100%;
                height: 29px;
                /*width: calc(100% - 10px);*/
                /*margin-left: 10px;*/
            }
            /*.el-date-editor.el-input { // date 样式
                width: 100%;
            }*/
            .el-cascader {
                width: 100%;
            }
            .el-col-24  {
                .el-form-item__label{
                    width: 16.67%;
                }
                .el-form-item__content {
                    margin-left: 16.67%;
                    background: #fff;
                }
            }
            /* '选'字样式 */
            .el-input__suffix {
                right: 0;
            }
          /*.el-form-item {
            margin-bottom: 12px;
          }*/
            // 给inputNumber 添加的样式类名
            .textCenter .el-input__inner{
                text-align: center;
            }
        }
        /*@media only screen and (max-width: 767px) { // 兼容手机端 样式
            .el-col-24 {
                .el-form-item__label{
                    width: 33.33333%;
                }
                .el-form-item__content {
                    margin-left: 33.33333%;
                }
            }
        }*/
    }
    /* 如果表单有其他的 样式 可参照此处修改 来更改类名 在父级调用 写class 请用 父级类 包裹 */
     /*.defaultFormWrapClass {
        padding: 0 5px;
        /deep/ {
            .el-row {
                display: flex;
                flex-wrap: wrap;
            }
            .el-form-item {
                background-color: #e7f1fe;!* old *!
                margin-bottom: 0;
                border-bottom: 1px solid #ccc;
                height: 100%;
                &:last-child {
                    border-bottom: 0;
                }
            }
            .el-form-item__label {
                width: 33.33333%;
                color: #444;
                vertical-align: middle;
                !* new *!
                !*height: 100%;*!
                !*background-color: #e7f1fe;*!
                !*border-right: 1px solid #c7def6;*!
            }
            .el-form-item__content {
                margin-left: 33.33333%;
                border-left: 1px solid #c7def6; !* old Start *!
                background: #fff;
                height: 100%; !* old End *!
                > div {
                    box-sizing: border-box;
                    width: 100%;
                    padding: 0 10px;
                    &:first-child {
                        !*padding-bottom: 18px;*!
                        !*padding-bottom: 12px;*!
                        margin-top: 4px;
                        margin-bottom: 12px;
                    }
                    .el-input__suffix {
                        right: 15px;
                    }
                    .el-input__prefix {
                        left: 15px;
                    }
                    !* inputNumber样式 *!
                    &.el-input-number {
                        .el-input__inner {
                            text-align: left;
                        }
                        .el-input-number__decrease,.el-input-number__increase {
                            right: 11px;
                        }
                    }
                    !*.select-option .fa-lg {
                        !* 选人组件的人头icon *!
                        line-height: 1;
                    }*!
                }
                > .el-form-item__error { // 给错误提示更改位置
                    !*transform: translate(0, -18px);*!
                    transform: translate(0, -12px);
                    top: auto;

                    // z-index: -1; // temptemptemp  若不展示 提示文字
                }
                .areaItem .showNum { // 兼容自定义 textArea组件的 数字展示
                    !*bottom: -14px;
                    right: 5px;*!
                    bottom: -18px;
                    right: 10px;
                }
            }
            .el-row {
                border: 1px solid #c7def6;
                .el-col-12 {
                    &:last-child, &:nth-last-child(2) {
                        border-bottom: 0 !important;
                    }
                }
                .el-col-xs-24 {
                    &:last-child {
                        border-bottom: 0 !important;
                    }
                }
            }
            .el-col {
                border-bottom: 1px solid #c7def6 !important;
                flex: 0 0 auto;
            }

            @media only screen and (max-width: 767px) { // 兼容手机端 样式
                .el-row {
                    .el-col-12 {
                        &:nth-last-child(2) {
                            border-bottom: 1px solid #c7def6 !important;
                        }
                    }
                }
            }
        }
        // 由于目前表单验证相关内容 使用了 span xs 作为兼容  无需  使用 inline 修饰符
       !* &.el-form--inline { // 在form排列类型 于 inline  时 在defaultFormWrapClass 下的 样式兼容
            /deep/ {
                .el-form-item__content {
                    margin-left: auto;
                    !*background:#f00 !important;*!
                }
            }
        }*!
    }*/
</style>
