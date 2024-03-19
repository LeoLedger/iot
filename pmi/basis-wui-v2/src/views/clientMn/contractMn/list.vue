<!--
* @description
* @fileName list.vue
* @author 姜庆博
* @date 2019/06/18 19:39:44
* @version V1.0.0
!-->
<template>
    <div class="contractMnList app-container">
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
            <el-date-picker
                    size="mini"
                    v-model="formData.dateTimeRange"
                    value-format="yyyy-MM-dd"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="创建开始日期"
                    end-placeholder="创建结束日期">
            </el-date-picker>
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
                    @click="addContract"
                    size="mini"
            >新增</el-button>
        </div>
        <div class="Mentitle">
            <span>应收款项：{{getMoneyStr(amountDetail.totalAmount)}}元</span>
            <span>实收款项：{{getMoneyStr(amountDetail.totalReceivedAmount)}}元</span>
            <span>未收款项：{{getMoneyStr(amountDetail.totalAmount - amountDetail.totalReceivedAmount)}}元</span>
        </div>
        <TableComponent :list="list"
                        :total="total"
                        v-bind:pageSize.sync="pageSize"
                        v-bind:pageIndex.sync="pageIndex"
                        :options="options"
                        :columns="columns"
                        :operates="operates"
        />
        <!-- 添加收款 -->
        <ReceiveAmountDialog
                v-if="receiveAmountVisible"
                v-bind:visible.sync="receiveAmountVisible"
                :canSelectedContract="false"
                :formData="receiveAmountData"
                @amountSubmitCallBack="addSubmitCallBack"
        />

        <!-- 新加合同 -->
        <AddContractDialog
                v-if="addContractVisible"
                v-bind:visible.sync="addContractVisible"
                @addSubmitCallBack="addSubmitCallBack"
        />

        <!-- 合同详情 -->
        <ContractInfoDialog
                v-if="customerInfoVisible"
                v-bind:visible.sync="customerInfoVisible"
                :id="customerInfoId"
        />

        <!-- 编辑合同 -->
        <EditContractDialog
                v-if="editContractVisible"
                v-bind:visible.sync="editContractVisible"
                :formData="editContractData"
                :isCreated="true"
                :isEdit="true"
                :selectedTenant="selectedTenantOption"
                @renewalSubmitCallBack="addSubmitCallBack"
        />
    </div>
</template>

