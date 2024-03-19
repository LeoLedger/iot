<!--
* @description 故障信息选择器
* @author 易超
!-->
<template>
    <span v-if="readonly" class="readonly">
        {{ label }}
    </span>
    <el-select
        v-else
        :value="value"
        :loading="loading"
        :disabled="$attrs.disabled"
        :clearable="$attrs.clearable"
        :placeholder="$attrs.placeholder"
        :style="{width: $attrs.width || '100%'}"
        size="mini"
        filterable
        @focus="handleFocus"
        @change="handleChange"
    >
        <template v-for="(item, index) in options">
            <el-option
                :key="index"
                :label="item.code"
                :value="item.code"
            >
                <div class="option">
                    <div class="code">{{ item.code }}</div>
                    <div class="text">{{ item.name }}</div>
                </div>
            </el-option>
        </template>
    </el-select>
</template>

<script>
    import { isEmpty } from '@/utils'
    // API
    import faultCodeConfigApi from '@/api/systemSet/faultCodeConfig'

    export default {
        name: 'FaultMsgSelect',
        props: {
            /**
             * 常用语类型
             * 0    故障单
             * 1    维修登记
             */
            type: [Number, String],
            // 选择的值
            value: null,
            // 是否只展示
            readonly: { type: Boolean, default: false }
        },
        data() {
            return {
                options: [],
                loaded: false,
                loading: false
            }
        },
        computed: {
        },
        watch: {
            type() {
                this.options = null
            },
            value(value) {
                // 如果组件还没请求过数据，直接创建一个临时option，避免组件赋值时，同时间进行大量相同请求
                if (!this.loaded && !isEmpty(value)) {
                    this.options = [{


                    }]
                }
            }
        },
        mounted() {
        },
        methods: {
            // 请求选项数据
            async getOptions() {
                if (!isEmpty(this.type)) {
                    try {
                        this.loading = true
                        let res = await faultCodeConfigApi.getList({
                            type: 3,
                            busType: this.type,
                            pageSize: -1
                        })
                        this.loaded = true
                        this.options = res.data.records.map(({ code, name }) => ({ code, name }))
                    } catch (err) {
                        console.log(err)
                        this.optionData = null
                    }
                    this.loading = false
                }
            },
            // 获取焦点时触发
            handleFocus() {
                if (!this.loaded) {
                    this.getOptions()
                }
            },
            // value改变时触发
            handleChange(value) {
                if (this.loaded) {
                    this.$emit('input', value)
                    this.$emit('change', this.options.find(v => v.code === value))
                }
            }
        }
    }

</script>

<style lang="scss" scoped>
.readonly {
    margin-left: 5px;
}
.option {
    padding: 6px 0;
    line-height: 1.4em;
    .text {
        color: #999;
        font-size: 12px;
        margin-top: 4px;
    }
}
</style>
