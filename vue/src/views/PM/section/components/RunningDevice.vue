<!--
* @description 标段运营设备列表
* @author yc
!-->
<template>
    <div>
        <layout-filter
            v-if="productCategoryList.length"
            :table-columns.sync="tableData.columns"
            :filter-model.sync="searchParam"
            @search="handleSearch"
        >
            <template v-show="tableData.list.length" slot="button">
                <el-button
                    v-waves
                    size="mini"
                    class="filter-button"
                    type="warning"
                    icon="el-icon-download"
                    @click="handleExport"
                >导出</el-button>
            </template>
            <template slot="filter-top">
                <div class="group-type-list">
                    <el-tag v-if="loading.productCategoryList" type="primary">
                        <i class="el-icon-loading" />
                        {{ '正在加载仓位列表...' }}
                    </el-tag>
                    <template v-else>
                        <div
                            v-for="(item, index) in productCategoryList"
                            :key="index"
                            :class="{active: categoryType === item.id}"
                            class="group-type-item"
                            @click="handleSpaceChange(item)">
                            <div>{{ item.count || '--' }}</div>
                            <div>{{ item.label }}</div>
                        </div>
                    </template>
                </div>
            </template>
            <template slot="filter">
                <el-input
                    v-if="[3].includes(categoryType)"
                    v-model="searchParam.sim"
                    size="mini"
                    placeholder="SIM卡号"
                    clearable
                    class="filter-item"
                    @change="handleSearch"
                />
                <el-input
                    v-if="[1,2,3].includes(categoryType)"
                    v-model="searchParam.imei"
                    size="mini"
                    placeholder="IMEI"
                    clearable
                    class="filter-item"
                    @change="handleSearch"
                />
                <el-input
                    v-if="[1,2,4].includes(categoryType)"
                    v-model="searchParam.productName"
                    clearable
                    class="filter-item"
                    size="mini"
                    placeholder="产品名称"
                    @change="handleSearch"
                />
                <el-input
                    v-if="[1,2,4].includes(categoryType)"
                    v-model="searchParam.productCode"
                    clearable
                    class="filter-item"
                    size="mini"
                    placeholder="产品编号"
                    @change="handleSearch"/>
            </template>
            <template slot="table">
                <TableComponent
                    v-bind="tableData"
                    :page-index.sync="searchParam.pageIndex"
                    :page-size.sync="searchParam.pageSize"
                    @refreshList="handleSearch"
                />
            </template>

        </layout-filter>
        <template v-else>
            <no-data />
        </template>
    </div>
</template>

