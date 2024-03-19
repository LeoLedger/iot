<!--
* @description  常用语选择器
* @author 易超
!-->
<template>
    <span v-if="onlyShow" class="only-show">
        {{ label }}
    </span>
    <el-select
        v-else
        :value="value"
        :loading="loading"
        :multiple="$attrs.multiple"
        :disabled="$attrs.disabled"
        :clearable="$attrs.clearable"
        :placeholder="$attrs.placeholder"
        :style="{width: $attrs.width || '100%'}"
        :no-data-text="$attrs.noDataText || '无数据，请手动输入'"
        size="mini"
        filterable
        allow-create
        @focus="handleFocus"
        @change="handleChange"
    >
        <template v-for="(item, index) in options">
            <el-option
                :key="index"
                :label="item"
                :value="item"
            />
        </template>
    </el-select>
</template>

<script>
    // API
    import resourceApi from '@/api/resource'

    export default {
        props: {
            /**
             * 常用语类型
             * 1    企业反馈异常
             * 2    客服诊断结果
             * 3    厂家诊断结果
             */
            type: { type: [Number, String] },
            // 选择的值
            value: { type: null, default: '' },
            // 是否只展示
            onlyShow: { type: Boolean, default: false },
            // 产品id
            productId: { type: null },
            // 是否默认填充第一条数据
            defaultSelectFirst: { type: Boolean, default: false }
        },
        data() {
            return {
                options: [],
                loading: false,
                optionData: null
            }
        },
        computed: {
            label() {
                return (this.options.find(item => item.value === this.value) || {}).label || '- -'
            }
        },
        watch: {
            type() {
                this.optionData = null
            }
        },
        mounted() {
        },
        methods: {
            // 请求选项数据
            async queryOptions() {
                this.loading = true
                try {
                    if (this.type && this.productId) {
                        var res = await resourceApi.getProductLanguages({
                            type: this.type,
                            productId: this.productId
                        })
                        this.optionData = res.data
                    } else {
                        this.optionData = {}
                    }
                    this.updateOptions()
                } catch (err) {
                    console.log(err)
                    this.optionData = null
                }
                this.loading = false
            },
            // 更新选项数据
            updateOptions() {
                if (this.optionData) {
                    var options = this.optionData[this.productId]
                    if (options) {
                        this.options = options
                    } else {
                        this.optionData[this.productId] = []
                    }
                    if (!this.isFirsted) {
                        this.isFirsted = true
                        // value为空才默认填充第一条数据
                        if (this.defaultSelectFirst && isEmpty(this.value) && this.options.length) {
                            var value = this.options.value
                            this.$emit('input', value)
                            this.$emit('change', value)
                        }
                    }
                }
            },
            // 获取焦点时触发
            handleFocus() {
                // 如果没有选项数据，才请求远程数据接口
                if (!this.optionData && !this.loading || !this.optionData[this.productId]) {
                    this.queryOptions()
                }
            },
            handleChange(text) {
                if (this.optionData) {
                    // 如果options内没有该文本，则添加到options
                    if (text !== '' && this.productId && this.options.indexOf(text) === -1) {
                        this.optionData[this.productId].splice(0, 0, text)
                    }
                }
                this.$emit('input', text)
                this.$emit('change', text)
            }
        }
    }

</script>

<style lang="scss" scoped>
.only-show {
    margin-left: 5px;
}
</style>
