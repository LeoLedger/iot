<!--
* @description 库存管理-智能设备
* @fileName index.vue
* @author 望浩然
!-->
<template>
    <div class="inventory-container">
        <layout-template
            :table-columns.sync="tableData.columns"
            :filter-model.sync="searchParam"
            :filter-button="checkFeature(['ty.iot.intelligentDevice.search'])"
            @search="handleSearch"
        >
            <template slot="left">
                <layout-box width="240px">
                    <layout-col height="100%">
                        <layout-row class="group-filter">
                            <layout-col width="50%">
                                仓库列表
                            </layout-col>
                            <layout-col width="50%">
                                <div style="display: flex;flex-direction: row;justify-content: flex-end">
                                    <el-button type="primary" size="mini" icon="el-icon-refresh" style="padding: 3px 10px;" @click="getWarehousesList"/>
                                    <el-button v-if="checkFeature(['ty.iot.warehouses.create'])" type="success" icon="el-icon-plus" size="mini" style="padding: 3px 10px;" @click="handleGroupAdd"/>
                                </div>
                            </layout-col>
                        </layout-row>
                        <layout-row auto not-flex>
                            <div v-loading="loading.warehouses" class="group-list">
                                <no-data v-if="!warehousesList.length" text="请添加仓库" />
                                <div
                                    v-for="(item, index) in warehousesList"
                                    :key="index"
                                    :class="{ active: searchParamsLock.warehousesId === item.guidId }"
                                    class="group-item"
                                    @click="onClickChangeWareHouse(item)">
                                    <i class="el-icon-s-home icon" />
                                    <span class="text">{{ item.name }}</span>
                                    <el-popover
                                        :visible-arrow="false"
                                        placement="right-start"
                                        popper-class="rightMenuPopover"
                                        trigger="hover">
                                        <div class="list">
                                            <div class="item" @click="handleGroupDetail(item)">
                                                <span class="icon el-icon-s-comment" />
                                                <span class="text">详情</span>
                                            </div>
                                            <div v-if="checkFeature(['ty.iot.warehouses.update'])" class="item" @click="handleGroupEdit(item)">
                                                <span class="icon el-icon-edit" />
                                                <span class="text">编辑</span>
                                            </div>
                                            <div v-if="checkFeature(['ty.iot.warehouses.delete'])" class="item" @click="handleGroupDelete(item, () => {getWarehousesList()})">
                                                <span class="icon el-icon-delete-solid" />
                                                <span class="text">删除</span>
                                            </div>
                                        </div>
                                        <span slot="reference" class="more el-icon-s-tools"/>
                                    </el-popover>
                                </div>
                            </div>
                        </layout-row>
                    </layout-col>
                </layout-box>
            </template>
            <template slot="filter-top">
                <div class="group-type-list">
                    <el-tag v-if="loading.shippingSpace" type="primary">
                        <i class="el-icon-loading" />
                        {{ '正在加载仓位列表...' }}
                    </el-tag>
                    <template v-else>
                        <div
                            v-for="(item, index) in shippingSpaceList"
                            :key="index"
                            :class="{active: searchParamsLock.warehousesSpaceId === item.guidId}"
                            class="group-type-item"
                            @click="handleChangeSpace(item)">
                            <div>{{ item.productTypeData || '--' }}</div>
                            <div>{{ item.name }}</div>
                        </div>
                    </template>
                </div>
            </template>
            <template slot="button">
                <el-button
                    v-waves
                    v-prereclick
                    v-if="checkFeature(['ty.iot.intelligentDevice.export'])"
                    type="warning"
                    size="mini"
                    class="filter-item"
                    icon="el-icon-download"
                    @click="handleExport"
                >导出</el-button>
                <el-button
                    v-waves
                    v-prereclick
                    v-if="btnOption && btnOption.buttonLabel && checkFeature([btnOption.accessKey])"
                    :type="btnOption.buttonType"
                    :icon="btnOption.buttonIcon"
                    size="mini"
                    class="filter-item"
                    @click="btnOption.buttonAction({ ...searchParam, ...searchParamsLock })"
                >{{ btnOption.buttonLabel }}</el-button>
            </template>
            <template slot="filter">
                <FilterOther
                    :search-param="searchParam"
                    :product-type-list="productTypeList"
                    @change="handleSearch"
                />
            </template>
            <component
                slot="filter-popup"
                ref="filterPopup"
                :is="warehousesSpaceFilterPopup[sdk]"
                :search-params="searchParam"
            />
            <template slot="table">
                <TableComponent
                    v-if="!loading.tableList"
                    v-bind="tableData"
                    :cur_row="currentRow"
                    :page-index.sync="searchParam.pageIndex"
                    :page-size.sync="searchParam.pageSize"
                    @refreshList="handleSearch"
                    @handleCurrentChange="handleRowClick"
                />
            </template>

        </layout-template>
        <!-- 仓库操作子窗口 -->
        <group-edit-dialog
            v-if="groupDialog.visible"
            v-bind="groupDialog"
            @close="handleDialogEvent('groupDialog')"
            @confirm="getWarehousesList"
        />
        <!-- 入库申请单窗口 -->
        <StoragePutDialog
            v-if="putInDialog.visible"
            :visible.sync="putInDialog.visible"
            :is-edit="true"
        />
    </div>
