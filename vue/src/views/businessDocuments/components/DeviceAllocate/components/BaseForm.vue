<!--
* @description 基础表单
* @author yc
!-->
<template>
    <div v-loading="loading" class="base-form">
        <FormConfig
            ref="baseForm"
            :span="12"
            :label-width="110"
            :forms="forms"
            :scroll="false"
            :disabled="disabled"
            :form-data="insideFormData"
            :has-default-form-class="!isEdit"
            :show-footer="false"
            :is-edit="isEdit"
        />
        <!-- 信息窗口 -->
        <MessageDialog
            v-bind="messageDialog"
            :visible.sync="messageDialog.visible"
            @confirm="messageDialog.visible = false"
        />
    </div>
</template>

<script>
    // API
    // 方法
    import enums from '@/utils/enum'
    // 组件
    // 客户仓位id
    const ClientPlace = [
        'cf946c33-9f2c-11eb-bbfa-000c29bb1337',
        '3ad17249-a0dd-11eb-8666-000c29bb1337'
    ]
    // 智能设备仓位枚举
    const warehousePlaceEnum = {
        0: '38f6b174-b297-438f-aa1a-ba72e24f2b58', // 寄存设备
        1: '27f5247f-a1ec-47a7-91cc-28402a56f60c', // 旧设备
        2: '92bac0e7-eadd-493a-b6bd-17a5a45d0bbb', // 报损设备
        3: '09509d7b-5be3-4a89-a472-58c14b35cc2c', // 备用设备
        4: '0d6146ff-ab3d-4dde-8584-803e2fc03730' // 全新设备
    }

    export default {
        components: {
        },
        props: {
            isEdit: { type: Boolean, default: true },
            disabled: { type: Boolean, default: false },
            formData: { type: Object, default: () => ({}) }
        },
        data() {
            return {
                model: {},
                forms: [
                    {
                        prop: 'code',
                        label: '单据编号',
                        itemType: 'input',
                        visible: this.disabled
                    },
                    {
                        prop: 'applyDate',
                        label: '提交时间',
                        itemType: 'date',
                        visible: this.disabled
                    },
                    {
                        prop: 'applyUserName',
                        label: '提交人',
                        itemType: 'input',
                        visible: this.disabled
                    },
                    {
                        prop: 'warehousesOutId',
                        type: enums.productCategoryId.find(v => v.value === 0).id,
                        typeIdKey: 'warehousesOutTypeId',
                        placeKey: 'shippingSpaceOutId',
                        label: '调出仓库',
                        itemType: 'warehouseCascader',
                        clearable: true,
                        canSelectStock: [
                            warehousePlaceEnum[0],
                            warehousePlaceEnum[1],
                            warehousePlaceEnum[2],
                            warehousePlaceEnum[3],
                            warehousePlaceEnum[4]
                        ],
                        excludes: [],
                        rules: [
                            { required: true, message: '请选择调出仓库', trigger: 'blur' }
                        ],
                        change: (value) => {
                            this.handleWarehousesOutChange(value)
                        }
                    },
                    {
                        prop: 'warehousesInId',
                        type: enums.productCategoryId.find(v => v.value === 0).id,
                        placeKey: 'shippingSpaceInId',
                        label: '调入仓库',
                        itemType: 'warehouseCascader',
                        clearable: true,
                        excludes: [],
                        canSelectStock: [
                            warehousePlaceEnum[0],
                            warehousePlaceEnum[1],
                            warehousePlaceEnum[3]
                        ],
                        rules: [
                            { required: true, message: '请选择调入仓库', trigger: 'blur' }
                        ],
                        change: (value) => {
                            this.handleWarehousesInChange(value)
                        }
                    },
                    {
                        prop: 'sectionName',
                        label: '调入标段',
                        type: 'sections',
                        itemType: 'dialogPick',
                        formKey: 'sectionId',
                        visible: false,
                        rules: [
                            { required: true, message: '请选择调入标段', trigger: 'change' }
                        ],
                        change: () => {
                            this.judgeQueryProductCategory()
                        }
                    },
                    {
                        prop: 'count',
                        label: '调拨数量',
                        itemType: 'input',
                        disabled: true
                    },
                    {
                        prop: 'remark',
                        label: '备注',
                        itemType: 'textarea',
                        numLimit: 100,
                        placeholder: '请填写备注, 不超过100字',
                        span: 24
                    },
                    {
                        prop: 'files',
                        label: '附件',
                        itemType: 'upload',
                        span: 24
                    }
                ],
                loading: false,
                messageDialog: {
                    visible: false
                }
            }
        },
        computed: {
            insideFormData() {
                return { ...this.formData, ...this.model }
            }
        },
        watch: {
            formData: {
                deep: true,
                immediate: true,
                handler(data) {
                    if (data) {
                        this.setFormConfigProp('sectionName', 'visible', ClientPlace.includes(data.warehousesOutTypeId))
                    }
                }
            }
        },
        mounted() {
        },
        methods: {
            // 提交表单
            submit() {
                return new Promise((resolve, reject) => {
                    this.$refs.baseForm.submitHandler((data) => {
                        data = {
                            ...this.insideFormData,
                            ...data
                        }
                        resolve(data)
                    }, (err, data) => {
                        this.$message.warning(Object.values(err)[0][0].message)
                        reject(err, data)
                    })
                })
            },
            // 获取当前已输入的formdata
            getFormData() {
                return this.$refs.baseForm.params
            },
            // 设置form配置
            setFormConfigProp(key, prop, value) {
                this.$set(this.forms.find(item => item.prop === key), prop, value)
            },
            // 判断是否需要请求可调拨的设备产品种类
            judgeQueryProductCategory() {
                var data = this.getFormData()
                if (data.warehousesInId && data.warehousesOutId) {
                    if (this.forms.find(v => v.prop === 'sectionName').visible) {
                        if (data.sectionId) {
                            this.$emit('complete', data)
                        }
                    } else {
                        this.$emit('complete', data)
                    }
                } else {
                    this.$emit('reset-list', data)
                }
                // 调出仓库选择旧设备，且调入仓库只能选择备用设备，弹出提示所有挑拨设备的状态会被更新为正常
                if (
                    data.shippingSpaceOutId === warehousePlaceEnum[1] &&
                    data.shippingSpaceInId === warehousePlaceEnum[3]
                ) {
                    this.messageDialog = {
                        visible: true,
                        content: '<span class="high">【旧设备】</span>调拨到<span class="high">【备用设备】</span>，所有调拨设备的状态会被更新为正常！'
                    }
                } else if (
                    data.shippingSpaceOutId === warehousePlaceEnum[2] &&
                    data.shippingSpaceInId === warehousePlaceEnum[3]
                ) {
                    this.messageDialog = {
                        visible: true,
                        content: '<span class="high">【报损设备】</span>调拨到<span class="high">【备用设备】</span>，所有调拨设备的状态会被更新为正常！'
                    }
                } else if (
                    data.shippingSpaceOutId === warehousePlaceEnum[2] &&
                    data.shippingSpaceInId === warehousePlaceEnum[1]
                ) {
                    this.messageDialog = {
                        visible: true,
                        content: '<span class="high">【报损设备】</span>调拨到<span class="high">【旧设备】</span>，所有调拨设备的状态会被更新为正常！'
                    }
                }
            },
            // 调出仓库改变时触发
            handleWarehousesOutChange({ place }) {
                var data = this.getFormData()
                var canSelectStock = [
                    warehousePlaceEnum[0],
                    warehousePlaceEnum[3]
                ]
                switch (place && place.value) {
                case warehousePlaceEnum[0]: // 寄存设备
                    // 可选寄存设备1
                    canSelectStock = [warehousePlaceEnum[0]]
                    break
                case warehousePlaceEnum[1]: // 旧设备
                    // 可选备用设备
                    canSelectStock = [warehousePlaceEnum[3]]
                    break
                case warehousePlaceEnum[2]: // 报损设备
                    // 可选旧设备、备用设备
                    canSelectStock = [
                        warehousePlaceEnum[1],
                        warehousePlaceEnum[3]
                    ]
                    break
                case warehousePlaceEnum[3]: // 备用设备
                    // 可选旧设备
                    canSelectStock = [warehousePlaceEnum[1]]
                    break
                case warehousePlaceEnum[4]: // 全新设备
                    // 可选旧设备、备用设备
                    canSelectStock = [
                        warehousePlaceEnum[1],
                        warehousePlaceEnum[3]
                    ]
                    break
                }
                data.warehousesInId = ''
                data.shippingSpaceInId = ''
                this.setFormConfigProp('warehousesInId', 'canSelectStock', canSelectStock)
                this.judgeQueryProductCategory()
            },
            // 调入仓库改变时触发
            handleWarehousesInChange() {
                this.judgeQueryProductCategory()
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
