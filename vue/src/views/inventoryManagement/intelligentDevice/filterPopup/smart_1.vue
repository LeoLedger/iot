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
            <layout-filter-item label="ICCID">
                <el-input
                    v-model="searchParams_.iccid"
                    :disabled="lockedProps.includes('iccid')"
                    clearable
                    class="filter-item"
                    size="mini"
                    placeholder="ICCID"/>
            </layout-filter-item>
            <layout-filter-item label="PSN号">
                <el-input
                    v-model="searchParams_.psn"
                    :disabled="lockedProps.includes('psn')"
                    clearable
                    class="filter-item"
                    size="mini"
                    placeholder="PSN"/>
            </layout-filter-item>
            <layout-filter-item label="包装箱编号">
                <el-input
                    v-model="searchParams_.packageCode"
                    :disabled="lockedProps.includes('packageCode')"
                    clearable
                    class="filter-item"
                    size="mini"
                    placeholder="包装箱编号"/>
            </layout-filter-item>
            <layout-filter-item label="SIM卡号">
                <el-input
                    v-model="searchParams_.sim"
                    :disabled="lockedProps.includes('sim')"
                    clearable
                    class="filter-item"
                    size="mini"
                    placeholder="SIM卡号"/>
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
            <layout-filter-item label="供应商">
                <RemoteSelect
                    v-model="searchParams_.supplierId"
                    :disabled="lockedProps.includes('supplierId')"
                    :method="supplierRemoteMethod"
                    label-key="name"
                    value-key="guidId"
                    filter-label-key="name"
                    placeholder="选择供应商"
                    clearable
                    class="filter-item"
                />
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
            <layout-filter-item label="质保开始">
                <el-date-picker
                    v-model="searchParams_.warrantyStartDate"
                    :disabled="lockedProps.includes('warrantyStartDate')"
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
            <layout-filter-item label="质保结束">
                <el-date-picker
                    v-model="searchParams_.warrantyEndDate"
                    :disabled="lockedProps.includes('warrantyEndDate')"
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
        </layout-row>
    </div>
</template>

<script>
    import supplierApi from '@/api/purchase/supplier'
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
                supplierRemoteMethod: supplierApi.getList,
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
