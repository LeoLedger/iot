<template>
    <div class="base-form">
        <FormConfig
            ref="baseForm"
            :span="12"
            :label-width="100"
            :forms="forms"
            :scroll="false"
            :disabled="disabled"
            :form-data="formData"
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
                        label: 'SIM卡号',
                        itemType: 'input'
                    },
                    {
                        prop: 'iccid',
                        label: 'ICCID',
                        itemType: 'input'
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
                        prop: 'activate_time',
                        label: '激活日期',
                        itemType: 'date'
                    },
                    {
                        prop: 'dueDate',
                        label: '到期时间',
                        itemType: 'date'
                    },
                    {
                        prop: 'surplusFlowFee',
                        label: '剩余流量费',
                        itemType: 'moneyInput',
                        unit: '元',
                        moneyInWords: false
                    },
                    {
                        prop: '_status',
                        label: '库存状态',
                        itemType: 'input'
                    },
                    {
                        prop: 'imei',
                        label: '绑定设备IMEI',
                        itemType: 'input',
                        idKey: 'imei',
                        isClick: true,
                        dialogType: 'device'
                    },
                    {
                        prop: 'deviceUnitStatus',
                        type: 'deviceStatus',
                        label: '绑定设备状态',
                        itemType: 'dictSelect'
                    }
                ],
                curParams: {}
            }
        }
    }
</script>

<style scoped>

</style>
