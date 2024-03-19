<template>
    <div class="pick-input">
        <!-- 只展示 -->
        <div v-if="onlyShow" class="only-show">
            <template v-if="insideValue && insideValue.length">
                <el-tag
                    v-for="(item, index) of insideValue"
                    :key="index"
                    size="small"
                    class="tag-item"
                    disable-transitions
                    @click="$emit('click', index)"
                >{{ item }}</el-tag>
            </template>
            <template v-else>- -</template>
        </div>
        <template v-else>
            <el-input
                :class="{error: error, clearable: clearable}"
                :value="viewValue"
                :readonly="readonly"
                :disabled="disabled"
                :placeholder="placeholder"
                @blur="$emit('blur', $event)"
                @focus="$emit('focus', $event)"
                @input="$emit('input', $event)"
                @clear="$emit('clear', $event)"
                @change="$emit('change', $event)"
            >
                <div
                    v-if="clearable && viewValue !== ''"
                    slot="suffix"
                    class="clear el-icon-circle-close"
                    @click="handelClear"
                />
            </el-input>
            <el-button
                v-if="!disabled"
                type="primary"
                @click="$emit('pick')"
            >
                <slot name="icon">
                    <i class="el-icon-edit" />
                </slot>
            </el-button>
        </template>
        <slot/>
    </div>
</template>

<script>
    export default {
        name: 'PickInput',
        components: {},
        props: {
            value: { type: null, default: '' },
            error: { type: Boolean, default: false },
            // 是否只读
            readonly: { type: Boolean, default: false },
            // 是否禁用组件
            disabled: { type: Boolean, default: false },
            // 是否只读
            onlyShow: { type: Boolean, default: false },
            // 是否可清空
            clearable: { type: Boolean, default: false },
            // 占位符
            placeholder: { type: String, default: '' }
        },
        data() {
            return {
                viewValue: '',
                insideValue: []
            }
        },
        watch: {
            value: {
                immediate: true,
                handler() {
                    this.updateValue()
                }
            }
        },
        methods: {
            updateValue() {
                var value = this.value
                if (Array.isArray(value)) {
                    value = value.join('，')
                    this.insideValue = value
                }
                this.viewValue = value
                this.insideValue = [value]
            },
            handelClear() {
                this.viewValue = ''
                this.insideValue = []
                this.$emit('input', '')
                this.$emit('clear')
            }
        }
    }
</script>

<style scoped lang="scss">
.pick-input {
    display: flex;
    align-items: center;
    .clear {
        opacity: 0;
        font-size: 14px;
        margin-right: 6px;
        transition: .2s;
        cursor: pointer;
        &:hover {
            color: #666;
        }
    }
    &:hover {
        .clear {
            opacity: 1;
        }
    }
    .tag-item {
        cursor: pointer;
        & + .tag-item {
            margin-left: 5px;
        }
    }
    /deep/ {
        .el-input {
            &.clearable {
                .el-input__inner {
                    padding-right: 30px;
                }
            }
        }
    }
}
</style>
