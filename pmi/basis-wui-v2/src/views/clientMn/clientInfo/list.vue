<!--
* @description
* @fileName list.vue
* @author 姜庆博
* @date 2019/06/11 19:39:44
* @version V1.0.0
!-->
<template>
    <div class="clientInfoList app-container">
        <div class="filter-container">
            <el-cascader
                    :options="areaList"
                    v-model="formData.areaName"
                    clearable
                    filterable
                    placeholder="所在区域"
                    style="margin-bottom:10px; vertical-align: top; width:200px"
                    size="mini"
                    :props="{ checkStrictly: true }"
            ><!--@change="handleChange"--></el-cascader>
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
                        v-for="item in companyTypeList"
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
                        v-for="item in companyScaleList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                ></el-option>
            </el-select>
            <el-input
                    v-model="formData.name"
                    placeholder="客户名称"
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
        >
            <template  slot="操作" slot-scope="{$index, row}">
                <template v-for="btn of operates.list">
                    <!-- 在启用状态下 不允许删除 -->
                    <el-button
                            v-if="btn.icon"
                            :type="btn.type || 'primary'"
                            :size="btn.size || 'mini'"
                            :icon="btn.icon"
                            :disabled="btn.disabled || btn.label === '删除' && row.enable"
                            :title="btn.label"
                            @click="btn.method($index,row)"
                    />
                    <el-button
                            v-else
                            :type="btn.type || 'primary'"
                            :size="btn.size || 'mini'"
                            :disabled="btn.disabled"
                            :title="btn.label"
                            @click="btn.method($index,row)"
                    >{{btn.label}}</el-button>
                    </template>
            </template>
         </TableComponent>
        <!-- 列表添加/编辑 -->
        <DialogForm ref="addDialogForm"
                    v-bind="dialogOption"
                    :submit="formDialogSubmit"
                    :formDialogVisible="formDialogVisible"
                    @changeDialog="changeDialog"
        />
        <!-- 配置服务套餐 -->
        <PackageDialog
                v-bind:visible.sync="packageDialogVisible"
                :formData="packageData"
        />
        <!-- 合同续期 -->
        <RenewalDialog
                v-if="renewalDialogVisible"
                v-bind:visible.sync="renewalDialogVisible"
                :formData="renewalData"
                :isCreated="isCreatedContract"
                :selectedTenant="selectedTenantOption"
                @renewalSubmitCallBack="renewalSubmitCallBack"
        />
        <!-- 客户详情 -->
        <CustomerInfoDialog
                v-if="customerInfoVisible"
                v-bind:visible.sync="customerInfoVisible"
                :id="customerInfoId"
        />
    </div>
</template>