<script>
    import TableComponent from "@/components/TableComponent";
    import waves from "@/directive/waves"; // Waves directive;
    import prereclick from "@/directive/prereclick"; // prereclick directive;
    import {contractTypeEnum, contractSignStatusEnum} from '@/utils/enum'

    import {
        exportTenantContract, // 合同导出
        deleteTenantContract, // 删除合同信息
        getTenantDetail, // 客户详情信息
        tenantContractList, // 合同搜索
        getTenantContractDetail, // 获取合同详情 接口
        getContractPayPlanDetail, // 获取合同收款情况
    } from "@/api/clientMn";
    import ReceiveAmountDialog from "../components/ReceiveAmountDialog"
    import EditContractDialog from "../components/EditContractDialog"
    import AddContractDialog from "./AddContractDialog"
    import ContractInfoDialog from "./ContractInfoDialog"

    import {getPriceStr} from '@/utils/commonUtil'

    export default {
        name: 'contractMnList',
        components: {
            TableComponent,
            ReceiveAmountDialog,
            AddContractDialog,
            ContractInfoDialog,
            EditContractDialog
        },
        directives: {waves, prereclick},
        data() {
            const _this = this;
            return {
                companyScaleList: [], // 企业规模列表
                contractTypeEnum,
                areaList: [], // 所在区域列表
                formData: {
                    contractType: '',
                    customer: '', // 客户
                    salesName: '', // 销售负责人
                    code: '', // 合同编号
                    dateTimeRange: [], // 时间段
                },
                labelWidth: 80,
                span: 5,
                xs: {span: 20},
                showResetBtn: true, // 是否展示重置按钮

                // table 参数
                total: 0, // table数据总条数
                list: [],
                pageIndex: 1, // 当前页码
                pageSize: 15, // 每页数量
                // table 的参数
                options: {
                    // stripe: true, // 是否为斑马纹 table
                    loading: false, // 是否添加表格loading加载动画
                    highlightCurrentRow: true, // 是否支持当前行高亮显示
                    showIndex: true, // 是否展示 列表序列号
                },
                // 需要展示的列
                columns: [
                    {
                        prop: 'code',
                        label: '合同编号',
                        width: 130,
                        render: (h, params) => {
                            const {row} = params
                            return h('span', {
                                attrs: {title: row.code}, // 组件的props
                                class: 'infotext',
                                on: {
                                    click: () => {
                                        _this.showContractInfo(row)
                                    }
                                }
                            }, row.code)
                        }
                    }, {
                        prop: 'contractType',
                        label: '合同类型',
                        width: 70
                    }, {
                        prop: 'amount',
                        label: '合同总额（元）',
                        width: 110,
                        formatter(row) {
                            if(!row) return '- -'
                            return getPriceStr(row.amount)
                        }
                    }, {
                        prop: 'received',
                        label: '已收款（元）',
                        width: 100,
                        formatter(row) {
                            if(!row) return '- -'
                            return getPriceStr(row.received)
                        }
                    }, {
                        prop: 'receivedRatio',
                        label: '收款比例',
                        width: 90,
                        formatter(row) {
                            const _data = row && row.receivedRatio;
                            return typeof _data !== 'undefined' && Math.round(_data * 100) + '%' || '- -'
                        }
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
                // 列操作按钮
                operates: {
                    width: 200,
                    fixed: 'right',
                    type: 'btn',
                    list: [
                        {
                            label: '添加收款',
                            show: true,
                            method: async (index, row) => {
                                this.receiveAmountVisible = true;
                                // console.log(row, 'row.......')
                                const {code, id} = row;
                                this.receiveAmountData = {contractObj: {label: code, value: id},contractId : id};
                            }
                        }, {
                            label: '编辑',
                            icon: 'el-icon-edit',
                            show: true,
                            method: async (index, row) => {
                                // console.log('编辑', row)
                                const info = await this.getCurrentTenantContractDetail(row.id); // 合同列表的最后一个合同id
                                // console.log(info, 'info............................')
                                this.editContractData = info; // 添加客户id
                                this.editContractVisible = true
                                this.selectedTenantOption = [{value: info.tenantId, label: info.customer}]
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
                // 添加收款
                receiveAmountVisible: false,
                receiveAmountData: {},
                // 添加合同
                addContractVisible: false,
                editContractVisible: false,
                editContractData: {},
                selectedTenantOption: [],
                // 客户详情
                customerInfoVisible: false,
                customerInfoId: '',
                amountDetail: {
                    totalAmount: 0,
                    totalReceivedAmount: 0
                }
            }
        },
        created() {
            this.getInitData()
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
                    deleteTenantContract(id).then(res => {
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
                            this.getInitData()
                        } else {
                            this.$message.error(message);
                        }
                    });
                }).catch(() => {});
            },
            setCurrentTenantDetail(id) {
                return getTenantDetail(id).then((res) => {
                    const {success, data, message} = res.data;
                    if (success) {
                        return data || {}
                    } else {
                        this.$message.error(message);
                    }
                })
            },
            getInitData() {
                this.queryList();
                // 获取当前用户 的 款项 详情
                getContractPayPlanDetail().then((res) => {
                    const {success, data, message} = res.data;
                    // this.pageLoading = false;
                    if (success) {
                        this.amountDetail = data;
                    }
                })
            },
            async showContractInfo(row) {
                // console.warn(row);
                this.customerInfoVisible = true;
                this.customerInfoId = row.id; // 合同id
            },
            // 获取合同详情
            getCurrentTenantContractDetail(id) {
                return getTenantContractDetail(id).then((res) => {
                    const {success, data, message} = res.data;
                    if (success) {
                        return data || {}
                    } else {
                        this.$message.error(message);
                    }
                })
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
                options.loading = true;
                const [beginDate = '', endDate = ''] = formData.dateTimeRange;
                const params = {
                    pageIndex, // 当前页码
                    pageSize, // 每页数量
                    ...formData,
                    beginDate,
                    endDate
                };
                // console.log(params, 'params')
                tenantContractList(params).then(res => {
                    const {data} = res.data;
                    // console.log(data);
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
                exportTenantContract(params)
            },
            // 查找
            filterHandler() {
                this.pageIndex = 1; // 初始为1
                this.queryList();
            },
            getMoneyStr(num) {
                return getPriceStr(num)
            },
            addContract() {
                this.addContractVisible = true;
            },

            addSubmitCallBack() { // 修改了合同之后 更新数据列表
                this.getInitData();
            }
        }
    }
</script>

<style lang='scss' scoped>
    .contractMnList {
        /deep/ {
            * {
                font-size: 12px;
            }

            a.infotext {
                &:hover,
                &:focus {
                    color: #409eff;
                }
            }

            .Mentitle {
                span {
                    margin-right: 30px;
                }
            }
        }
    }

</style>
