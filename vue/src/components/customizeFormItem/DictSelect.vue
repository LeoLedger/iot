<!--
* @description  字典选择器
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
        :value-key="$attrs.valueKey"
        :clearable="$attrs.clearable"
        :filterable="$attrs.filterable"
        :placeholder="$attrs.placeholder"
        :style="{width: $attrs.width || '100%'}"
        size="mini"
        @clear="handleClear"
        @change="handleChange"
    >
        <template v-for="(item, index) in optionData">
            <el-option
                :key="index"
                :label="item[labelKey]"
                :value="item[valueKey]"
            />
        </template>
    </el-select>
</template>

<script>

    import enums from '@/utils/enum'
    import dictEnum from './dictEnum'

    export default {
        props: {
            // 字典类型
            type: { type: String, required: true },
            // 选择的值
            value: { type: null, default: '' },
            labelKey: { type: String, default: 'label' },
            valueKey: { type: String, default: 'value' },
            // 排除列表
            exclude: { type: Array },
            // 是否只展示
            onlyShow: { type: Boolean, default: false }
        },
        data() {
            return {
                options: [],
                loading: false
            }
        },
        computed: {
            label() {
                return (this.options.find(item => item[this.valueKey] === this.value) || {}).label || '- -'
            },
            optionData() {
                let exclude = this.exclude
                if (Array.isArray(exclude)) {
                    return this.options.filter(item => exclude.indexOf(item.value) === -1)
                }
                return this.options
            }
        },
        watch: {
            exclude: {
                deep: true,
                immediate: true,
                handler(exclude) {
                    if (Array.isArray(exclude) && exclude.indexOf(this.value) > -1) {
                        this.handleChange('')
                    }
                }
            }
        },
        mounted() {
            this.updateOptions()
        },
        methods: {
            // 更新选项数据
            updateOptions() {
                var type = this.type
                if (type in enums) {
                    this.options = enums[type]
                } else {
                    if (dictEnum[type]) {
                        this.options = this.getDict(type)
                    } else {
                        return new Error('请在枚举中添加该字典类型')
                    }
                }
            },
            handleClear() {
                this.$emit('input')
                this.$emit('change')
            },
            handleChange(value) {
                var option = this.options.find(v => v[this.valueKey] === value)
                this.$emit('input', value)
                this.$emit('change', value, option)
            }
        }
    }

</script>

<style lang="scss" scoped>
.only-show {
    margin-left: 5px;
}
</style>
