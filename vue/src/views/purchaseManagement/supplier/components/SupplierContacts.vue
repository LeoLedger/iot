<!--
* @description 供应商联系人列表
* @author 望浩然
!-->
<template>
    <TableComponent
        v-bind="tableData"
        empty-hide-table
        @refreshList="handleSearch"
    >
        <template slot="操作" slot-scope="{$index, row}">
            <el-button
                type="danger"
                size="mini"
                icon="el-icon-delete"
                title="删除"
                @click="handleDelete($index, row)"
            />
        </template>
    </TableComponent>
</template>

<script>
    // API
    import contactsApi from '@/api/PM/contacts'
    // 方法
    // 组件
    export default {
        components: {
        },
        props: {
            isEdit: { type: Boolean, default: true },
            customerId: { type: String, default: null }
        },
        data() {
            return {
                searchParam: {
                    pageIndex: 1,
                    pageSize: 50,
                    customerId: null
                },
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'name',
                            label: '姓名',
                            fixed: 'left'
                        },
                        {
                            prop: 'deptName',
                            label: '所属部门'
                        },
                        {
                            prop: 'position',
                            label: '职务'
                        },
                        {
                            prop: 'phone',
                            label: '联系电话',
                            width: 150
                        },
                        {
                            prop: 'email',
                            label: '邮箱',
                            width: 150
                        }
                    ],
                    options: {
                        height: null,
                        maxHeight: null,
                        showPagination: false,
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    },
                    // 列操作按钮
                    operates: {
                        width: 60,
                        fixed: 'right',
                        show: this.isEdit
                    }
                }
            }
        },
        computed: {
        },
        watch: {
            customerId() {
                this.searchParam.pageIndex = 1
                this.getList()
            }
        },
        mounted() {
            this.getList()
        },
        methods: {
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
            async getList() {
                if (this.customerId) {
                    this.searchParam.customerId = this.customerId
                    this.tableData.options.loading = true
                    const params = Object.assign({}, this.searchParam)
                    const res = await contactsApi.getList(params)
                    if (res.success) {
                        console.log('this.tableData.list', res.data)
                        this.tableData.list = res.data.records
                        this.tableData.total = res.data.total
                    }
                    this.tableData.options.loading = false
                } else this.$message({ type: 'warning', message: '获取供应商ID失败' })
            },
            handleDelete(index, row) {
                const _this = this
                this.$confirm('是否确认删除该联系人?', '警告', {
                    confirmButtonText: '删除',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                }).then(() => {
                    _this.tableData.options.loading = true
                    contactsApi.delete(row.id).then(res => {
                        if (res.success) {
                            _this.getList()
                            _this.$notify({
                                title: '成功',
                                message: '删除成功',
                                type: 'success',
                                duration: 2000
                            })
                        }
                        _this.tableData.options.loading = false
                    })
                }).catch(() => {})
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
