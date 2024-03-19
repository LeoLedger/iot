<template>
    <div class="dialog-container Sfix">
        <el-dialog
            :title="title"
            :visible.sync="visible"
            :before-close="simpleClose"
            width="900px"
        >
            <div class="filter-container">
                <el-input
                    v-model="searchParam.userName"
                    placeholder="用户名称"
                    size="small"
                    style="width:200px;"
                    clearable
                />
                <el-input
                    v-model="searchParam.loginName"
                    placeholder="登录名称"
                    size="small "
                    style="width:200px;"
                    clearable
                />

                <el-cascader
                    :options="deptTreeOptions"
                    placeholder="请选择部门"
                    :props="{ checkStrictly: true }"
                    height="28"
                    size="small"
                    clearable
                    @change="onDeptChang"
                />
                <!-- 搜索 -->
                <el-button
                    class="filter-item"
                    icon="el-icon-search"
                    size="mini"
                    type="primary"
                    @click="searchUser()"
                >
                    搜索
                </el-button>
            </div>
            <!-- 列表 -->
            <TableComponent
                :list="list"
                :total="total"
                :page-size.sync="pageSize"
                :page-index.sync="pageIndex"
                :options="options"
                :columns="columns"
                @handleSelectionChange="handleSelectionChange"
            />

            <span slot="footer">
                <el-button
                    size="mini"
                    @click="simpleClose"
                >取 消</el-button>
                <el-button
                    type="primary"
                    size="mini"
                    @click="submit"
                >确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
    import { importConfigs } from '@/api/systemSet/adminConfig/index'
    import { getUserList } from '@/api/user/index'
    import TableComponent from '@/components/TableComponent'
    import { getDeptTree } from '@/api/dept/index'
    export default {
        name: 'UserSelectDialog',
        components: {
            TableComponent
        },

        props: {
            visible: {
                type: Boolean,
                default: false
            },
            title: {
                type: String
            },
            editId: {
                type: [String, Number],
                default: null
            }
        },
        data() {
            return {
                searchParam: {
                    userName: '',
                    loginName: '',
                    deptId: '',
                    isAdmin: 2
                },
                deptTreeOptions: [], // 部门树
                list: [],
                total: 0, // table数据总条数
                pageIndex: 1, // 当前页码
                pageSize: 15, // 每页数量
                options: {
                    // stripe: true, // 是否为斑马纹 table
                    loading: false, // 是否添加表格loading加载动画
                    height: 500,
                    mutiSelect: true, // 开启选择
                    mutiSelectedKey: 'id', // 根据 对应key 找出应被选中的状态
                    curRowKey: 'id',
                    showIndex: false
                },
                selectList: [],
                selectUser: [],
                columns: [
                    {
                        prop: 'userName',
                        label: '用户名称',
                        width: 400
                    },
                    {
                        prop: 'loginName',
                        label: '登录名称'
                    }
                ]
            }
        },
        watch: {
            editId: {
                immediate: true,
                handler(val) {

                }
            }
        },
        created() {
            this.searchDeptTree()
            setTimeout(() => {
                this.searchUser()
            }, 500)
        },
        methods: {
            // 直接关闭
            simpleClose() {
                this.$emit('closeDialog', false)
            },
            submit() {
                if (this.selectUser.length > 0) {
                    importConfigs({ ids: this.selectUser }).then(res => {
                        if (res.data.success) {
                            this.$notify({
                                title: '成功',
                                message: '操作成功',
                                type: 'success',
                                duration: 2000
                            })
                            this.$emit('closeDialog', true)
                        } else {
                            this.$notify({
                                title: '失败',
                                message: '添加失败',
                                type: 'warning',
                                duration: 2000
                            })
                        }
                    })
                }
            },
            searchUser() {
                getUserList(this.searchParam).then(res => {
                    if (res.data.success) {
                        this.list = res.data.data.records
                        this.total = res.data.data.total
                    }
                })
            },
            searchDeptTree() {
                getDeptTree().then(res => {
                    if (res.data.success) {
                        this.deptTreeOptions = res.data.data
                    }
                })
            },
            handleSelectionChange(val) {
                this.selectUser = []
                val.forEach(item => this.selectUser.push(item.id))
            },
            onDeptChang(deptArr) {
                if (deptArr.length > 0) {
                    this.searchParam.deptId = deptArr[deptArr.length - 1]
                } else {
                    this.searchParam.deptId = ''
                }
            }
        }
    }
</script>

<style lang='scss'>
.Sfix {
  .el-tabs__header {
    margin-bottom: 8px;
  }
  .el-tabs__content {
    height: 400px;
  }
}
</style>
