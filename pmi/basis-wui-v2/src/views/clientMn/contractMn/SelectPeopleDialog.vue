<template>
    <div style="paddingTop:10px">
        <el-dialog
                title="选择操作人"
                width="60%"
                :close-on-click-modal="false"
                :visible="visible"
                @close="() => changeDialog(false)"
        >
            <div class="filter-container">
                <el-select
                        class="filter-item"
                        filterable
                        clearable
                        v-model="formData.companyType"
                        placeholder="企业类型"
                        size="mini"
                        style="width:200px"
                >
                    <el-option
                            v-for="item in companyTypeEnum"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                    ></el-option>
                </el-select>
                <el-select
                        class="filter-item"
                        filterable
                        clearable
                        v-model="formData.companyScale"
                        placeholder="企业规模"
                        size="mini"
                        style="width:200px"
                >
                    <el-option
                            v-for="item in companyScaleEnum"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                    ></el-option>
                </el-select>
                <el-input
                        v-model="formData.name" placeholder="客户名称" class="filter-item"
                        clearable style="width:200px" size="mini"
                ></el-input>
                <el-button
                        class="filter-item" type="primary" icon="el-icon-search" size="mini"
                        @click="filterHandler"
                >搜索
                </el-button>
            </div>
            <TableComponent :list="list"
                            :total="total"
                            v-bind:pageSize.sync="pageSize"
                            v-bind:pageIndex.sync="pageIndex"
                            :options="options"
                            :columns="columns"
                            @handleCurrentChange="handleCurrentChange"
            />
            <div class="selectInfo">
                <el-row>
                    <span>已选择：</span>
                </el-row>
                <el-row>
                    <div class="user" v-if="user.name">{{user.name}}</div>
                </el-row>
            </div>
            <div class="footer">
                <el-button size="mini" @click="() => changeDialog(false)">取消</el-button>
                <el-button type="primary" size="mini" @click="selectUser" :loading="loading">提交</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
    import {
        getTenantList, // 搜索
    } from "@/api/clientMn";
    import TableComponent from "@/components/TableComponent";
    import {companyScaleEnum, companyTypeEnum} from '@/utils/enum'

    export default {
        name: "SelectPeopleDialog",
        components: {
            TableComponent,
        },
        props: {
            projectId: {
                type: [Number, String]
            },
            projectName: {
                type: String
            },
            visible: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                companyScaleEnum, // 企业规模列表
                companyTypeEnum, // 企业类型列表
                user: {},
                formData: {
                    name: '', // 客户名称
                    companyType: '',
                    companyScale: '',
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
                    height: 340,
                },
                // 需要展示的列
                columns: [
                    {
                        prop: 'name',
                        label: '客户名称',
                        minWidth: 200,
                        fixed: true
                    }, {
                        prop: 'id',
                        label: '企业id',
                        width: 70
                    }, {
                        prop: 'enable',
                        label: '是否启用',
                        width: 70,
                        formatter: (row, column) => {
                            return row.enable ? '是' : '否'
                        }
                    }, {
                        prop: 'companyType',
                        label: '类型',
                        width: 80,
                    }, {
                        prop: 'companyScale',
                        label: '企业规模',
                        width: 120
                    }, {
                        prop: 'area',
                        label: '所在区域',
                        width: 120
                        // width: 60
                    }, {
                        prop: 'contact',
                        label: '客户联系人',
                        width: 90
                    }, {
                        prop: 'contactPhone',
                        label: '联系人电话',
                        width: 120
                    }, {
                        prop: 'createTime',
                        label: '创建时间',
                        width: 150,
                        formatter: (row, column) => {
                            var text = (row.createTime || '').substr(0, 10);
                            return `<span title="${text}">${text || '- -'}</span>`
                        }
                    }, {
                        prop: 'serviceEndDate',
                        label: '服务截止日期',
                        width: 120,
                        formatter: (row, column) => {
                            var text = (row.serviceEndDate || '').substr(0, 10);
                            return `<span title="${text}">${text || '- -'}</span>`
                        }
                    },
                ],
                loading: false, // 提交的 loading 状态
            };
        },
        created() {
            this.init();
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
            init() {
                this.queryList(); // 请求数据
            },

            handleCurrentChange(row) {
                // console.log(row, 'handleCurrentChange')
                this.user = row;
            },
            selectUser() {
                this.$emit('updateSelectUser', this.user)
                this.changeDialog(false)
            },
            changeDialog(bool) {
                this.$emit("update:visible", bool)
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
                getTenantList(params).then(res => {
                    const {data} = res.data;
                    console.log(data);
                    _this.options.loading = false; // 更改加载中的 loading值
                    _this.list = data.rows || [];
                    _this.total = data.records;
                });
            },
            // 搜索
            filterHandler() {
                this.pageIndex = 1; // 初始为1
                this.queryList();
            },
        }
    };
</script>

<style scoped>
    .footer {
        padding-top: 10px;
        border-top: 1px solid #dcdfe6;
        text-align: right;
    }

    .selectInfo {
        padding: 10px 0;
    }

    .user {
        display: inline-block;
        border: 1px solid #bbbbbb;
        min-width: 100px;
        text-align: center;
        height: 30px;
        background-color: #409eff;
        color: #fff;
        line-height: 30px;
        margin: 10px 10px 0 0;
    }
</style>

