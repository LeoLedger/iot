<!--
* @description 产品列表
* @author yc
!-->
<template>
    <layout-col height="100%">
        <layout-row>
            <layout-col auto>
                <div class="layout-filter">
                    <el-select
                        v-if="!isCreate"
                        v-model="searchParam.version"
                        size="mini"
                        placeholder="请选择版本"
                        class="filter-item"
                        @change="handleFilter(true)"
                    >
                        <el-option
                            v-for="option in versionOptions"
                            :key="option.value"
                            :value="option.value"
                            :label="option.label"
                        />
                    </el-select>
                </div>
            </layout-col>
            <layout-col>
                <div v-if="isEdit && latestVersion" class="layout-filter">
                    <el-button
                        v-waves
                        size="mini"
                        class="filter-button"
                        type="success"
                        icon="el-icon-plus"
                        @click="handleAdd()"
                    >添加</el-button>
                </div>
            </layout-col>
        </layout-row>
        <layout-row auto>
            <TableComponent
                ref="TableComponent"
                v-bind="tableData"
                :page-index.sync="searchParam.pageIndex"
                :page-size.sync="searchParam.pageSize"
                :empty-hide-table="!isEdit"
            >
                <template slot="操作" slot-scope="{row}">
                    <el-dropdown v-if="latestVersion" trigger="click" size="small">
                        <el-button
                            size="mini"
                            icon="el-icon-more"
                            title="操作"
                        />
                        <el-dropdown-menu slot="dropdown">
                            <div class="layout-dropdown-item" @click="handleDelete(row)">
                                <el-dropdown-item icon="el-icon-delete" divided>删除</el-dropdown-item>
                            </div>
                        </el-dropdown-menu>
                    </el-dropdown>
                </template>
            </TableComponent>
        </layout-row>
        <div>
            <SelectDialog
                v-if="selectDialog.visible"
                v-bind="selectDialog"
                :visible.sync="selectDialog.visible"
                @change="handleSelectDialogChange"
            />
        </div>
    </layout-col>
</template>

<script>
    // API
    import productApi from '@/api/purchase/product'
    // 方法
    // 组件

    export default {
        name: 'MaterialList',
        components: {
        },
        props: {
            dataId: null,
            isEdit: { type: Boolean, default: false },
            isCreate: { type: Boolean, default: false }
        },
        data() {
            this.defaultParam = {
                version: '',
                pageSize: 10,
                pageIndex: 1
            }
            return {
                dataList: [],
                tableData: {
                    list: [],
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            minWidth: 120,
                            idKey: 'productId',
                            isClick: true,
                            dialogType: 'product'
                        },
                        {
                            prop: 'productName',
                            label: '产品名称',
                            width: 120
                        },
                        {
                            type: 'dict',
                            dictType: 'productType',
                            prop: 'productType',
                            label: '产品类型',
                            width: 80
                        },
                        {
                            type: 'dict',
                            dictType: 'productCategory',
                            prop: 'productCategory',
                            label: '产品种类',
                            width: 80
                        },
                        {
                            prop: 'supplierName',
                            label: '供应商',
                            width: 140
                        },
                        {
                            prop: 'number',
                            label: '数量',
                            width: 130,
                            render: (h, { row, column }) => {
                                return (
                                    <el-input-number
                                        value={row[column.prop]}
                                        onInput={res => { row[column.prop] = res }}
                                        placeholder='请输入'
                                        min={0}
                                        size='mini'
                                        controls-position='right'
                                        style='width:100%;'
                                    />
                                )
                            },
                            isRender: () => this.isEdit && this.latestVersion
                        }
                    ],
                    options: {
                        rules: {
                            number: {
                                validator: (rule, value, callback) => {
                                    if (value === 0) {
                                        callback(new Error())
                                    }
                                    callback()
                                },
                                message: 'BOM清单第 ${index} 行产品的数量不能小于1',
                                trigger: 'change'
                            }
                        },
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: this.isEdit ? '100%' : null,
                        onePageHidePagination: true
                    },
                    // 列操作按钮
                    operates: {
                        width: 60,
                        fixed: 'right',
                        show: this.isEdit
                    }
                },
                searchParam: {
                    ...this.defaultParam
                },
                selectDialog: {
                    visible: false
                },
                versionOptions: []
            }
        },
        computed: {
            // 是否最新版本
            latestVersion() {
                if (this.versionOptions.length) {
                    return this.searchParam.version === this.versionOptions[0].value
                }
                return true
            }
        },
        watch: {
            dataId() {
                this.queryList()
            },
            'searchParam.pageSize'() {
                this.filterData()
            },
            'searchParam.pageIndex'() {
                this.filterData()
            }
        },
        mounted() {
            if (!this.isCreate) {
                this.loading = true
                productApi.getVersion(this.dataId).then(({ data }) => {
                    if (data.length) {
                        this.searchParam.version = data[0]
                    }
                    this.versionOptions = data.map(item => {
                        return {
                            label: `版本：${item}`,
                            value: item
                        }
                    })
                    this.queryList()
                })
            }
        },
        methods: {
            // 验证表单
            validate() {
                return new Promise((resolve, reject) => {
                    // 如果当前查看版本不是最新版本,返回null
                    if (this.latestVersion) {
                        let list = this.dataList
                        let index = list.findIndex(v => v.number < 1)
                        if (index > -1) {
                            // 计算出第一个验证不通过的数据的所在页码
                            let pageIndex = Math.max(Math.ceil(index / this.searchParam.pageSize), 1)
                            this.searchParam = {
                                ...this.defaultParam,
                                pageIndex
                            }
                            this.filterData()
                            this.$emit('failure')
                            this.$nextTick(() => {
                                this.$refs.TableComponent.validate()
                            })
                            reject()
                        } else {
                            resolve(list)
                        }
                    } else {
                        resolve(null)
                    }
                })
            },
            // 获取基础信息
            async queryList() {
                if (this.dataId) {
                    this.loading = true
                    let { data } = await productApi.getBOM({
                        productId: this.dataId,
                        version: this.searchParam.version
                    })
                    this.dataList = data
                    this.filterData()
                    this.loading = false
                }
            },
            // 过滤列表
            filterData() {
                let { pageSize, pageIndex } = this.searchParam
                let list = this.dataList
                this.tableData.total = list.length
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
            },
            // 筛选列表
            handleFilter(isRequest) {
                if (this.searchParam.pageIndex !== 1) {
                    this.searchParam.pageIndex = 1
                } else {
                    if (isRequest) {
                        this.queryList()
                    } else {
                        this.filterData()
                    }
                }
            },
            // 点击添加按钮时触发
            handleAdd() {
                this.selectDialog = {
                    type: 'product',
                    title: '添加BOM清单',
                    visible: true,
                    multiple: true,
                    extendParams: {
                        type: '20219e61-ba33-11eb-9dc0-00163e044960',
                        categoryId: 'FBB2B7F6-CD9A-48CA-8300-C72D34BC3100',
                        excludeIds: this.dataList.map(v => v.productId),
                        lockedProps: ['type', 'categoryId']
                    }
                }
            },
            // 点击删除按钮时触发
            handleDelete(index) {
                this.dataList.splice(index, 1)
                this.filterData()
            },
            // 选择物料后触发
            handleSelectDialogChange(list) {
                this.dataList = list.map(item => {
                    return {
                        number: 0,
                        productId: item.guidId,
                        productName: item.name,
                        productCode: item.code,
                        productType: item.type,
                        productCategory: item.categoryId,
                        supplierName: item.supplierName
                    }
                }).concat(this.dataList)
                this.filterData()
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
