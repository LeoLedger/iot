<!--
* @description
* @fileName list.vue
* @author 姜庆博
* @date 2019/06/11 19:39:44
* @version V1.0.0
!-->
<template>
    <div>
        <el-dialog class="formDialog"
                   :title="title"
                   :width="width"
                   :visible="visible"
                   :close-on-click-modal="false"
                   element-loading-text="加载中..."
                   @close="closeDialog">
            <el-form class="FormConfig"
                     :model="params" label-position="right" ref="baseForm"
                     @submit.native.prevent="submitHandler()"
                     label-width="90px"
                     size="mini"
            >
                <el-row>
                    <el-col :span="12">
                        <el-form-item
                                prop="contractType"
                                label="合同类型"
                        >
                            <el-select v-model="params.contractType" size="mini" placeholder="请选择合同类型" clearable>
                                <el-option v-for="(option, optionIndex) in contractTypeEnum" :key="optionIndex + '_local'"
                                           :value="option['value']"
                                           :label="option['label']" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item prop="tenantId" label="客户">
                            <el-input v-model="params.tenantName" size="mini" :placeholder="'请选择客户'" readonly :style="{width: '83%'}"/>
                            <el-button type="primary" @click="selectUser">选</el-button>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item prop="amount" label="合同总额(元)">
                            <el-input-number v-model="params.amount" size="mini"
                                             controls-position="right"
                                             :precision="0" :min="0" placeholder="请输入金额"
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item
                                prop="newDateRange" label="合同服务周期"
                        >
                            <el-date-picker v-model="params.newDateRange" size="mini" type="daterange"
                                            @change="date => changeDate(date, 'startDate', 'endDate')"
                                            :value-format="'yyyy-MM-dd'"
                                            start-placeholder="开始日期"
                                            end-placeholder="结束日期"/>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item prop="salesName" label="销售负责人">
                            <el-input v-model="params.salesName" size="mini" placeholder="请输入销售负责人" clearable/>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item prop="signStatus" label="合同签订">
                            <el-radio-group v-model="params.signStatus" size="mini">
                                <el-radio v-for="(option, optionIndex) in contractSignStatusEnum" :key="optionIndex + '_local'"
                                          :label="option['value']"
                                >{{option['label']}}</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item prop="contractContent" label="合同内容">
                            <el-input type="textarea"
                                      v-model="params.contractContent"
                                      size="mini"
                                      :placeholder="'请输入合同内容'"
                                      resize="none"
                                      clearable
                                      :maxlength="200"
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item prop="files" label="附件">
                            <Upload :form="{tip: '请上传合同附件', prop: 'files'}"
                                    :params="params"/>
                        </el-form-item>
                    </el-col>
                </el-row>
                <div class="footer">
                    <el-button size="mini" @click="closeDialog" :disabled="submitLoading">取消</el-button>
                    <el-button type="primary" size="mini" @click="submitHandler" :loading="submitLoading">提交</el-button>
                </div>
            </el-form>
        </el-dialog>
        <!-- 若由被选中的人 需要带入 temptemptemp -->
        <SelectPeopleDialog
                v-if="selectPeopleVisible"
                v-bind:visible.sync="selectPeopleVisible"
                @updateSelectUser="updateSelectUser"/>
    </div>
</template>

<script>
    import Upload from "@/components/customizeFormItem/Upload"
    import SelectPeopleDialog from "./SelectPeopleDialog"
    import {
        editTenantContract, // 新增或者编辑合同信息
    } from "@/api/clientMn";
    import {contractTypeEnum, contractSignStatusEnum} from '@/utils/enum'

    export default {
        name: 'AddContractDialog',
        components: {
            Upload,
            SelectPeopleDialog
        },
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            formData: {
                type: Object,
                default: () => {
                    return {}
                }
            },
        },
        data() {
            return {
                params: {
                    contractType: '',
                    tenantId: '',
                    tenantName: '',
                    newDateRange: [],
                    salesName: '',
                    signStatus: '',
                    contractContent: '',
                    files: [],
                },
                title: '新建合同',
                width: '800px',
                // 配置弹窗

                contractSignStatusEnum,
                contractTypeEnum,
                submitLoading: false,
                selectPeopleVisible: false,
            }
        },
        watch: {},
        methods: {
            changeDialog(bool) {
                this.$emit("update:visible", bool)
            },
            closeDialog() {
                this.changeDialog(false)
            },
            // 表单弹窗 提交
            formDialogSubmit(params) {
                console.log('test formDialogSubmit submit', params); // 具体操作  请添加...
                // this.$set(this.submitLoading, 'submitLoading', true); // 更改提交按钮的状态值
                this.submitLoading = true; // 更改提交按钮的状态值
                const submitParams = {...this.formData, ...params}
                editTenantContract(submitParams).then((res) => {
                    const {success, message} = res.data;
                    // this.$set(this.formOptions, 'submitLoading', false); // 更改提交按钮的状态值
                    this.submitLoading = false; // 更改提交按钮的状态值
                    if (success) {
                        this.$message.success('请求处理成功');
                        this.changeDialog(false); // 关闭按钮
                        this.$emit('addSubmitCallBack'); // 触发操作成功的回调
                    } else {
                        this.$message.error(message);
                    }
                })
            },

            // dateRange change
            changeDate(date, startDateKey, endDateKey) {
                console.error(date, startDateKey, endDateKey, 'date, startDate, endDate')
                let dates
                if (date === null) {
                    this.params[startDateKey] = ''
                    this.params[endDateKey] = ''
                    return
                }
                if (date && date.hasOwnProperty('length')) {
                    dates = date;
                }
                this.params[startDateKey] = dates[0]
                this.params[endDateKey] = dates[1]
            },
            selectUser() {
                this.selectPeopleVisible = true
            },
            updateSelectUser(obj) {
                console.log(obj , '更新的 人员选择 ')
                const {id, name} = obj;
                this.params.tenantId = id; // 用户id
                this.params.tenantName = name; // 用户名称
              // 更新的 人员选择
            },
            submitHandler() {
                this.$refs['baseForm'].validate((valid, errObj) => {
                    if (valid) {
                        const { params, format } = this
                        this.formDialogSubmit(params)
                    } else {
                        console.error(errObj)
                    }
                })
            },
        }
    }
</script>

<style lang='scss' scoped>
    .FormConfig {
        .el-input-number {
            width: 100%;
        }
        .footer {
            padding-top: 10px;
            border-top: 1px solid #dcdfe6;
            text-align: right;
        }
        .el-col {
            border-bottom: 0;
        }
        .el-select,
        .el-input-number {
            width: 100%;
        }
        .el-date-editor--daterange.el-input__inner { // dateRange样式
            width: 100%;
            height: 29px;
        }
    }
</style>
