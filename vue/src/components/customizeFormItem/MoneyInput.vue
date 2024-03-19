<template>
    <div :class="disabled&&_form.moneyInWords?'isDisabled':''" class="money-input" @click="handleClick">
        <el-input
            v-model.trim="viewValue"
            :readonly="form.readonly"
            :disabled="form.disabled || disabled || form.isEdit === false"
            :placeholder="placeholder"
            :resize="form.resize || 'none'"
            :maxlength="form.numLimit || 500"
            :style="itemStyle + (form.itemWidth ? `width: ${form.itemWidth}px;` : '')"
            @blur="onBlur"
            @focus="onFocus"
        >
            <span v-if="_form.showMoneyIcon" slot="prefix" class="money-icon">￥</span>
            <span v-if="_form.unit" slot="append">{{ _form.unit }}</span>
        </el-input>
        <span v-if="_form.moneyInWords && params[form.prop]" :style="{ bottom: disabled?'-12px':'-22px'}" class="showNum">大写：{{ intToChinese(params[form.prop]) }}</span>
    </div>
</template>

<script>
    import { getPriceFormat } from '@/utils'

    export default {
        name: 'MoneyInput',
        props: {
            value: { type: null, default: '' },
            form: { type: Object, required: true },
            params: { type: Object, required: true },
            disabled: { type: Boolean, default: false },
            placeholder: { type: String, default: '' }
        },
        data() {
            const { form, params } = this.$props
            return {
                // 视图模式: 0: 输入模式, 去掉千分位 1: 查看模式, 添加千分位
                viewType: 1
            }
        },
        computed: {
            itemStyle() {
                const { itemWidth } = this
                if (itemWidth) {
                    return `width: ${itemWidth}px;`
                }
                return ''
            },
            _form() {
                const _form = {
                    // 是否允许输入负数
                    minus: false,
                    // 是否允许且自动添加千分位显示
                    thousand: true,
                    // 是否显示金额图标
                    showMoneyIcon: false,
                    // 是否显示大写提示
                    moneyInWords: true,
                    // 单位
                    unit: null,
                    // 默认值
                    defaultValue: '',
                    // 最大值
                    max: null,
                    // 超过最大值时的提示
                    maxTip: null, // 为false则不提示,为null或''时为默认
                    // 最小值
                    min: null,
                    minTip: null
                }
                return Object.assign({}, _form, this.form)
            },
            viewValue: {
                get() {
                    if (this.params[this.form.prop] === undefined || this.params[this.form.prop] === '') {
                        return ''
                    }
                    if (this.viewType === 0) {
                        return this.stringToNumber(this.params[this.form.prop])
                    } else {
                        // 失去焦点 读模式前先检查最大最小值
                        const val = this.handleMaxAndMin(this.params[this.form.prop])
                        return this.getInputValue(val)
                    }
                },
                set(v) {
                    this.onInput(v)
                }
            }
        },
        watch: {
            params: {
                deep: true,
                immediate: true,
                handler() {
                    // 设置默认值
                    if (this.viewType !== 0 && this.params[this.form.prop] !== 0 && !this.params[this.form.prop]) {
                        this.onInput(this._form.defaultValue)
                    }
                }
            }
        },
        mounted() {},
        methods: {
            handleClick() {
                this.$emit('click', this.form)
            },
            onBlur(el) {
                const inputVal = el.target.value || 0
                let strValue = String(inputVal)
                const last = strValue.charAt(strValue.length - 1)
                // 失去焦点时, 如果以.结尾,则自动加.00后存储
                if (last === '.') {
                    strValue = strValue + '00'
                }
                strValue = Number(strValue)
                this.$emit('input', strValue)
                this.$emit('blur', this.params[this.form.prop])
                // 失去焦点时, 输入框显示为只读模式
                this.viewType = 1
            },
            onFocus(el) {
                // const inputVal = el.target.value || ''
                // 获取焦点时, 输入框显示为可写模式
                this.viewType = 0
            },
            onInput(value) {
                // 输入值处理, 这里对非法输入值进行过滤, 保证值是合法的
                if (value === '' || value === null || value === undefined) {
                    value = ''
                } else {
                    value = this.onlyMoney(value)
                }
                // 存储输入的值
                this.$emit('input', value)
            },
            // 获取输入框的值
            getInputValue(inputVal) {
                if (this._form.thousand) {
                    return this.numberToString(this.stringToNumber(inputVal))
                } else return inputVal
            },
            // 金额添加千分位
            numberToString(n) {
                if (!n) return this.viewType ? '0.00' : '0'
                n = n.toString()
                const str = n.split('.')
                const re = /\d{1,3}(?=(\d{3})+$)/g
                const n1 = str[0].replace(re, '$&,')
                return str.length > 1 && str[1] ? `${n1}.${str[1]}` : `${n1}.00`
            },
            // 去除千分位中的‘，'
            stringToNumber(num) {
                if (!num) return 0
                num = num.toString()
                num = num.replace(/,/gi, '')
                return num
            },
            handleMaxAndMin(val) {
                if (this._form.max !== null && this._form.max < val && !this.disabled) {
                    // 超过最大值, 转换为最大值
                    val = this._form.max
                    if (this._form.maxTip !== false) {
                        if (this._form.maxTip) {
                            this.$message.warning(this._form.maxTip)
                        } else this.$message.warning((this._form.label || '金额') + '不得超过最大值：' + getPriceFormat(val))
                    }
                    this.onInput(val)
                }
                if (this._form.min !== null && this._form.min > val && !this.disabled) {
                    // 小于最小值, 转换为最小值
                    val = this._form.min
                    if (this._form.minTip !== false) {
                        if (this._form.minTip) {
                            this.$message.warning(this._form.minTip)
                        } else this.$message.warning((this._form.label || '金额') + '不得小于最小值：' + getPriceFormat(val))
                    }
                    this.onInput(val)
                }
                return val
            },
            onlyMoney(inputVal) {
                if (inputVal === null || inputVal.length < 1) {
                    return 0
                }
                inputVal = String(inputVal)
                // 得到第一个字符
                const t = inputVal.charAt(0)
                // 如果输入前的值为0开头,且没有输入. ,那么输入时值自动去掉0
                if (inputVal !== '0' && t === '0' && inputVal.indexOf('.') < 0) {
                    inputVal = inputVal.replace(/0/g, '')
                }
                // 如果不允许输入负数,且第一个符号是减号,则替换掉
                if (!this._form.minus && t === '-') {
                    inputVal = inputVal.replace(/-/g, '')
                }
                // 去除从第二位开始的所有 - 号
                if (inputVal.length > 1) {
                    inputVal = t + inputVal.substr(1, inputVal.length).replace(/-/g, '')
                }
                // 先把非数字的都替换掉，除了数字和. - 号
                inputVal = inputVal.replace(/[^\d\.\-]/g, '')
                // 必须保证第一个为数字而不是.
                if (t === '.') {
                    inputVal = inputVal.replace(/^\./g, '')
                }
                // 保证只有出现一个.而没有多个.
                inputVal = inputVal.replace(/\.{2,}/g, '.')
                // 返回处理后的结果
                return inputVal
            },
            intToChinese(money) {
                // 汉字的数字
                const cnNums = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
                // 基本单位
                const cnIntRadice = ['', '拾', '佰', '仟']
                // 对应整数部分扩展单位
                const cnIntUnits = ['', '万', '亿', '兆']
                // 对应小数部分单位
                const cnDecUnits = ['角', '分', '毫', '厘']
                // 整数金额时后面跟的字符
                const cnInteger = '整'
                // 整型完以后的单位
                const cnIntLast = '元'
                // 最大处理的数字
                const maxNum = 999999999999999.9999
                // 金额整数部分
                var integerNum
                // 金额小数部分
                var decimalNum
                // 输出的中文金额字符串
                var chineseStr = ''
                // 分离金额后用的数组，预定义
                var parts
                if (money === '') { // 不能用==
                    return ''
                }
                money = parseFloat(money)
                if (money >= maxNum) {
                    // 超出最大处理数字
                    return ''
                }
                if (money === 0) {
                    chineseStr = cnNums[0] + cnIntLast + cnInteger
                    return chineseStr
                }
                // 转换为字符串
                money = money.toString()
                if (money.indexOf('.') === -1) {
                    integerNum = money
                    decimalNum = ''
                } else {
                    parts = money.split('.')
                    integerNum = parts[0]
                    decimalNum = parts[1].substr(0, 4)
                }
                // 获取整型部分转换
                if (parseInt(integerNum, 10) > 0) {
                    var zeroCount = 0
                    var IntLen = integerNum.length
                    for (var i = 0; i < IntLen; i++) {
                        var n = integerNum.substr(i, 1)
                        var p = IntLen - i - 1
                        var q = p / 4
                        var m = p % 4
                        if (n === '0') {
                            zeroCount++
                        } else {
                            if (zeroCount > 0) {
                                chineseStr += cnNums[0]
                            }
                            // 归零
                            zeroCount = 0
                            chineseStr += cnNums[parseInt(n)] + cnIntRadice[m]
                        }
                        if (m === 0 && zeroCount < 4) {
                            chineseStr += cnIntUnits[q]
                        }
                    }
                    chineseStr += cnIntLast
                }
                // 小数部分
                if (decimalNum !== '') {
                    var decLen = decimalNum.length
                    for (var i = 0; i < decLen; i++) {
                        var n = decimalNum.substr(i, 1)
                        if (n !== '0') {
                            chineseStr += cnNums[Number(n)] + cnDecUnits[i]
                        }
                    }
                }
                if (chineseStr === '') {
                    chineseStr += cnNums[0] + cnIntLast + cnInteger
                } else if (decimalNum === '') {
                    chineseStr += cnInteger
                }
                return chineseStr
            }
        }
    }
</script>

<style scoped lang="scss">
.showNum { // 展示textarea 可以输入的文字个数
  float: right;
  position: absolute;
  right: 10px;
  bottom: -12px;
  font-size: 12px;
  color: #999;
  user-select:none;
  white-space: nowrap;
  overflow: hidden;
}
.money-input {
  &.isDisabled {
    margin-bottom: 10px;
  }
  .money-icon {
    line-height: 28px;
    font-size: 13px;
    margin-left: 5px;
    color: #999;
    user-select:none;
  }
  /deep/ .el-input-group__append, .el-input-group__prepend {
    padding: 0 10px;
    user-select:none;
    line-height: 26px;
  }
}
</style>