<script>
    // API
    import deviceSmartApi from '@/api/inventory/device'
    import deviceSimApi from '@/api/PM/section'
    import deviceOtherApi from '@/api/PM/section'
    // 方法
    import enums from '@/utils/enum'
    // 组件
    import smartColumn from '@/views/inventoryManagement/intelligentDevice/tableColumns/smart_4'
    import simColumn from '@/views/inventoryManagement/SIM/tableColumns/sim_2'
    import otherColumn from '@/views/inventoryManagement/otherProducts/tableColumns/other_2'
    import NoData from '@/components/NoData'
    export default {
        components: {
            NoData
        },
        props: {
            // 标段guid
            dataId: { type: String, default: null },
            // 品类列表
            cateList: { type: Object, default: () => {} }
        },
        data() {
            return {
                tabList: [],
                searchParam: {
                    pageSize: 10,
                    pageIndex: 1
                },
                apiParam: {},
                categoryType: null,
                productCategoryList: [],
                loading: {
                    productCategoryList: false
                },
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [],
                    options: {
                        height: '450px',
                        showPagination: true,
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    }
                },
                dataApi: null
            }
        },
        computed: {
        },
        watch: {
            dataId: {
                immediate: true,
                handler(value) {
                    if (value) this.init()
                }
            },
            'searchParam.pageSize'() {
                this.getList()
            },
            'searchParam.pageIndex'(v1, v2) {
                this.getList()
            }
        },
        mounted() {},
        methods: {
            init() {
                // 加载品类列表
                this.getCate()
            },
            handleSpaceChange(item) {
                if (item.id) {
                    // 点击品类,获取接口/列表项
                    this.categoryType = item.id
                    this.apiParam = {}
                    // 车载设备
                    if (item.id === 1) {
                        this.tableData.columns = smartColumn.columns
                        this.dataApi = deviceSmartApi.getList
                    }
                    // 人员设备
                    if (item.id === 2) {
                        this.tableData.columns = smartColumn.columns
                        this.dataApi = deviceSmartApi.getList
                    }
                    // SIM设备
                    if (item.id === 3) {
                        this.tableData.columns = simColumn.columns
                        this.dataApi = deviceSimApi.getSim
                    }
                    // 其他产品
                    if (item.id === 4) {
                        this.tableData.columns = otherColumn.columns
                        this.dataApi = deviceOtherApi.getOther
                    }
                    this.apiParam = item.searchParam
                    this.searchParam.pageIndex = 1
                    this.getList()
                }
            },
            // 导出
            handleExport() {
                const data = { ...this.searchParam }
                data.pageSize = this.tableData.total
                let exportApi
                // 车载设备
                if (this.categoryType === 1) {
                    exportApi = deviceSmartApi.export
                }
                // 人员设备
                if (this.categoryType === 2) {
                    exportApi = deviceSmartApi.export
                }
                // SIM设备
                if (this.categoryType === 3) {
                    exportApi = deviceSimApi.exportSimOrOther
                }
                // 其他产品
                if (this.categoryType === 4) {
                    exportApi = deviceOtherApi.exportSimOrOther
                }
                if (exportApi) {
                    exportApi(this.searchParam)
                }
            },
            // 筛选列表
            handleSearch(obj) {
                if (typeof obj === 'object') {
                    this.searchParam = Object.assign({}, this.searchParam, obj)
                    this.getList()
                } else {
                    if (this.searchParam.pageIndex !== 1) {
                        this.searchParam.pageIndex = 1
                    } else {
                        this.getList()
                    }
                }
            },
            // 获取品类列表
            getCate() {
                this.loading.productCategoryList = true
                // 将cateList转数组
                this.productCategoryList = []
                for (const key in this.cateList) {
                    let obj = {}
                    // 车载设备
                    if (key.indexOf('车载') > -1) {
                        obj = { label: key, count: this.cateList[key], id: 1 }
                        obj.searchParam = {
                            productType: '95E968C3-D1BE-4A6C-93A8-6AF62558B909',
                            warehousesId: 'bc5fe3a9-5b92-4aad-b7fe-acc62dcc82de',
                            typeId: this.getWarehousesSpaceType(0, '在运营')
                        }
                    }
                    // 人员设备
                    if (key.indexOf('人员') > -1) {
                        obj = { label: key, count: this.cateList[key], id: 2 }
                        obj.searchParam = {
                            productType: '288F8C2D-9CEB-46FC-87C9-DC4C16108162',
                            warehousesId: 'bc5fe3a9-5b92-4aad-b7fe-acc62dcc82de',
                            typeId: this.getWarehousesSpaceType(0, '在运营')
                        }
                    }
                    // SIM设备
                    if (key.indexOf('SIM') > -1) {
                        obj = { label: key, count: this.cateList[key], id: 3 }
                        obj.searchParam = {}
                    }
                    // 其他产品
                    if (key.indexOf('其他') > -1) {
                        obj = { label: key, count: this.cateList[key], id: 4 }
                        obj.searchParam = {}
                    }
                    this.productCategoryList.push(obj)
                }
                // 默认选中第一个
                console.log('0', this.productCategoryList[0])
                this.handleSpaceChange(this.productCategoryList[0])
                this.loading.productCategoryList = false
            },
            // 获取设备列表
            async getList() {
                if (this.dataId && this.categoryType && this.dataApi) {
                    this.tableData.options.loading = true
                    // 传入标段ID
                    this.searchParam.sectionId = this.dataId
                    const res = await this.dataApi({ ...this.searchParam, ...this.apiParam })
                    if (res.success) {
                        this.tableData.list = res.data.records
                        this.tableData.total = res.data.total
                    } else {
                        this.tableData.list = []
                    }
                    this.tableData.options.loading = false
                }
            }
        }
    }
</script>

<style lang='scss' scoped>
.group-type-list {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  width: 100%;
  .group-type-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 3px;
    width: 120px;
    border: 1px solid #c0c4cc;
    color: #c0c4cc;
    text-align: center;
    font-size: 12px;
    margin-right: 10px;
    cursor: pointer;
    &.disabled {
      border: 1px solid #cccccc;
      color: #cccccc;
    }
    &.active {
      border-color: #409eff;
      color: #409eff;
      background-color: #ecf5ff;
    }
    &:hover {
      color: #409eff;
      border-color: #409eff;
    }
  }
}
</style>
