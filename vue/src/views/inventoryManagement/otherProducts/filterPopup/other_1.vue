<template>
    <div class="body-wrap">
        <layout-row class="layout-filter-item">
            <layout-filter-item label="产品名称">
                <el-input
                    v-model="searchParams_.productName"
                    :disabled="lockedProps.includes('productName')"
                    clearable
                    class="filter-item"
                    size="mini"
                    placeholder="产品名称"
                />
            </layout-filter-item>
            <layout-filter-item label="批次">
                <el-input
                    v-model="searchParams_.batchCode"
                    :disabled="lockedProps.includes('batchCode')"
                    clearable
                    class="filter-item"
                    size="mini"
                    placeholder="批次"/>
            </layout-filter-item>
            <layout-filter-item label="采购合同">
                <el-input
                    v-model="searchParams_.purchaseContractCode"
                    :disabled="lockedProps.includes('purchaseContractCode')"
                    clearable
                    class="filter-item"
                    size="mini"
                    placeholder="采购合同编号"/>
            </layout-filter-item>
            <layout-filter-item label="采购日期">
                <el-date-picker
                    v-model="searchParams_.purchaseDate"
                    :disabled="lockedProps.includes('purchaseDate')"
                    :default-time="['00:00:00', '23:59:59']"
                    type="daterange"
                    format="yyyy-MM-dd"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="入库单号">
                <el-input
                    v-model="searchParams_.enterWarehouseCode"
                    :disabled="lockedProps.includes('enterWarehouseCode')"
                    clearable
                    class="filter-item"
                    size="mini"
                    placeholder="入库单号"/>
            </layout-filter-item>
            <layout-filter-item label="入库日期">
                <el-date-picker
                    v-model="searchParams_.enterWarehouseTime"
                    :disabled="lockedProps.includes('enterWarehouseTime')"
                    :default-time="['00:00:00', '23:59:59']"
                    type="daterange"
                    format="yyyy-MM-dd"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    clearable
                />
            </layout-filter-item>
            <layout-filter-item label="入库人">
                <RemoteSelect
                    v-model="searchParams_.enterWarehouseUserId"
                    :disabled="lockedProps.includes('enterWarehouseUserId')"
                    :method="userRemoteMethod"
                    label-key="userName"
                    value-key="userId"
                    filter-label-key="userName"
                    placeholder="选择入库人"
                    clearable
                    class="filter-item"
                />
            </layout-filter-item>
        </layout-row>
    </div>
</template>

<script>
    import resApi from '@/api/resource'

    export default {
        name: 'Smart1',
        props: {
            lockedProps: { type: Array, default: () => [] },
            searchParams: {
                type: Object,
                default: () => {}
            }
        },
        data() {
            return {
                searchParams_: {},
                userRemoteMethod: resApi.getUserList
            }
        },
        watch: {
            searchParams: {
                handler(val) {
                    console.log(val)
                    // 因为是传过来的参数是对象,所以直接引用对象,无需回传更新
                    this.searchParams_ = this.searchParams
                }
            }
        },
        mounted() {
            this.searchParams_ = this.searchParams
        },
        methods: {
            // 父组件在触发查询时调用本函数获取本组件内的最新过滤参数
            getSearchParams() {
                return this.searchParams
            }
        }
    }
</script>

<style scoped lang="scss">
.body-wrap {
  .layout-filter-item {
    flex-wrap: wrap;
  }
}
</style>
