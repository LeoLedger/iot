<!--
* @description  过滤组件
* @author yc
!-->
<template>
    <el-input
        v-if="item.type === 'input'"
        v-model="filterParam[item.name]"
        :placeholder="item.placeholder"
        size="mini"
        clearable
        @change="$emit('change')"
    />
    <el-select
        v-else-if="item.type === 'select'"
        v-model="filterParam[item.name]"
        :placeholder="item.placeholder"
        filterable
        clearable
        size="mini"
        @change="$emit('change')"
    >
        <el-option
            v-for="(item, index) in item.options"
            :key="index"
            :value="item.value"
            :label="item.label"
        />
    </el-select>
    <el-date-picker
        v-else-if="item.type === 'datePicker'"
        v-model="filterParam[item.name]"
        :default-time="item.defaultTime || ['00:00:00', '23:59:59']"
        :type="item.pickerType || 'daterange'"
        :format="item.format || 'yyyy-MM-dd'"
        :value-format="item.valueFormat || 'yyyy-MM-dd HH:mm:ss'"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        clearable
        @change="$emit('change')"
    />
    <DictSelect
        v-else-if="item.type === 'dictSelect'"
        v-model="filterParam[item.name]"
        :placeholder="item.placeholder"
        :type="item.dictType"
        clearable
        filterable
        size="mini"
        @change="$emit('change')"
    />
</template>
<script>
    export default {
        components: {
        },
        props: {
            item: Object,
            filterParam: { type: Object, default: () => ({}) }
        },
        data() {
            return {
            }
        },
        computed: {
        },
        watch: {
        },
        mounted() {
        },
        methods: {
        }
    }
</script>

<style lang='scss' scoped>
</style>
