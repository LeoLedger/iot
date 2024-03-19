<template>
    <el-select
        :value="value"
        :loading="loading"
        :multiple="$attrs.multiple"
        :disabled="$attrs.disabled"
        :value-key="$attrs.valueKey"
        :clearable="$attrs.clearable"
        :placeholder="$attrs.placeholder"
        :remote-method="handleRemoteMethod"
        :style="{width: $attrs.width}"
        remote
        filterable
        size="mini"
        @clear="handleClear"
        @change="handleChange"
    >
        <el-option
            v-for="(item, index) in options"
            :key="index"
            :label="item.label"
            :value="item.value"
        />
    </el-select>
</template>

<script>
    import { isEmpty } from '@/utils'

    export default {
        props: {
            value: { type: null, default: '' },
            // 请求方法
            method: { type: Function },
            // 每页的数据量
            pageSize: { type: [String, Number], default: 50 },
            // 用于传递给后端过滤的参数名称
            filterLabelKey: { type: String, default: 'name' },
            filterValueKey: { type: String, default: 'guidId' },
            labelKey: { type: String, default: 'label' },
            valueKey: { type: String, default: 'value' },
            allowCreate: { type: Boolean, default: false },
            // 其他参数
            extendParams: { type: Object },
            // 是否默认填充第一条数据
            defaultSelectFirst: { type: Boolean, default: false },
            // 是否分页加载
            hasPageDemanding: { type: Boolean, default: true }
        },
        data() {
            return {
                options: [],
                keyword: '',
                loading: false
            }
        },
        computed: {},
        watch: {
            value() {
                this.handleValueChange()
            },
            method() {
                this.queryList()
            },
            filterKey() {
                this.queryList()
            }
        },
        mounted() {
            this.optionsData = []
            this.queryList()
        },
        methods: {
            // 根据关键词过滤选项数据
            filterData(keyword = '') {
                this.options = this.optionsData.filter(item => item.label.indexOf(keyword) > -1)
            },
            // 获取数据列表
            async queryList() {
                if (this.method) {
                    this.loading = true
                    this.requestListing = true
                    var params = { ...this.extendParams }
                    if (this.hasPageDemanding) {
                        params = {
                            ...params,
                            [this.filterLabelKey]: this.keyword,
                            pageSize: this.pageSize,
                            pageIndex: 1
                        }
                    }
                    var res = await this.method(params)
                    var data = Array.isArray(res.data) ? res.data : res.data.records
                    this.optionsData = data.map(item => {
                        return {
                            label: item[this.labelKey],
                            value: item[this.valueKey],
                            data: item
                        }
                    })
                    if (this.allowCreate && this.optionsData.length === 0) {
                        this.optionsData.push({
                            label: this.keyword,
                            value: this.keyword,
                            isCreate: true
                        })
                    }
                    if (this.hasPageDemanding) {
                        this.options = this.optionsData
                        if (!this.isFirstQueryed) {
                            // 第一次请求才继续
                            this.isFirstQueryed = true
                            // value为空才默认填充第一条数据
                            if (this.defaultSelectFirst && isEmpty(this.value) && this.options.length) {
                                var value = this.options[0].value
                                this.$emit('input', value)
                                this.$emit('change', value)
                            }
                        }
                        await this.handleValueChange()
                    } else {
                        this.filterData()
                    }
                    this.loading = false
                    this.requestListing = false
                }
            },
            // value改变时触发
            async handleValueChange() {
                if (this.hasPageDemanding) {
                    // 遍历选项是否包含value，如果不存在value则根据filterLabelKey获取到当前value的选项数据，加入到选项列表
                    if (isEmpty(this.keyword) && !isEmpty(this.value) && this.options.findIndex(v => v.value === this.value) === -1) {
                        var res = await this.method({
                            [this.filterValueKey]: this.value,
                            pageSize: 1,
                            pageIndex: 1
                        })
                        var data = Array.isArray(res.data) ? res.data : res.data.records
                        if (data.length) {
                            this.options.splice(0, 0, {
                                label: data[0][this.labelKey],
                                value: this.value,
                                data: data[0]
                            })
                        }
                    }
                }
            },
            // 选择器选中值改变时触发
            handleChange(value) {
                var option = this.options.find(v => v.value === value)
                this.$emit('input', value)
                this.$emit('change', option)
            },
            // 清空选中值时触发, 重新初始化列表
            handleClear() {
                this.handleRemoteMethod('')
            },
            // 关键词变化时触发
            handleRemoteMethod(keyword) {
                if (this.hasPageDemanding) {
                    // 防抖
                    clearTimeout(this.timer)
                    this.timer = setTimeout(() => {
                        this.keyword = keyword.trim()
                        this.queryList()
                    }, 300)
                } else {
                    this.filterData(keyword.trim())
                }
            }
        }
    }

</script>

<style lang="scss" scoped>
</style>
