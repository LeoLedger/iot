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
    import enums from '@/utils/enum'
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
                forms: this.getForms,
                curParams: {}
            }
        },
        computed: {
            getForms() {
                return [
                    {
                        prop: '_status',
                        label: '库存状态',
                        itemType: 'input'
                    },
                    {
                        prop: 'unitStatus',
                        type: 'deviceStatus',
                        label: '设备状态',
                        itemType: 'dictSelect'
                    },
                    {
                        visible: this.getVisibleBySpaceName(['在运营', '寄存']),
                        prop: 'projectName',
                        label: '项目',
                        itemType: 'input'
                    },
                    {
                        visible: this.getVisibleBySpaceName(['在运营', '寄存']),
                        prop: 'customerName',
                        label: '企业',
                        itemType: 'input'
                    },
                    {
                        visible: this.getVisibleBySpaceName(['在运营', '寄存']),
                        prop: 'sectionName',
                        label: '标段',
                        itemType: 'input'
                    },
                    {
                        visible: this.getVisibleBySpaceName(['旧', '备用', '报损']),
                        prop: 'projectName',
                        label: '回收前所在项目',
                        itemType: 'input',
                        idKey: 'projectId',
                        isClick: true,
                        dialogType: 'project'
                    },
                    {
                        visible: this.getVisibleBySpaceName(['旧', '备用', '报损']),
                        prop: 'customerName',
                        label: '回收前所在企业',
                        itemType: 'input'
                    },
                    {
                        visible: this.getVisibleBySpaceName(['旧', '备用', '报损']),
                        prop: 'sectionName',
                        label: '回收前所在标段',
                        itemType: 'input',
                        idKey: 'sectionId',
                        isClick: true,
                        dialogType: 'sections'
                    },
                    {
                        visible: this.getVisibleBySpaceName(['备用']),
                        prop: 'standbyProjectName',
                        label: '备用项目',
                        itemType: 'input',
                        idKey: 'standbyProjectId',
                        isClick: true,
                        dialogType: 'project'
                    },
                    {
                        visible: this.getVisibleBySpaceName(['报损']) && this.formData.unitStatus !== 1,
                        prop: 'frmLossTime',
                        label: '报损时间',
                        itemType: 'date'
                    },
                    {
                        visible: this.getVisibleBySpaceName(['报损']) && this.formData.unitStatus !== 1,
                        prop: 'frmLossUserName',
                        label: '报损人',
                        itemType: 'input'
                    },
                    {
                        visible: this.getVisibleBySpaceName(['报损']) && this.formData.unitStatus !== 1,
                        prop: 'frmLossReason',
                        label: '报损原因',
                        itemType: 'textarea',
                        span: 24
                    },
                    {
                        visible: this.getVisibleBySpaceName(['在运营', '寄存']),
                        prop: 'originalOutContractCode',
                        label: '标段销售合同',
                        itemType: 'input',
                        idKey: 'originalOutContractId',
                        isClick: true,
                        dialogType: 'salesContract'
                    },
                    {
                        visible: this.getVisibleBySpaceName(['在运营', '寄存']),
                        prop: 'sectionSalesType',
                        type: 'salesType',
                        label: '标段销售类型',
                        itemType: 'dictSelect'
                    },
                    {
                        visible: this.getVisibleBySpaceName(['在运营', '寄存']),
                        prop: 'originalOutImei',
                        label: '原始出库设备',
                        itemType: 'input'
                    },
                    {
                        visible: this.getVisibleBySpaceName(['在运营', '寄存']),
                        prop: 'serviceBeginDate',
                        label: '服务开始日期',
                        itemType: 'date'
                    },
                    {
                        visible: this.getVisibleBySpaceName(['在运营', '寄存']),
                        prop: 'serviceEndDate',
                        label: '服务截止日期',
                        itemType: 'date'
                    },
                    {
                        visible: this.getVisibleBySpaceName(['在运营', '寄存']),
                        prop: 'serviceRemainDay',
                        label: '剩余服务天数',
                        itemType: 'input'
                    },
                    {
                        visible: this.getVisibleBySpaceName(['在运营', '寄存']),
                        prop: 'surplusServiceFee',
                        label: '未结转服务费',
                        itemType: 'moneyInput',
                        digit: 4,
                        moneyInWords: false,
                        isCopy: false,
                        isClick: true,
                        onClick: () => this.$emit('showAccount', 'surplusServiceFee')
                        // appendRender: () => {
                        //     return (
                        //     <el-button type='primary' onClick={() => { this.$emit('showAccount', 'surplusServiceFee') }}>
                        //       <i class='el-icon-search'/>
                        //     </el-button>
                        //   )
                        // }
                    },
                    {
                        prop: 'empowerName',
                        label: '授权IP',
                        itemType: 'input'
                    }
                ]
            }
        },
        watch: {
            formData: {
                immediate: true,
                handler(value) {
                    this.formDataCopy = { ...this.formData, ...this.curParams }
                    this.forms = this.getForms
                }
            }
        },
        methods: {
            getVisibleBySpaceName(strArr) {
                const warehousesSpaceName = this.formData.warehousesSpaceName || ''
                return strArr.findIndex(str => warehousesSpaceName.indexOf(str) > -1) > -1
            }
        }
    }
</script>

<style scoped>

</style>
