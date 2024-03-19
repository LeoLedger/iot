<!--
* @description
* @fileName list.vue
* @author 姜庆博
* @date 2019/06/11 19:39:44
* @version V1.0.0
!-->
<template>
    <!-- 合同续期 / 新增合同 RenewalDialog -->
    <DialogForm
            v-bind="dialogOption"
            :submit="formDialogSubmit"
            :formData="formData"
            :formDialogVisible="visible"
            @changeDialog="changeDialog"
    />
</template>

<script>
    import DialogForm from "@/components/DialogForm"
    import {
        editTenantContract, // 新增或者编辑合同信息
    } from "@/api/clientMn";
    import {contractTypeEnum, contractSignStatusEnum} from '@/utils/enum'

    export default {
        name: 'EditContractDialog',
        components: {
            DialogForm
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
            isCreated: { // 是否创建过合同
                type: Boolean,
                default: false
            },
            isEdit: { // 是否编辑合同
                type: Boolean,
                default: false
            },
            selectedTenant: { // 封装好的 客户名   客户id
                type: Array,
                default: () => []
            }
        },
        data() {
            const {isCreated, isEdit, selectedTenant, formData} = this.$props;
            console.error(isCreated, 'isCreated    selectedTenant', selectedTenant)
            const forms = [
                    ...(isCreated && [{
                    prop: 'code',
                    label: '合同编号',
                    disabled: true
                }] || []), {
                    prop: 'contractType',
                    label: '合同类型',
                    itemType: 'select',
                    // disabled: true,
                    options: contractTypeEnum,
                }, { // [2]
                    prop: 'tenantId', // {id: 2127, name: "lance测试"}
                    label: '客户',
                    itemType: 'select',
                    options: selectedTenant,
                    disabled: !!formData.tenantId && true,
                },
                ...(isCreated && [{
                    prop: 'oldDateRange',
                    label: '原服务周期',
                    itemType: 'daterange',
                    startKey: 'oldStartDate',
                    endKey: 'oldEndDate',
                    disabled: true,
                }] || []),
                {
                    prop: 'amount',
                    label: '合同总额(元)',
                    itemType: 'inputNumber',
                }, {
                    prop: 'newDateRange',
                    label: '合同服务周期',
                    itemType: 'daterange',
                    startKey: 'startDate',
                    endKey: 'endDate',
                    isSplit: true // 提交时是否拆解日期数组判断
                }, {
                    prop: 'salesName',
                    label: '销售负责人',
                    itemType: 'input',
                }, {
                    prop: 'signStatus',
                    label: '合同签订',
                    // span: isCreated ? '' : 24,
                    itemType: 'radio',
                    options: contractSignStatusEnum,
                }, {
                    prop: 'contractContent',
                    label: '合同内容',
                    itemType: 'textarea',
                    autosize: {minRows: 3, maxRows: 6},
                    span: 24,
                }, {
                    prop: 'files',
                    label: '附件',
                    span: 24,
                    itemType: 'upload',
                    // rules: [{required: true, message: "合同附件必须上传", trigger: "change"}],
                    tip: '请上传合同附件'
                },
            ],
                title = isEdit && '编辑合同' || (isCreated ? '续期合同' : '新建合同');
            return {
                // 配置弹窗
                dialogOption: {
                    title,
                    width: '800px',
                    formOptions: {
                        loading: false,
                        submitBtnText: '提交',
                        showCancelBtn: true,
                        labelWidth: 90,
                        span: 12,
                        forms
                    },
                },
            }
        },
        watch: {
        },
        methods: {
            changeDialog(bool) {
                // console.log(bool, 'changeDialog 操作弹窗的 展示 和 隐藏');
                this.$emit("update:visible", bool)
            },
            // 表单弹窗 提交
            formDialogSubmit(params) {
                console.log('test formDialogSubmit submit', params); // 具体操作  请添加...
                this.$set(this.dialogOption.formOptions, 'loading', true); // 更改提交按钮的状态值
                const submitParams = {...this.formData , ...params}
                if(!this.isEdit) { // 如果是 新添 合同 或者  续期合同  删除 传递的 合同id
                    delete submitParams.id;
                }
                editTenantContract(submitParams).then((res) => {
                    this.$set(this.dialogOption.formOptions, 'loading', false); // 更改提交按钮的状态值
                    const {success, message} = res.data;
                    if (success) {
                        this.$message.success('请求处理成功');
                        this.changeDialog(false); // 关闭按钮
                        this.$emit('renewalSubmitCallBack'); // 触发操作成功的回调
                    } else {
                        this.$message.error(message);
                    }
                })
            },

        }
    }
</script>

<style lang='scss' scoped>

</style>
