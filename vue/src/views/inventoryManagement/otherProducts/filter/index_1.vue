<template>
    <span class="filter-wrap">
        <el-input
            v-model="searchParam.productName"
            :disabled="lockedProps.includes('productName')"
            clearable
            class="filter-item"
            size="mini"
            placeholder="产品名称"
            @change="$emit('change')"
        />
        <el-input
            v-model="searchParam.productCode"
            :disabled="lockedProps.includes('productCode')"
            clearable
            class="filter-item"
            size="mini"
            placeholder="产品编号"
            @change="$emit('change')"
        />
        <RemoteSelect
            v-model="searchParam.productType"
            :method="productTypeRemoteMethod"
            :disabled="lockedProps.includes('productType')"
            :extend-params="{ categoryId: 'FBB2B7F6-CD9A-48CA-8300-C72D34BC3100' }"
            label-key="dictName"
            value-key="dictId"
            filter-label-key="dictName"
            placeholder="选择产品类型"
            clearable
            class="filter-item"
            @change="$emit('change')"
        />
    </span>
</template>

<script>
    import deviceApi from '@/api/inventory/device'
    export default {
        props: {
            lockedProps: { type: Array, default: () => [] },
            searchParam: { type: Object, default: () => {} }
        },
        data() {
            return {
                productTypeRemoteMethod: deviceApi.getDictList
            }
        }
    }
</script>

<style scoped lang="scss">
.filter-wrap {
    margin-right: 5px;
}
</style>
