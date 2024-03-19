<template>
    <span class="filter-wrap">
        <el-input
            v-model="searchParam.iccid"
            :disabled="lockedProps.includes('iccid')"
            clearable
            class="filter-item"
            size="mini"
            placeholder="ICCID"
            @change="$emit('change')"
        />
        <el-input
            v-model="searchParam.sim"
            :disabled="lockedProps.includes('sim')"
            clearable
            class="filter-item"
            size="mini"
            placeholder="SIM卡号"
            @change="$emit('change')"
        />
    </span>
</template>
<script>
    export default {
        props: {
            lockedProps: { type: Array, default: () => [] },
            searchParam: { type: Object, default: () => {} }
        }
    }
</script>

<style scoped lang="scss">
.filter-wrap {
    margin-right: 5px;
}
</style>
