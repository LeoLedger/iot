<!--
* @description 盘盈设备
* @author yc
!-->
<template>
    <el-dialog
        :visible="visible"
        :title="title"
        :before-close="handleDialogClose"
        :close-on-click-modal="!isEdit"
        width="760px"
        class="not-padding"
        append-to-body
        @close="$emit('update:visible', false)"
    >
        <div v-loading="loading" class="container">
            <FormConfig
                ref="FormConfig"
                :span="12"
                :label-width="100"
                :forms="forms"
                :scroll="false"
                :disabled="!isEdit"
                :form-data="insideFormData"
                :has-default-form-class="false"
                :show-footer="false"
                is-edit
            />
        </div>
        <span v-if="isEdit" slot="footer">
            <el-button :loading="loading" size="mini" @click="$emit('update:visible', false)">取 消</el-button>
            <el-button v-prereclick :loading="loading" type="primary" size="mini" @click="handleSubmit">提 交</el-button>
        </span>
    </el-dialog>
</template>

<script>
    // API
    import deviceApi from '@/api/inventory/device'
    import deviceSimApi from '@/api/inventory/deviceSim'
    // 方法
    import { isEmpty } from '@/utils'
    // 组件

    export default {
        name: 'UpdateDialog',
        components: {
        },
        props: {
            // 设备类型 0：智能设备 1：SIM卡
            type: { type: Number, default: 0 },
            isEdit: { type: Boolean, default: false },
            visible: { type: Boolean, default: false },
            formData: { type: Object },
            excludes: { type: Array, default: () => [] }
        },
        data() {
            return {
                forms: [],
                model: {},
                loading: false
            }
        },
        computed: {
            title() {
                return this.isEdit ? '添加盘盈设备' : '盘盈设备信息'
            },
            insideFormData() {
                return { ...this.formData, ...this.model }
            }
        },
        watch: {
            type() {
                this.handleUpdateFormConfig()
            }
        },
        mounted() {
            this.handleUpdateFormConfig()
        },
        methods: {
            validate() {
                return new Promise((resolve, reject) => {
                    this.$refs.FormConfig.validate((valid, err) => {
                        if (valid) {
                            resolve(this.getFormData())
                        } else {
                            this.$message.warning(Object.values(err)[0][0].message)
                            reject(err)
                        }
                    })
                })
            },
            // 获取设备信息
            async queryDeviceInfo(data) {
                this.loading = true
                try {
                    var res
                    switch (this.type) {
                    case 0:
                        res = await deviceApi.getList({
                            imei: data.imei,
                            productCode: this.formData.productCode
                        })
                        break
                    case 1:
                        res = await deviceSimApi.getList({
                            sim: data.sim,
                            productCode: this.formData.productCode
                        })
                        break
                    }
                    var device = res.data.records[0]
                    if (device) {
                        switch (this.type) {
                        case 0:
                            this.model = {
                                ...this.model,
                                ...data,
                                ...device,
                                _isCreate: false
                            }
                            this.$set(this.forms.find(v => v.prop === 'sim'), 'disabled', true)
                            break
                        case 1:
                            this.model = {
                                ...this.model,
                                ...data,
                                ...device,
                                _isCreate: false
                            }
                            this.$set(this.forms.find(v => v.prop === 'imei'), 'disabled', true)
                            break
                        }
                        this.$set(this.forms.find(v => v.prop === 'purchaseUnitPrice'), 'disabled', true)
                    } else {
                        switch (this.type) {
                        case 0:
                            this.model = {
                                ...this.model,
                                ...data,
                                sim: '',
                                purchaseUnitPrice: '',
                                _isCreate: true
                            }
                            this.$set(this.forms.find(v => v.prop === 'sim'), 'disabled', false)
                            break
                        case 1:
                            this.model = {
                                ...this.model,
                                ...data,
                                imei: '',
                                purchaseUnitPrice: '',
                                _isCreate: true
                            }
                            this.$set(this.forms.find(v => v.prop === 'imei'), 'disabled', false)
                        }
                        this.$set(this.forms.find(v => v.prop === 'purchaseUnitPrice'), 'disabled', false)
                    }
                } catch (e) {
                    console.log(e)
                }
                this.loading = false
            },
            // 获取当前已输入的formdata
            getFormData() {
                return this.$refs.FormConfig.params
            },
            handleSubmit() {
                this.$refs.FormConfig.submitHandler((data) => {
                    var index = this.excludes.findIndex(item => {
                        switch (this.type) {
                        case 0:
                            return item.imei === data.imei
                        case 1:
                            return item.sim === data.sim
                        }
                    })
                    if (index > -1) {
                        return this.$message.warning('该设备已在库存中！')
                    }
                    data = {
                        ...this.insideFormData,
                        ...data,
                        deviceId: this.insideFormData.guidId
                    }
                    switch (this.type) {
                    case 0:
                        // 智能设备
                        if (data._isCreate) {
                            data.cost = data.purchaseUnitPrice
                        } else {
                            data.cost = Number(data.warehousesSpaceType) === 4 ? data.purchaseUnitPrice : data.unitResidual
                        }
                        break
                    case 1:
                        // SIM卡
                        if (data._isCreate) {
                            data.cost = data.purchaseUnitPrice
                        } else {
                            data.cost = data.surplusFlowFee
                        }
                        break
                    }
                    this.$emit('update', data)
                    this.$emit('update:visible', false)
                }, (err) => {
                    this.$message.warning(Object.values(err)[0][0].message)
                })
            },
            // 弹窗关闭时触发
            handleDialogClose() {
                if (this.isEdit) {
                    this.$confirm('确认放弃本次操作？').then(_ => {
                        this.$emit('update:visible', false)
                    }).catch(_ => {
                        return false
                    })
                } else {
                    this.$emit('update:visible', false)
                }
            },
            // 更新表单配置
            handleUpdateFormConfig() {
                switch (this.type) {
                case 0:
                    this.forms = [
                        {
                            prop: 'imei',
                            label: 'IMEI',
                            itemType: 'input',
                            rules: [
                                { required: true, message: 'IMEI不能为空', trigger: 'blur' }
                            ],
                            blur: () => {
                                var data = this.getFormData()
                                if (!isEmpty(data.imei)) {
                                    this.queryDeviceInfo(data)
                                }
                            }
                        },
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            itemType: 'input',
                            disabled: true
                        },
                        {
                            prop: 'productName',
                            label: '产品名称',
                            itemType: 'input',
                            disabled: true
                        },
                        {
                            prop: 'productType',
                            label: '产品类型',
                            type: 'productType',
                            itemType: 'dictSelect',
                            disabled: true
                        },
                        {
                            prop: 'sim',
                            label: 'SIM卡号',
                            itemType: 'input'
                        },
                        {
                            prop: 'purchaseUnitPrice',
                            type: 'number',
                            label: '设备采购成本',
                            format: 'money',
                            itemType: 'input',
                            rules: [
                                { required: true, message: '设备采购成本不能为空', trigger: 'blur' }
                            ]
                        }
                    ]
                    break
                case 1:
                    this.forms = [
                        {
                            prop: 'sim',
                            label: 'SIM卡号',
                            itemType: 'input',
                            rules: [
                                { required: true, message: 'SIM卡号不能为空', trigger: 'blur' }
                            ],
                            blur: () => {
                                var data = this.getFormData()
                                if (!isEmpty(data.sim)) {
                                    this.queryDeviceInfo(data)
                                }
                            }
                        },
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            itemType: 'input',
                            disabled: true
                        },
                        {
                            prop: 'productName',
                            label: '产品名称',
                            itemType: 'input',
                            disabled: true
                        },
                        {
                            prop: 'productType',
                            label: '产品类型',
                            type: 'productType',
                            itemType: 'dictSelect',
                            disabled: true
                        },
                        {
                            prop: 'imei',
                            label: '关联设备IMEI',
                            itemType: 'input'
                        },
                        {
                            prop: 'purchaseUnitPrice',
                            type: 'number',
                            label: '设备采购成本',
                            format: 'money',
                            itemType: 'input',
                            rules: [
                                { required: true, message: '设备采购成本不能为空', trigger: 'blur' }
                            ]
                        }
                    ]
                    break
                }
            }
        }
    }
</script>

<style lang='scss' scoped>
.container {
    min-height: 240px;
    max-height: 80vh;
    overflow: auto;
    padding: 20px 40px 15px 15px;
}
</style>
