<!--
* @description 列表配置窗口
* @author yc
!-->
<template>
    <el-dialog
        :title="title"
        :visible="visible"
        :close-on-click-modal="false"
        :width="width"
        append-to-body
        @close="$emit('update:visible', false)"
    >
        <layout-filter
            :filter-model.sync="filterParam"
            :table-columns="tableConfig.columns"
            @search="handleFilter"
        >
            <template slot="filter">
                <template v-for="item in filterConfig.item">
                    <FilterItem
                        v-if="item.visible !== false"
                        :key="item.name"
                        :item="item"
                        :filter-param="filterParam"
                        class="filter-item"
                        @change="handleFilter"
                    />
                </template>
            </template>
            <template slot="filter-popup">
                <template v-for="item in filterConfig.popupItem">
                    <layout-filter-item
                        v-if="item.visible !== false"
                        :key="item.name"
                        :label="item.label"
                    >
                        <FilterItem
                            :item="item"
                            :filter-param="filterParam"
                        />
                    </layout-filter-item>
                </template>
            </template>
            <template slot="table">
                <TableComponent
                    ref="TableComponent"
                    v-bind="tableConfig"
                    :list="dataList"
                    :total="dataTotal"
                    :page-size.sync="filterParam.pageSize"
                    :page-index.sync="filterParam.pageIndex"
                    @refreshList="handleRefreshList"
                />
            </template>
        </layout-filter>
    </el-dialog>
</template>

<script>
    // 方法
    import { filterList } from '@/utils'
    // 组件
    import FilterItem from './FilterItem'

    export default {
        name: 'ListConfigDialog',
        components: {
            FilterItem
        },
        props: {
            // 不传请求方法时，可传自定义数据
            list: Array,
            // 窗口宽度
            width: { type: String, default: '1200px' },
            // 窗口高度
            height: { type: String, default: '634px' },
            // 标题文本
            title: String,
            // 显示状态
            visible: { type: Boolean, default: false },
            // 表格配置
            table: Object,
            // 筛选项配置
            filter: Object,
            // 请求方法
            method: Function,
            // 请求参数
            params: Object
        },
        data() {
            return {
                loading: false,
                dataList: [],
                dataTotal: 0,
                filterParam: {
                    pageSize: 15,
                    pageIndex: 1
                }
            }
        },
        computed: {
            tableConfig() {
                let config = {
                    options: {
                        loading: false
                    },
                    ...this.table
                }
                if (this.table instanceof Object) {
                    config.options = {
                        stripe: true,
                        showIndex: true,
                        ...this.table.options,
                        height: this.height,
                        loading: this.loading
                    }
                }
                config.options.loading = this.loading
                return config
            },
            filterConfig() {
                return {
                    item: [],
                    popupItem: [],
                    ...this.filter
                }
            }
        },
        watch: {
            method() {
                this.handleFilter()
            },
            params: {
                deep: true,
                handler() {
                    this.request()
                }
            },
            'filterParam.pageSize'() {
                this.filterData()
            },
            'filterParam.pageIndex'() {
                this.filterData()
            }
        },
        mounted() {
            this.handleFilter()
        },
        methods: {
            // 获取列表数据
            async request() {
                this.loading = true
                let { data } = await this.method({
                    ...this.filterParam,
                    ...this.params
                })
                this.dataList = data.records
                this.dataTotal = data.total
                this.loading = false
            },
            // 筛选数据
            filterData() {
                if (this.method instanceof Function) {
                    this.request()
                } else {
                    let { pageSize, pageIndex } = this.filterParam
                    let list = filterList(
                        this.dataList,
                        this.filterParam,
                        this.filterConfig.item.concat(this.filterConfig.popupItem).map(item => {
                            return {
                                name: item.name,
                                type: item.filterType
                            }
                        })
                    )
                    this.dataList = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
                    this.dataTotal = list.length
                }
            },
            // 筛选时触发
            handleFilter() {
                if (this.filterParam.pageIndex !== 1) {
                    this.filterParam.pageIndex = 1
                } else {
                    this.filterData()
                }
            },
            // 点击排序时触发
            handleRefreshList(data) {
                this.filterParam = Object.assign({}, this.filterParam, data)
                this.request()
            }
        }
    }
</script>

<style lang='scss' scoped>

</style>
