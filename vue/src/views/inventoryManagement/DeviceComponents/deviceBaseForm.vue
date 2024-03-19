<template>
    <div class="base-form">
        <FormConfig
            ref="baseForm"
            :span="12"
            :label-width="100"
            :forms="forms"
            :scroll="false"
            :disabled="disabled"
            :form-data="formDataCopy"
            :has-default-form-class="false"
            :show-footer="false"
            :is-edit="isEdit"
        />
    </div>
</template>

<script>
    import FormConfig from '@/components/FormConfig'
    export default {
        components: {
            FormConfig
        },
        props: {
            isEdit: {
                type: Boolean,
                default: true
            },
            disabled: {
                type: Boolean,
                default: false
            },
            isCreate: {
                type: Boolean,
                default: false
            },
            formData: {
                type: Object,
                default: () => ({})
            }
        },
        data() {
            return {
                formDataCopy: null,
                forms: [
                    {
                        prop: 'imei',
                        label: 'IMEI',
                        itemType: 'input'
                    },
                    {
                        prop: 'productCode',
                        label: '产品编号',
                        itemType: 'input'
                    },
                    {
                        prop: 'productName',
                        label: '产品名称',
                        itemType: 'input'
                    },
                    {
                        prop: 'productType',
                        type: 'productType',
                        label: '产品类型',
                        itemType: 'dictSelect'
                    },
                    {
                        prop: 'sim',
                        label: '绑定SIM卡号',
                        disabled: true,
                        itemType: 'input',
                        idKey: 'sim',
                        isClick: true,
                        dialogType: 'deviceSim',
                        appendRender: () => {
                            return (
                            <el-button type='primary' onClick={() => { this.$emit('updateSim') }}>
                              <i class='el-icon-link'/>
                            </el-button>
                          )
                        }
                    },
                    {
                        prop: 'iccid',
                        label: 'ICCID',
                        itemType: 'input'
                    },
                    {
                        prop: 'psn',
                        label: 'PSN号',
                        itemType: 'input'
                    },
                    {
                        prop: 'purchaseContractCode',
                        label: '采购合同',
                        itemType: 'input',
                        idKey: 'purchaseContractId',
                        isClick: true,
                        dialogType: 'purchaseContract'
                    },
                    {
                        prop: 'enterWarehouseCode',
                        label: '入库单号',
                        itemType: 'input',
                        idKey: 'enterWarehouseId',
                        isClick: true,
                        dialogType: 'storagePutApproval'
                    },
                    {
                        prop: 'enterWarehouseTime',
                        label: '入库时间',
                        itemType: 'date'
                    },
                    {
                        prop: 'purchaseUnitPrice',
                        label: '采购成本(元)',
                        itemType: 'moneyInput',
                        unit: '元',
                        moneyInWords: false
                    },
                    {
                        prop: 'outContractCode',
                        label: '销售合同',
                        itemType: 'input',
                        idKey: 'outContractId',
                        isClick: true,
                        dialogType: 'salesContract'
                    },
                    {
                        prop: 'salesType',
                        type: 'salesType',
                        label: '销售类型',
                        itemType: 'dictSelect'
                    },
                    {
                        prop: 'outWarehouseCode',
                        label: '出库单号',
                        itemType: 'input',
                        idKey: 'outWarehouseId',
                        isClick: true,
                        dialogType: 'storageOutApproval'
                    },
                    {
                        prop: 'outWarehouseTime',
                        label: '出库时间',
                        itemType: 'date'
                    },
                    {
                        prop: 'unitResidual',
                        label: '设备残值',
                        itemType: 'moneyInput',
                        unit: '元',
                        digit: 4,
                        moneyInWords: false,
                        isCopy: false,
                        isClick: true,
                        onClick: () => this.$emit('showAccount', 'unitResidual')
                        // appendRender: () => {
                        //     return (
                        //       <el-button type='primary' onClick={() => { this.$emit('showAccount', 'unitResidual') }}>
                        //         <i class='el-icon-search'/>
                        //       </el-button>
                        //   )
                        // }
                    },
                    {
                        prop: 'warrantyStartDate',
                        label: '质保开始日期',
                        itemType: 'date'
                    },
                    {
                        prop: 'warrantyEndDate',
                        label: '质保截止日期',
                        itemType: 'date'
                    },
                    {
                        prop: 'warrantyPeriodDay',
                        label: '剩余保修天数',
                        itemType: 'input'
                    },
                    {
                        prop: 'warrantyRemainAmount',
                        label: '保修费余额',
                        itemType: 'moneyInput',
                        unit: '元',
                        digit: 4,
                        moneyInWords: false,
                        isCopy: false,
                        isClick: true,
                        onClick: () => this.$emit('showAccount', 'warrantyRemainAmount')
                        // appendRender: () => {
                        //     return (
                        //     <el-button type='primary' onClick={() => { this.$emit('showAccount', 'warrantyRemainAmount') }}>
                        //       <i class='el-icon-search'/>
                        //     </el-button>
                        //   )
                        // }
                    },
                    {
                        prop: 'durationDay',
                        label: '设备使用时长',
                        itemType: 'input'
                    },
                    {
                        prop: 'appVersion',
                        label: '软件版本号',
                        itemType: 'input'
                    }
                ],
                curParams: {}
            }
        },
        watch: {
            formData: {
                immediate: true,
                handler(value) {
                    this.formDataCopy = { ...this.formData, ...this.curParams }
                }
            }
        }
    }
</script>

<style scoped>

</style>
