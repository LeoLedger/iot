<!--
* @description
* @author 姜庆博
!-->
<template>
    <div class="clientInfoList app-container">
        <div class="filter-container">
            <el-input
                    v-model="formData.name"
                    placeholder="套餐名称"
                    clearable
                    class="filter-item"
                    style="width:200px"
                    size="mini"
            ></el-input>
            <!-- 搜索 -->
            <el-button
                    v-waves
                    class="filter-item"
                    type="primary"
                    icon="el-icon-search"
                    @click="filterHandler"
                    size="mini"
                    v-prereclick
            >搜索
            </el-button>
            <!-- 导出 -->
            <el-button
                    v-waves
                    class="filter-item"
                    type="warning"
                    icon="el-icon-download"
                    @click="exportHander"
                    size="mini"
            >导出
            </el-button>
            <!-- 新增 -->
            <el-button
                    v-waves
                    class="filter-item"
                    type="success"
                    icon="el-icon-plus"
                    @click="changeDialog(true, 'add')"
                    size="mini"
            >新增</el-button>
        </div>
        <TableComponent :list="list"
                        :total="total"
                        v-bind:pageSize.sync="pageSize"
                        v-bind:pageIndex.sync="pageIndex"
                        :options="options"
                        :columns="columns"
                        :operates="operates"
        />
        <!-- 更改/添加 服务套餐 -->
        <PackageDialog
                v-if="formDialogVisible"
                v-bind:visible.sync="formDialogVisible"
                :formData="packageData"
                @packageSubmitCallBack="queryList"
        />
    </div>
</template>

<script>
    import TableComponent from "@/components/TableComponent";
    import DialogForm from "@/components/DialogForm"
    import waves from "@/directive/waves"; // Waves directive;
    import prereclick from "@/directive/prereclick"; // prereclick directive;
    import {companyScaleEnum, companyTypeEnum} from '@/utils/enum'

    import {
        exportServicePackage, // 导出服务套餐
        deleteServicePackageDetail, // 删除套餐信息
        searchServicePackage, // 套餐列表
    } from "@/api/clientMn";
    import PackageDialog from "./PackageDialog"

    export default {
        name: 'clientInfoList',
        components: {
            TableComponent,
            DialogForm,
            PackageDialog,
        },
        directives: {waves, prereclick},
        data() {
            const _this = this;
            return {
                formData: {
                    name: '', // 客户名称
                },
                // table 参数
                total: 0, // table数据总条数
                list: [],
                pageIndex: 1, // 当前页码
                pageSize: 15, // 每页数量
                // table 的参数
                options: {
                    // stripe: true, // 是否为斑马纹 table
                    loading: false, // 是否添加表格loading加载动画
                },
                // 需要展示的列
                columns: [
                    {
                        prop: 'name',
                        label: '套餐名称',
                        width: 180,
                        formatter: (row, column) => {
                            const text = row.name || '';
                            return `<span class="infotext" title="${text}">${text || '- -'}</span>`
                        }
                    }, {
                        prop: 'userCount',
                        label: '用户数量（人）',
                        unPrecision: true,
                        width: 110
                    }, {
                        prop: 'smsCount',
                        label: '短信数量（条）',
                        width: 110,
                    }, {
                        prop: 'storageSize',
                        label: '存储空间（GB）',
                        width: 120,
                    }, {
                        prop: 'referenceAmount',
                        label: '年服务费参考金额（元）',
                        width: 200,
                        formatter: (row, column) => {
                            if (typeof row.referenceAmount === 'undefined') {
                                return '- -'
                            }
                            const money = row.referenceAmount;
                            return this.getMoneyStr(money)
                        }
                    }, {
                        prop: 'remarks',
                        label: '备注说明',
                        minWidth: 280
                    },
                ],
                // 列操作按钮
                operates: {
                    width: 120,
                    fixed: 'right',
                    type: 'btn',
                    list: [
                        {
                            label: '编辑',
                            icon: 'el-icon-edit',
                            show: true,
                            method: async (index, row) => {
                                console.log('编辑', JSON.stringify(row))
                                this.packageData = row;
                                this.changeDialog(true, 'edit')
                            }
                        }, {
                            label: '删除',
                            type: 'danger',
                            icon: 'el-icon-delete',
                            show: true,
                            disabled: false,
                            method: async (index, row) => {
                                this.deleteDetailInfo(row.id)
                            }
                        }
                    ]
                },
                // 配置服务套餐
                formDialogVisible: false,
                packageData: {},
            }
        },
        created() {
            this.queryList();
        },
        watch: {
            pageIndex(newData, oldDate) {
                this.queryList();
            },
            pageSize(newData, oldDate) {
                this.queryList();
            },
        },
        methods: {
            deleteDetailInfo(id) {
                this.$confirm("此操作将删除此记录, 是否继续?", "提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning",
                    center: true
                }).then(() => {
                    deleteServicePackageDetail(id).then(res => {
                        const {success, message} = res.data;
                        if (success) {
                            this.$message({
                                type: "success",
                                message: "删除成功!"
                            });
                            // 删除成功 将页数减去1 避免bugger
                            if(this.list.length === 1 && this.pageIndex > 1) {
                                this.pageIndex--
                            }
                            this.queryList()
                        } else {
                            this.$message.error(message);
                        }
                    });
                })
                    .catch(() => {
                    });
            },
            // 请求数据列表
            queryList() {
                const _this = this,
                    {
                        pageSize,
                        pageIndex,
                        options,
                        formData
                    } = this;
                console.error(formData, 'formData')
                options.loading = true;
                const params = {
                    pageIndex, // 当前页码
                    pageSize, // 每页数量
                    ...formData
                };
                searchServicePackage(params).then(res => {
                    const {data} = res.data;
                    console.log(data);
                    _this.options.loading = false; // 更改加载中的 loading值
                    _this.list = data.rows || [];
                    _this.total = data.records;
                });
            },
            // 导出
            exportHander() {
                const {
                    pageSize, // 当前页码
                    pageIndex, // 每页数量
                    formData
                } = this;
                // console.error(formData, 'formData')
                const params = {
                    pageIndex,
                    pageSize,
                    ...formData
                };
                exportServicePackage(params)
            },
            // 查找
            filterHandler() {
                this.pageIndex = 1; // 初始为1
                this.queryList();
            },
            changeDialog(bool, type) {
                this.formDialogVisible = bool;
                if (bool && type === 'add') {
                    this.packageData = {}
                }
            },
            getMoneyStr(num) {
                return (+num).toLocaleString('zh', {minimumFractionDigits: 2, maximumFractionDigits: 2});
            },
        }
    }
</script>

<style lang='scss' scoped>
    .clientInfoList {
        /deep/ {
            * {
                font-size: 12px;
            }
        }
    }
</style>