<script>
    import TableComponent from "@/components/TableComponent";
    import DialogForm from "@/components/DialogForm"
    import waves from "@/directive/waves"; // Waves directive;
    import prereclick from "@/directive/prereclick"; // prereclick directive;
    import {companyScaleEnum, companyTypeEnum, enableEnum} from '@/utils/enum'
    import {deleteNullCity} from '@/utils'
    import {getSimpleProjectList, SysArea} from "@/api/resource";

    import {
        queryTenantExport, // 导出
        getTenantList, // 搜索
        queryTenantEdit, // 新增或者编辑客户信息
        queryTenantDelete, // 删除客户信息
        queryExistsContract,
        getTenantDetail, // 客户详情信息
        getTenantContractDetail, // 获取合同详情 接口
        editTenantEnable
    } from "@/api/clientMn";
    import PackageDialog from "./PackageDialog"
    import RenewalDialog from "../components/EditContractDialog"
    import CustomerInfoDialog from "./CustomerInfoDialog"

    const checkArea = (rule, value, callback) => {
        if (!value) {
            return callback(new Error('请选择所在区域'));
        }
        setTimeout(() => {
            if (Array.isArray(value) && !value[1]) {
               return callback(new Error('请选择所在市区'));
            }
            callback();
        }, 300);
    };
    export default {
        name: 'clientInfoList',
        components: {
            TableComponent,
            DialogForm,
            PackageDialog,
            RenewalDialog,
            CustomerInfoDialog
        },
        directives: {waves, prereclick},
        data() {
            const _this = this;
            return {
                companyScaleList: companyScaleEnum, // 企业规模列表
                companyTypeList: companyTypeEnum, // 企业类型列表
                areaList: [], // 所在区域列表
                formData: {
                    name: '', // 客户名称
                    companyType: '',
                    companyScale: '',
                    areaName: [],
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
                },
                // 需要展示的列
                columns: [
                    {
                        prop: 'name',
                        label: '客户名称',
                        minWidth: 220,
                        fixed: true,
                        render: (h, params) => {
                            const {row} = params
                            return h('span', {
                                attrs: {title: row.name}, // 组件的props
                                class: 'infotext',
                                on: {
                                    click: () => {
                                        _this.showCustomerInfo(row)
                                    }
                                }
                            }, row.name)
                        }
                    }, {
                        prop: 'id',
                        label: '企业id',
                        width: 70
                    }, {
                        prop: 'businessRegistrationNo',
                        label: '工商注册号',
                        width: 110
                    }, {
                        prop: 'enable',
                        label: '是否启用',
                        width: 70,
                        render: function(h, params){
                            const {row} = params;
                            return h('el-checkbox', {
                                props: {
                                    value: row.enable
                                },
                                on: {
                                    change: () => {
                                        _this.checkBoxChange(row)
                                    }
                                }
                            }, '启用')
                        },
                        /*formatter: (row, column) => {
                            return row.enable ? '是' : '否'
                        }*/
                    }, {
                        prop: 'companyType',
                        label: '类型',
                        width: 80,
                    }, {
                        prop: 'legal',
                        label: '企业法人',
                        width: 80,
                    }, {
                        prop: 'companyScaleStr',
                        label: '企业规模',
                        width: 110
                    }, {
                        prop: 'area',
                        label: '所在区域',
                        width: 110
                    }, {
                        prop: 'address',
                        label: '详细地址',
                        width: 140
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
                        prop: 'remarks',
                        label: '备注',
                        width: 160
                    }, {
                        prop: 'createTime',
                        label: '创建时间',
                        width: 110,
                        formatter: (row, column) => {
                            var text = (row.createTime || '').substr(0, 10);
                            return `<span title="${text}">${text || '- -'}</span>`
                        }
                    }, {
                        prop: 'serviceEndDate',
                        label: '服务截止日期',
                        width: 110,
                        formatter: (row, column) => {
                            var text = (row.serviceEndDate || '').substr(0, 10);
                            return `<span title="${text}">${text || '- -'}</span>`
                        }
                    },
                ],
                // 列操作按钮
                operates: {
                    width: 240,
                    fixed: 'right',
                    type: 'btn',
                    list: [
                        {
                            label: '配置套餐',
                            method: async (index, row) => {
                                const info = await this.setCurrentTenantDetail(row.id)
                                console.error(info, '详情信息')
                                this.packageData = info
                                this.packageDialogVisible = true;
                            }
                        }, {
                            label: '续期',
                            method: async (index, row) => {
                                console.log('续期', row)
                                const isCreated = !!row.serviceEndDate;
                                let info = {}
                                if (isCreated) {
                                    // 如果没有  服务截止日期  表示没有创建 合同   就去新建
                                    info = await this.getCurrentTenantContractDetail(row.lastContractId); // 合同列表的最后一个合同id
                                }
                                console.log(info, 'info...........')
                                this.renewalData = {...info, tenantId: row.id}; // 添加客户id
                                this.renewalDialogVisible = true;
                                this.isCreatedContract = isCreated;
                                this.selectedTenantOption = [{value: row.id, label: row.name}]
                            }
                        }, {
                            label: '编辑',
                            icon: 'el-icon-edit',
                            method: async (index, row) => {
                                console.log('编辑')
                                const info = await this.setCurrentTenantDetail(row.id)
                                this.ACTIVE_EDIT_DETAIL = info;
                                this.changeDialog(true, 'edit')
                            }
                        }, {
                            label: '删除',
                            type: 'danger',
                            icon: 'el-icon-delete',
                            method: async (index, row) => {
                                this.deleteDetailInfo(row.id)
                            }
                        }
                    ]
                },

                // 配置弹窗
                dialogOption: {
                    title: '添加客户',
                    width: '800px',
                    formOptions: {
                        loading: false,
                        submitBtnText: '提交',
                        showCancelBtn: true,
                        labelWidth: 80,
                        span: 12,
                        forms: [
                            {
                                prop: 'name',
                                label: '客户名称',
                                itemType: 'input',
                            }, {
                                prop: 'companyType',
                                label: '客户类型',
                                itemType: 'select',
                                options: companyTypeEnum,
                                rules: [{required: true, message: "请选择客户类型", trigger: "change"}],
                            }, {
                                prop: 'contact',
                                label: '客户联系人',
                                itemType: 'input',
                            }, {
                                prop: 'contactPhone',
                                label: '联系电话',
                                itemType: 'input',
                            }, {
                                prop: 'legal',
                                label: '企业法人',
                                itemType: 'input',
                            }, {
                                prop: 'businessRegistrationNo',
                                label: '工商注册号',
                                itemType: 'input',
                            }, {
                                prop: 'companyScale',
                                label: '企业规模',
                                itemType: 'select',
                                options: companyScaleEnum,
                                rules: [{required: true, message: "请选择企业规模", trigger: "change"}],
                            }, { // [7]
                                prop: 'area',
                                label: '所在区域',
                                itemType: 'cascader',
                                options: [],
                                rules: [{required: true, validator: checkArea, trigger: "change"}],
                            }, /*{
                                prop: 'enable',
                                label: '是否启用',
                                itemType: 'select',
                                options: enableEnum,
                                rules: [{required: true, message: "请选择是否启用", trigger: "change"}],
                            }, */{
                                prop: 'address',
                                label: '详细地址',
                                itemType: 'input',
                                span: 24,
                            }, {
                                prop: 'remarks',
                                label: '备注',
                                itemType: 'textarea',
                                span: 24,
                                autosize: {minRows: 3, maxRows: 6},
                            }, {
                                prop: 'files',
                                label: '营业执照',
                                span: 24,
                                itemType: 'upload',
                                rules: [{required: true, message: "营业执照必须上传", trigger: "change"}],
                                tip: '请上传公司营业执照照片'
                            }, {
                                prop: 'logoFiles',
                                label: '公司logo',
                                span: 24,
                                itemType: 'upload',
                                rules: [{required: true, message: "公司logo必须上传", trigger: "change"}],
                                tip: '请上传公司logo',
                                accept: '.jpg, .jpeg, .png'
                            }
                        ],
                        // formData: {
                        // }
                    },
                },
                formDialogVisible: false,
                // 配置服务套餐
                packageDialogVisible: false,
                packageData: {},
                // 续期
                renewalDialogVisible: false,
                renewalData: {},
                isCreatedContract: false,
                selectedTenantOption: [],
                // 客户详情
                customerInfoVisible: false,
                customerInfoId: ''
            }
        },
        created() {
            this.queryList();
            // 获取所有项目区域
            this.getSysArea();
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
            async deleteDetailInfo(id) {
                const hasContract = await queryExistsContract(id).then(res => res.data.data)
                const contractTip = '已有关联合同, 是否删除该客户?',
                    defaultTip = "此操作将删除此记录, 是否继续?";
                this.$confirm(hasContract ? contractTip : defaultTip, "提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning",
                    center: true
                }).then(() => {
                    queryTenantDelete(id).then(res => {
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
                            // this.filterHandler()
                            this.queryList()
                        } else {
                            this.$message.error(message);
                        }
                    });
                })
                    .catch(() => {
                    });
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
            showCustomerInfo(row) {
                console.warn(row);
                this.customerInfoVisible = true;
                this.customerInfoId = row.id;
            },
            getSysArea() {
                SysArea().then(response => {
                    deleteNullCity(response.data);
                    this.areaList = response.data;
                    this.$set(this.dialogOption.formOptions.forms[7], 'options', response.data)
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
                getTenantList(params).then(res => {
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
                queryTenantExport(params)
            },
            // 查找
            filterHandler() {
                this.pageIndex = 1; // 初始为1
                this.queryList();
            },

            changeDialog(bool, type) {
                this.formDialogVisible = bool;
                if (type) {
                    this.EDIT_DETAIL_TYPE = type;
                    if (type === 'add') { // 新加类型
                        this.$set(this.dialogOption, 'title', '添加客户')
                        this.$set(this.dialogOption.formOptions, 'formData', {})
                    } else {
                        this.$set(this.dialogOption, 'title', '编辑')
                        const {provinceId, cityId} = this.ACTIVE_EDIT_DETAIL
                        this.ACTIVE_EDIT_DETAIL.area = [provinceId, cityId]; // 省市
                        this.$set(this.dialogOption.formOptions, 'formData', this.ACTIVE_EDIT_DETAIL)
                    }
                }
            },
            // 表单弹窗 提交 (包含 编辑 和 新增)
            formDialogSubmit(params) {
                console.log('test formDialogSubmit submit', params); // 具体操作  请添加...
                this.$set(this.dialogOption.formOptions, 'loading', true); // 更改提交按钮的状态值

                const [provinceId, cityId] = params.area;
                let submitParams = {
                    ...params,
                    provinceId, // 省
                    cityId, // 市
                }
                /*if(!cityId) {
                    this.$message.error('请在所在区域选择市区')
                }*/
                if (this.EDIT_DETAIL_TYPE !== 'add') { // 编辑时 调用
                    // submitParams = {...this.ACTIVE_EDIT_DETAIL, ...submitParams}
                    const {id, corpid, servicePackageId, servicePackageName, userCount, smsCount, storageSize, servicePackageRemarks, enable} = this.ACTIVE_EDIT_DETAIL;
                    submitParams = {id, corpid, servicePackageId, servicePackageName, userCount, smsCount, storageSize, servicePackageRemarks, enable, ...submitParams}
                } else {
                    submitParams.enable = true;
                    submitParams.servicePackageId = 1; // 套餐id 默认
                }
                queryTenantEdit(submitParams).then(res => {
                    const {data, success, message} = res.data;
                    if (success) {
                        this.$message.success('请求处理成功');
                        this.changeDialog(false); // 关闭按钮
                        // this.filterHandler();
                        this.queryList()
                    } else {
                        this.$message.error(message);
                    }
                    // console.log(res, 'res.................');
                    this.$set(this.dialogOption.formOptions, 'loading', false); // 更改提交按钮的状态值
                });
            },

            renewalSubmitCallBack() { // 修改了合同之后 更新数据列表
                this.queryList();
            },
            checkBoxChange(row) {
                const submitParams = {
                    id: row.id,
                    enable:!row.enable // 是否启用
                }
                editTenantEnable(submitParams).then(res => {
                    const {success, data, message} = res.data;
                    if (success) {
                        this.$message.success('请求处理成功');
                        this.queryList()
                    } else {
                        this.$message.error(message);
                    }
                })
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

            a.infotext {
                &:hover,
                &:focus {
                    color: #409eff;
                }
            }
        }
    }
</style>
