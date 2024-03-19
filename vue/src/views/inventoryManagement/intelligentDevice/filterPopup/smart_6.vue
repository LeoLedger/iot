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
            <layout-filter-item label="设备状态">
                <DictSelect
                    v-model="searchParams_.unitStatus"
                    :disabled="lockedProps.includes('unitStatus')"
                    type="deviceStatus"
                    placeholder="设备状态"
                    clearable
                    filterable
                    class="filter-item"
                    size="mini"
                />
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
            <layout-filter-item label="质保结束">
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
            <layout-filter-item label="出库日期">
                <el-date-picker
                    v-model="searchParams_.outWarehouseTime"
                    :disabled="lockedProps.includes('outWarehouseTime')"
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
            <layout-filter-item label="销售类型">
                <DictSelect
                    v-model="searchParams_.salesType"
                    :disabled="lockedProps.includes('salesType')"
                    type="salesType"
                    placeholder="请选择标段销售类型"
                    clearable
                    filterable
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="标段销售类型">
                <DictSelect
                    v-model="searchParams_.sectionSalesType"
                    :disabled="lockedProps.includes('sectionSalesType')"
                    type="salesType"
                    placeholder="请选择标段销售类型"
                    clearable
                    filterable
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="所在项目">
                <RemoteSelect
                    v-model="searchParams_.projectId"
                    :disabled="lockedProps.includes('projectId')"
                    :method="projectRemoteMethod"
                    :extend-params="{status: 1}"
                    label-key="projectName"
                    value-key="guidId"
                    filter-value-key="projectId"
                    filter-label-key="projectName"
                    placeholder="选择项目"
                    clearable
                    class="filter-item"
                />
            </layout-filter-item>
            <layout-filter-item label="所在标段">
                <RemoteSelect
                    v-model="searchParams_.sectionId"
                    :disabled="lockedProps.includes('sectionId')"
                    :method="sectionRemoteMethod"
                    label-key="name"
                    value-key="guidId"
                    filter-label-key="sectionName"
                    placeholder="选择标段"
                    clearable
                    class="filter-item"
                />
            </layout-filter-item>
            <layout-filter-item label="所在企业">
                <RemoteSelect
                    v-model="searchParams_.customerId"
                    :disabled="lockedProps.includes('customerId')"
                    :method="customerRemoteMethod"
                    label-key="name"
                    value-key="guidId"
                    filter-label-key="name"
                    placeholder="选择企业"
                    clearable
                    class="filter-item"
                />
            </layout-filter-item>
            <layout-filter-item label="服务到期日期">
                <el-date-picker
                    v-model="searchParams_.serviceEndDate"
                    :disabled="lockedProps.includes('serviceEndDate')"
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
            <layout-filter-item label="设备残值(区间)">
                <div class="flex-align-center">
                    <el-input
                        v-model="searchParams_.unitResidual[0]"
                        :disabled="lockedProps.includes('unitResidual')"
                        size="mini"
                        type="number"
                        class="flex"
                        placeholder="最小金额"
                        clearable
                    />
                    <span class="separator">至</span>
                    <el-input
                        v-model="searchParams_.unitResidual[1]"
                        :disabled="lockedProps.includes('unitResidual')"
                        size="mini"
                        type="number"
                        class="flex"
                        placeholder="最大金额"
                        clearable
                    />
                </div>
            </layout-filter-item>
            <layout-filter-item label="状态确认日期">
                <el-date-picker
                    v-model="searchParams_.statusTime"
                    :disabled="lockedProps.includes('statusTime')"
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
            <layout-filter-item label="最后通信日期">
                <el-date-picker
                    v-model="searchParams_.lastCommunTime"
                    :disabled="lockedProps.includes('lastCommunTime')"
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
    import projectApi from '@/api/PM/project'
    import sectionApi from '@/api/PM/section'
    import customerApi from '@/api/PM/customer'
    import resApi from '@/api/resource'

    export default {
        props: {
            lockedProps: { type: Array, default: () => [] },
            searchParams: {
                type: Object,
                default: () => {}
            }
        },
        data() {
            return {
                searchParams_: {
                    unitResidual: []
                },
                supplierRemoteMethod: supplierApi.getList,
                userRemoteMethod: resApi.getUserList,
                projectRemoteMethod: projectApi.getList,
                customerRemoteMethod: customerApi.getList,
                sectionRemoteMethod: sectionApi.getList
            }
        },
        watch: {
            searchParams: {
                handler(val) {
                    console.log(val)
                    // 因为是传过来的参数是对象,所以直接引用对象,无需回传更新
                    this.searchParams_ = this.searchParams
                    this.searchParams_.unitResidual = []
                }
            }

        },
        mounted() {
            this.searchParams_ = this.searchParams
            this.searchParams_.unitResidual = []
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
<style lang='scss' scoped>
.flex-align-center {
  display: flex;
  align-items: center;
  .flex {
    flex: 1;
  }
  .separator {
    margin: 0 8px;
    font-size: 12px;
  }
  /deep/ {
    .el-input__inner {
      text-align: center;
    }
  }
}
</style>