</template>
<script>
  // 工具
    import mixin from '@/views/inventoryManagement/mixin'
    // API
    import warehousesApi from '@/api/inventory/warehouses'
    import deviceApi from '@/api/inventory/deviceOther'
    // 组件
    import GroupEditDialog from '@/views/inventoryManagement/warehouses/groupEditDialog'
    import StoragePutDialog from '@/views/businessDocuments/components/StoragePut/components/UpdateDialog'
    export default {
        components: {
            GroupEditDialog, StoragePutDialog
        },
        mixins: [mixin],
        props: {},
        data() {
            return {
                // 当前选中行
                currentRow: null,
                // 列表数据源及配置项
                tableData: {
                    list: [],
                    total: 0,
                    options: {
                        stripe: true,
                        loading: false,
                        curRowKey: 'id' // 高亮当前判断的 key
                    },
                    // 列操作按钮
                    operates: {
                        width: 100,
                        fixed: 'right',
                        show: false
                    },
                    columns: []
                },
                // 列表过滤对象
                searchParam: {
                    pageIndex: 1,
                    pageSize: 15,
                    unitResidual: [],
                    name: '',
                    code: ''
                },
                // 数据源
                shippingSpaceList: [],
                warehousesList: [],
                productTypeList: [],
                // 加载
                loading: {
                    warehouses: true,
                    shippingSpace: true,
                    tableList: true
                },
                // 组窗口
                groupDialog: {
                    visible: false,
                    dataId: null,
                    type: 'create' // 'edit' or 'detail'
                }
            }
        },
        computed: {},
        watch: {
            'searchParam.pageSize'() {
                this.getList()
            },
            'searchParam.pageIndex'() {
                this.getList()
            },
            'searchParamsLock.warehousesSpaceId'(val) {
                this.getList()
            }
        },
        mounted() {
            this.init()
        },
        methods: {
            /** 初始化 */
            init() {
                // 当前页面的产品类型
                this.productType = 'FBB2B7F6-CD9A-48CA-8300-C72D34BC3100'
                // 获取仓库列表
                this.getWarehousesList()
                // 根据仓位类型,获取列表项
                this.tableData.columns = this.warehousesSpaceTableColumns[this.sdk]
            },
            /** 加载数据 */
            // 获取设备列表数据
            async getList() {
                this.tableData.options.loading = true
                const params = Object.assign({}, this.searchParam, this.searchParamsLock)
                const res = await deviceApi.getList(params)
                if (res.success) {
                    this.tableData.list = res.data.records
                    this.tableData.total = res.data.total
                    deviceApi.num(params).then(res => {
                        const item = this.shippingSpaceList.find(item => item.guidId === params.warehousesSpaceId)
                        item.productTypeData = res.data.num
                    })
                }
                setTimeout(() => {
                    this.tableData.options.loading = false
                }, 500)
            },
            // 获取仓库列表
            async getWarehousesList() {
                this.loading.warehouses = true
                const res = await warehousesApi.getList(this.productType)
                if (res.success) {
                    this.warehousesList = res.data
                    // 自动选中第一个仓库
                    if (this.warehousesList && this.warehousesList.length) {
                        this.searchParamsLock.warehousesId = this.warehousesList[0].guidId
                        this.loading.warehouses = false
                        // 获取仓位,并自动选中第一个
                        await this.getWarehouseShippingSpace(this.warehousesList[0].guidId)
                    }
                }
                setTimeout(() => {
                    this.loading.warehouses = false
                }, 500)
            },
            // 获取仓库详情,从详情里获取仓位信息
            async getWarehouseShippingSpace(guidId) {
                // 重置仓位列表
                this.loading.shippingSpace = true
                this.loading.tableList = true
                this.shippingSpaceList = []
                // 重置列表字段
                this.$set(this.tableData, 'columns', [])
                const res = await warehousesApi.getStatistics({ guidId, type: this.productType })
                if (res.success) {
                    const shippingSpaceList = res.data
                    if (shippingSpaceList && shippingSpaceList.length) {
                        // 初始化可用仓位列表
                        const enable_shippingSpaceList = []
                        // 可用仓位过滤
                        shippingSpaceList.map(item => {
                            // 如果仓位的产品类型为当前页的产品类型,则保留
                            if (item.productType === this.productType) {
                                enable_shippingSpaceList.push(item)
                            }
                        })
                        // 判断是否有可用仓位
                        if (enable_shippingSpaceList.length) {
                            this.shippingSpaceList = enable_shippingSpaceList
                            this.searchParamsLock.warehousesSpaceId = enable_shippingSpaceList[0].guidId
                            // 给通用变量 当前仓位类型 赋值,用以获取mixin中值
                            this.currentSpaceType = enable_shippingSpaceList[0].type
                            // 根据仓位类型获取列表项
                            this.$set(this.tableData, 'columns', this.warehousesSpaceTableColumns[this.sdk])
                            // 提前结束仓位的加载效果
                            setTimeout(() => {
                                this.loading.tableList = false
                                this.loading.shippingSpace = false
                            }, 500)
                            // 获取仓位里的产品列表
                            await this.getList()
                        } else {
                            this.searchParamsLock.warehousesSpaceId = ' '
                            this.currentSpaceType = 0
                            // 根据仓位类型获取列表项
                            this.$set(this.tableData, 'columns', [])
                            setTimeout(() => {
                                this.loading.tableList = false
                                this.loading.shippingSpace = false
                            }, 500)
                        }
                    }
                }
                setTimeout(() => {
                    this.loading.shippingSpace = false
                }, 500)
            },
            /** 点击事件类 */
            // 查看项目详情
            onClickProjectDetail(row) {},
            /** 事件处理 */
            // 搜索
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
            handleChangeSpace(item) {
                this.$set(this.tableData, 'columns', [])
                this.loading.tableList = true
                // 切换仓位时, 当前页重置
                this.searchParam.pageIndex = 1
                // 更新仓位ID和仓位类型
                this.searchParamsLock.warehousesSpaceId = item.guidId
                this.currentSpaceType = item.type
                // 根据仓位类型获取列表项
                this.$set(this.tableData, 'columns', this.warehousesSpaceTableColumns[this.sdk])
                setTimeout(() => {
                    this.loading.tableList = false
                }, 500)
            },
            // 行点击
            handleRowClick() {},
            // 导出
            handleExport() {
                const data = { ...this.searchParam }
                data.pageSize = this.tableData.total
                deviceApi.export({ ...this.searchParam, ...this.searchParamsLock })
            },
            // 删除
            handleDel(row) {
                this.$confirm('是否确认删除?', '警告', {
                    confirmButtonText: '删除',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                }).then(() => {
                    this.getList()
                }).catch(() => {})
            },
            // 窗口事件通用处理器
            handleDialogEvent(objName, funcName) {
                this[objName].visible = false
                this[objName].dataId = null
                // 执行事件
                if (funcName && this[funcName]) {
                    this[funcName]()
                }
            },
            // 左侧 - 点击切换仓库
            onClickChangeWareHouse(item) {
                // 切换仓库时, 当前页重置
                this.searchParam.pageIndex = 1
                // 重置仓位列表
                this.shippingSpaceList = []
                this.searchParamsLock.warehousesId = item.guidId
                // 切换仓库时重新加载仓位
                this.getWarehouseShippingSpace(item.guidId)
            }
        }
    }
