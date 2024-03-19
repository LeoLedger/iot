<template>
    <el-cascader
        v-bind="$attrs"
        :value="$attrs.value"
        :props="{ checkStrictly: true, ...$attrs.props }"
        :options="areaTree"
        :filterable="$attrs.filterable === void 0 ? true: $attrs.filterable"
        show-all-levels
        @input="$emit('input', $event)"
        @change="$emit('change', $event)"
    />
</template>
