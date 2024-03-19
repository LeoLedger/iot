<template>
    <div style="paddingTop:10px">
        <el-dialog
                title="选择合同"
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
                        v-model="formData.contractType"
                        placeholder="合同类型"
                        size="mini"
                        style="width:200px"
                >
                    <el-option
                            v-for="item in contractTypeEnum"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                    ></el-option>
                </el-select>
                <el-input
                        v-model="formData.customer"
                        placeholder="客户"
                        clearable
                        class="filter-item"
                        style="width:200px"
                        size="mini"
                ></el-input>
                <el-input
                        v-model="formData.salesName"
                        placeholder="销售负责人"
                        clearable
                        class="filter-item"
                        style="width:200px"
                        size="mini"
                ></el-input>
                <el-input
                        v-model="formData.code"
                        placeholder="合同编号"
                        clearable
                        class="filter-item"
                        style="width:200px"
                        size="mini"
                ></el-input>
                <!--<el-select
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
                ></el-input>-->
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
                    <div class="user" v-if="user.id">{{user.code}}</div>
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
        tenantContractList, // 搜索
    } from "@/api/clientMn";
    import TableComponent from "@/components/TableComponent";
    import {/*companyScaleEnum, companyTypeEnum, */contractTypeEnum} from '@/utils/enum'

    export default {
        name: "SelectContractDialog",
        components: {
            TableComponent,
        },
        props: {
            visible: {
                type: Boolean,
                default: false
            }
        },
        data() {
            const {name} = this.$attrs; // 客户名称
            return {
                // companyScaleEnum,
                // companyTypeEnum,
                contractTypeEnum,
                user: {},
                formData: {
                    contractType: '',
                    customer: name, // 客户
                    salesName: '', // 销售负责人
                    code: '', // 合同编号
                },
                // table 参数
                total: 0, // table数据总条数
                list: [],
                pageIndex: 1, // 当前页码
                pageSize: 10, // 每页数量
                // table 的参数
                options: {
                    // stripe: true, // 是否为斑马纹 table
                    loading: false, // 是否添加表格loading加载动画
                    height: 340,
                },
                // 需要展示的列
                columns: [
                    {
                        prop: 'code',
                        label: '合同编号',
                        minWidth: 130,
                        fixed: true,
                        formatter: (row, column) => {
                            const text = row.code || '';
                            return `<span class="infotext" title="${text}" >${text || '- -'}</span>`
                        }
                    }, {
                        prop: 'contractType',
                        label: '合同类型',
                        width: 70
                    }, {
                        prop: 'amount',
                        label: '合同总额（元）',
                        width: 110,
                    }, {
                        prop: 'received',
                        label: '已收款（元）',
                        width: 100,
                    }, {
                        prop: 'receivedRatio',
                        label: '收款比例',
                        width: 90
                    }, {
                        prop: 'customer',
                        label: '客户',
                        minWidth: 130,
                    }, {
                        prop: 'salesName',
                        label: '销售负责人',
                        width: 90
                    }, {
                        prop: 'createDate',
                        label: '创建日期',
                        width: 120,
                        formatter: (row, column) => {
                            var text = (row.createDate || '').substr(0, 10);
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
                console.log(row, 'handleCurrentChange')
                this.user = row;
            },
            selectUser() {
                this.$emit('updateSelectContract', this.user)
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
                tenantContractList(params).then(res => {
                    const {data} = res.data;
                    // console.log(data);
                    _this.options.loading = false;
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