</script>

<style lang="scss">
.inventory-container {
  height: 100%;
}
.rightMenuPopover {
  padding: 0;
  border-radius: 0;
  width: 90px;
  min-width: 0;
  .list {
    display: flex;
    flex-direction: column;
    .item {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 10px;
      border-bottom: 1px solid #dcdfe6;
      cursor: pointer;
      &:hover {
        background: #ecf5ff;
        .icon,
        .text {
          color: #409eff;
        }
      }
      .icon {
        font-size: 14px;
        margin-right: 10px;
        color: #7f7f7f;
      }
      .text {
        color: #7f7f7f;
        font-size: 12px;
      }
      &:last-child {
        border-bottom: none;
      }
    }
  }
}
</style>
<style lang='scss' scoped>
.group-filter{
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom:solid 1px #ebeef5;
  align-items: center;
}
.group-list{
  overflow: auto;
  height: 100%;
  .group-item {
    background: #f4f6f7;
    font-size: 12px;
    margin-bottom: 1px;
    cursor: pointer;
    transition: 0.3s ease-in-out;
    color: #333;
    display: flex;
    align-items: center;
    padding: 10px;
    position: relative;
    animation: bounceInLeft 1s cubic-bezier(0.215, 0.610, 0.355, 1.000);
    &.active {
      background: #ecf5ff;
      color: #409eff;
      .icon {
        color: #409eff;
      }
    }
    &:hover {
      color: #409eff;
      .icon {
        color: #409eff;
      }
    }
    .text{
      flex: 1;
      margin-left: 10px;
    }
    .icon{
      font-size: 20px;
      color: #aaa;
    }
    .more {
      color: #aaa;
      font-size: 18px;
      &:hover {
        animation:ty-animation-simple-rotate 1.5s linear infinite;
        color: #409eff;
      }
    }
  }
}
.group-type-list {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
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
/* 简易动画 自转效果
* 使用方法：animation: ty-animation-simple-rotate 1s linear infinite;
                     [keyframe动画名称] [完成动画周期时长] [动画速度曲线] [循环方式]
*/
@keyframes ty-animation-simple-rotate{
  0%{-webkit-transform:rotate(0deg);}
  25%{-webkit-transform:rotate(90deg);}
  50%{-webkit-transform:rotate(180deg);}
  75%{-webkit-transform:rotate(270deg);}
  100%{-webkit-transform:rotate(360deg);}
}

@keyframes bounceInLeft {
  0% {
    opacity: 0;
    transform: translate3d(-3000px, 0, 0);
  }
  60% {
    opacity: 1;
    transform: translate3d(25px, 0, 0);
  }
  75% {
    transform: translate3d(-10px, 0, 0);
  }
  90% {
    transform: translate3d(5px, 0, 0);
  }
  100% {
    transform: none;
  }
}

</style>
