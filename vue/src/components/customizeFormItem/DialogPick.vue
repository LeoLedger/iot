<!--
* @description  弹窗选择组件
!-->
<template>
    <pick-input
        :value="viewValue"
        :disabled="disabled"
        :clearable="insideParams.clearable"
        :placeholder="placeholder"
        :only-show="onlyShow"
        readonly
        @pick="handlePick"
        @blur="$emit('blur', $event)"
        @input="$emit('input', $event)"
        @clear="handelClear"
        @click="handleClick"
    >
        <span slot="icon">选</span>
        <SelectDialog
            v-if="dialogVisible"
            :type="type"
            :value="pickValue"
            :title="titleText"
            :visible.sync="dialogVisible"
            :height="insideParams.height"
            :excludes="insideParams.excludes"
            :multiple="insideParams.multiple"
            :extend-params="extendParams"
            :max-count="insideParams.maxCount"
            :overage-message="insideParams.overageMessage"
            :custom-request="insideParams.customRequest"
            @change="handlePickChange"
        />
    </pick-input>
</template>

<script>
    /**
     * 弹窗选择组件
     * params有以下属性：
     * prop：用于从formData中获取属性名为prop的属性，获取到值用于显示在input中
     * labelKey：用于从选择的对象中获取属性名为labelKey的属性，获取到值会被赋值给formData中属性名为prop的属性
     * formKey：用于从formData中获取属性名为formKey的属性，用处类似为用户id，用于提交给后端，也用于找到并勾选上次选中的项
     * dataKey：用于从选择的对象中获取属性名为dataKey的属性，获取到的值会被赋值给formData中属性名为formKey的属性
     */
    import types from '@/components/SelectDialog/types'
    import { isEmpty, isPromise } from '@/utils'
    // 组件
    import PickInput from './PickInput'

    export default {
        name: 'DialogPick',
        components: {
            PickInput
        },
        model: {
            prop: 'formData',
            event: 'update:formData'
        },
        props: {
            // 类型
            type: { type: String, default: '', required: true },
            // 组件参数
            params: { type: Object, required: true },
            // 表单数据
            formData: { type: Object, required: true, default: () => ({}) },
            // 是否只展示
            onlyShow: { type: Boolean, default: false },
            // 是否禁用组件
            disabled: { type: Boolean, default: false },
            // 占位符
            placeholder: { type: String, default: '' },
            // 是否只读
            readonly: { type: Boolean, default: true }
        },
        data() {
            return {
                premiseData: {},
                dialogVisible: false
            }
        },
        computed: {
            formKey() {
                return Array.isArray(this.insideParams.formKey) ? this.insideParams.formKey : [this.insideParams.formKey]
            },
            dataKey() {
                return Array.isArray(this.insideParams.dataKey) ? this.insideParams.dataKey : [this.insideParams.dataKey]
            },
            pickValue() {
                let { prop, labelKey, multiple } = this.insideParams
                let formData = this.formData
                let label = formData[prop]
                if (multiple) {
                    let value = formData[this.formKey[0]]
                    // 这里并不知道用户选中多少项，所以只能根据第一个formKey的长度判断选中数量
                    if (Array.isArray(value)) {
                        let values = []
                        for (let i = 0; i < value.length; i++) {
                            values[i] = {}
                            this.formKey.forEach((key, index) => {
                                values[i][this.dataKey[index]] = formData[key][i]
                            })
                        }
                        console.log(values)
                        return values
                    }
                } else if (!isEmpty(label)) {
                    let data = {
                        [labelKey]: label
                    }
                    this.dataKey.map(v => v).forEach((key, index) => {
                        data[key] = formData[this.formKey[index]]
                    })
                    return data
                }
                return null
            },
            viewValue() {
                return this.formData[this.insideParams.prop]
            },
            titleText() {
                return this.insideParams.title || ('选择' + this.insideParams.label)
            },
            insideParams() {
                var config = types[this.type] || {}
                return {
                    label: '',
                    title: '',
                    multiple: false, // 是否可多选
                    // 指定用于获取选中对象的label属性名称
                    labelKey: config.labelKey || 'label',
                    // 指定用于获取选中对象的id属性名称
                    dataKey: config.dataKey || 'value',
                    // 指定用于获取及设置到formData中的属性名称
                    formKey: 'value',
                    // 窗口高度
                    height: '65vh',
                    // 排除列表
                    excludes: [],
                    maxCount: Infinity,
                    overageMessage: '',
                    /**
                     * 前提配置，只有满足条件，才能进行操作，
                     * Array[Object, ...]
                     * prop             作为前提的属性名，点击选择按钮时会判断formData内属性名为prop的属性是否为空，不为空才能继续操作，否则会进行提示
                     * dataKey          验证通过的prop的属性值会被赋值给extendParams的dataKey属性（不传则使用prop）传递给弹窗选择器组件
                     * message          验证不通过时的提示信息
                     * isAssign         是否把验证通过的prop的属性值赋值到extendParams，默认为true
                     * required         验证项是否必填，默认为true
                     * props            验证通过时其他需要赋值到extendParams的属性,
                     *                  formKey       需要从formData中获取的属性名
                     *                  dataKey       需要赋值到extendParams中的属性名
                     */
                    premises: [],
                    // 在点击选择按钮之前调用，返回true才能选择
                    beforePick: null,
                    clearable: false, // 是否可清空
                    extendParams: { }, // 其他参数
                    ...this.params
                }
            },
            extendParams() {
                return { ...this.insideParams.extendParams, ...this.premiseData }
            }
        },
        watch: {
            // formData: {
            //     deep: true,
            //     handler(data) {
            //         console.log(data)
            //     }
            // }
        },
        methods: {
            // 获取
            handelClear() {
                if (!this.insideParams.multiple) {
                    this.formKey.forEach(key => {
                        this.$set(this.formData, key, void 0)
                    })
                }
                this.$set(this.formData, this.insideParams.prop, void 0)
                this.$emit('clear')
            },
            handlePick() {
                // 验证前提条件
                if (Array.isArray(this.insideParams.premises)) {
                    var data = {}
                    var pass = true
                    this.insideParams.premises.every(item => {
                        var value = this.formData[item.prop]
                        if (item.required !== false && [void 0, null, ''].includes(value)) {
                            this.$message.warning(item.message || item.prop + '不能为空')
                            return (pass = false)
                        } else if (item.isAssign !== false) {
                            // 赋值其他属性
                            if (Array.isArray(item.props)) {
                                item.props.forEach(v => {
                                    data[v.dataKey] = this.formData[v.formKey]
                                })
                            }
                            data[item.dataKey || item.prop] = value
                        }
                        return true
                    })
                    if (pass) {
                        this.premiseData = data
                    } else {
                        return
                    }
                }
                if (typeof this.insideParams.beforePick === 'function') {
                    var res = this.insideParams.beforePick(this)
                    if (isPromise(res)) {
                        res.then(() => {
                            this.dialogVisible = true
                        })
                    } else {
                        this.dialogVisible = !!res
                    }
                } else {
                    this.dialogVisible = true
                }
            },
            // 只展示时点击选中项时触发
            handleClick(index) {
                if (this.insideParams.multiple) {
                    var data = this.formData[this.insideParams.formKey[0]]
                    if (Array.isArray(data)) {
                        this.$emit('click', data[index])
                    }
                } else {
                    this.$emit('click', this.formData[this.insideParams.formKey[0]])
                }
            },
            // 选中项改变时触发
            handlePickChange(list) {
                // 根据选择方式赋值给formData
                if (this.insideParams.multiple) {
                    // 多选时会把选中的列表赋值给prop
                    let values = {}
                    let labels = []
                    this.formKey.forEach(key => {
                        values[key] = []
                    })
                    list.forEach(item => {
                        this.formKey.forEach((key, index) => {
                            values[key].push(item[this.dataKey[index]])
                        })
                        labels.push(item[this.insideParams.labelKey])
                    })
                    Object.keys(values).forEach(key => {
                        this.$set(this.formData, key, values[key])
                    })
                    this.$set(this.formData, this.insideParams.prop, labels.join(','))
                } else if (list.length) {
                    this.formKey.forEach((key, index) => {
                        var datakey = this.dataKey[index]
                        this.$set(this.formData, key, list[0][datakey])
                    })
                    this.$set(this.formData, this.insideParams.prop, list[0][this.insideParams.labelKey])
                }
                this.$emit('change', list)
            }
        }
    }
</script>

<style scoped lang="scss">
/deep/ {
    .el-input__validateIcon {
        display: none;
    }
}
</style>
