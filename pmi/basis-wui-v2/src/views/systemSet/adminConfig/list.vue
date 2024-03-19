<template>
    <div class="app-container problemAn">
        <div class="rigthSide">
            <div class="filter-container">
                <!-- 搜索 -->
                <el-button
                    class="filter-item"
                    icon="el-icon-plus"
                    size="mini"
                    type="primary"
                    @click="importConfig()"
                >
                    调入
                </el-button>
                <!-- 新增 -->
                <el-button
                    class="filter-item"
                    icon="el-icon-minus"
                    size="mini"
                    type="danger"
                    @click="exportConfig()"
                >
                    调出
                </el-button>
                <!-- 新增 -->
                <el-button
                    class="filter-item"
                    icon="el-icon-refresh"
                    size="mini"
                    type="success"
                    @click="refreshConfig()"
                >
                    刷新
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
                :selected-list="selectList"
                @handleSelectionChange="handleSelectionChange"
            />
        </div>

        <UserSelectDialog
            title="选择人员"
            :visible="showUserDialog"
            @closeDialog="closeDialog()"
        />
    </div>
</template>

<script>

    import TableComponent from '@/components/TableComponent'
    import UserSelectDialog from './components/useSelectDialog'
    import { getConfigList, exportConfigs } from '@/api/systemSet/adminConfig/index.js'

    export default {
        name: 'AdminConfigList',
        components: {
            TableComponent,
            UserSelectDialog
        },
        props: {},
        data() {
            return {
                showUserDialog: false,
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
                        width: 600
                    },
                    {
                        prop: 'loginName',
                        label: '登录名称'
                    }
                ]
            }
        },
        computed: {

        },
        created() {
            this.getList()
        },
        mounted() {

        },
        methods: {
            getList() {
                getConfigList(this.searchParam).then(res => {
                    if (res.data.success) {
                        this.list = res.data.data
                    }
                })
            },
            importConfig() {
                this.showUserDialog = true
            },
            exportConfig() {
                exportConfigs({ ids: this.selectList.map(v => v.id) }).then(res => {
                    if (res.data.success) {
                        this.$notify({
                            title: '提示',
                            type: 'success',
                            message: '操作成功',
                            duration: 2000 })
                        this.getList()
                    }
                })
            },
            handleSelectionChange(val) {
                this.selectList = val
            },
            closeDialog() {
                this.showUserDialog = false
                this.getList()
            },
            refreshConfig() {
                this.getList()
            }
        }
    }
</script>

<style lang="scss" scoped>
    .problemAn {
        display: flex;
        height: calc(100vh - 50px);
        .leftSide {
            /*flex: 18;*/
            width: 18%;
            float: left;
            overflow: hidden;
            position: relative;
            .box {
                border: 1px solid #ebeef5;
                width: 100%;
                padding: 10px;
                border-radius: 5px;
                position: absolute;
                height: calc(100vh - 125px);
                top: 0;
                bottom: 0;
            }
        }
        .rigthSide {
            width: 100%;
            /*flex: 80;*/
            float: left;
            overflow: scroll;
            margin-left: .5%;
            @at-root {
                .content {
                    display: flex;
                    padding-top: 10px;
                    border: 1px solid #ebeef5;
                    border-top: 0;
                    .formDetail {
                        flex: 7;
                    }
                    .handlerBox {
                        display: flex;
                        flex: 4;
                        justify-content: flex-end;
                        align-items: self-end;
                        padding-right: 20px;
                    }
                }

            }

        }
    }
</style>
