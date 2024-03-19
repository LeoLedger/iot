<!--
* @description 退还押金
* @author yc
!-->
<template>
    <div v-loading="loading">
        <el-collapse v-model="collapseValue" class="layou-collapse">
            <el-collapse-item name="1" disabled>
                <div slot="title" class="title">
                    <div class="text">基础信息</div>
                </div>
                <div class="body-wrap">
                    <BaseForm
                        ref="BaseForm"
                        :form-data="formData"
                        :disabled="!isCreate && !isUpdate"
                        :extend-params="extendParams"
                        @warehouses-change="handleWarehouseChange"
                        @showList="handleShowDeviceList"
                    />
                </div>
            </el-collapse-item>
        </el-collapse>
        <!-- 配置退库清单 -->
        <DeviceListDialog
            v-if="deviceListDialog.visible"
            :device-list="devices"
            :basic-data="formData"
            :extend-params="deviceListDialog.extendParams"
            :visible.sync="deviceListDialog.visible"
            :show-action="isCreate || isUpdate"
            :is-approval="isApproval"
            :process-index="processIndex"
            :is-create="isCreate"
            @change="handleListChange"
        />
    </div>
</template>

<script>
  // API
    import mainApi from '@/api/businessDocuments/deviceDamaged'
    // 方法
    // 组件
    import BaseForm from './BaseForm'
    import DeviceListDialog from './DeviceListDialog'

    export default {
        components: {
            BaseForm,
            DeviceListDialog
        },
        props: {
            dataId: { type: [Number, String] },
            isEdit: { type: Boolean, default: false },
            isUpdate: { type: Boolean, default: false },
            jsonData: { type: [Object, Array] },
            isApproval: { type: Boolean, default: false },
            processIndex: { type: Number, default: 0 },
            extendParams: { type: Object }
        },
        data() {
            return {
                loading: false,
                formData: {},
                devices: [],
                collapseValue: ['1'],
                deviceListDialog: {
                    visible: false,
                    extendParams: {}
                }
            }
        },
        computed: {
            isCreate() {
                return !this.dataId
            }
        },
        watch: {
            dataId: {
                deep: true,
                immediate: true,
                handler() {
                    this.queryBaseInfo()
                }
            },
            processIndex() {}
        },
        mounted() {
        },
        methods: {
            // 点击提交按钮时触发
            submit(callback, errorCallback) {
                // 判断报损数量
                if (this.formData.count > 0) {
                    this.loading = true
                    this.$refs.BaseForm.submit((data) => {
                        mainApi.update({
                            ...this.formData,
                            ...data,
                            devices: this.devices
                        }).then(res => {
                            this.$notify({
                                title: '保存成功',
                                message: res.msg,
                                type: 'success',
                                duration: 2000
                            })
                            this.getCanApprovalCount()
                            callback && callback()
                        }).catch(() => {
                            errorCallback && errorCallback()
                        }).finally(() => {
                            this.loading = false
                        })
                    }, () => {
                        this.loading = false
                        errorCallback && errorCallback()
                    })
                } else {
                    this.$message.warning('未选择报损设备，无法提交')
                    errorCallback && errorCallback()
                }
            },
            // 获取基础信息
            async queryBaseInfo() {
                // 创建
                if (!this.dataId) {
                    this.devices = []
                } else {
                    // 如果是编辑,则获取详情
                    this.loading = true
                    var res = await mainApi.detail(this.dataId)
                    if (res.success) {
                        this.formData = {
                            ...this.formData,
                            ...res.data
                        }
                        // 获取清单下的设备列表
                        mainApi.getDeviceList({ dataId: this.formData.guidId, pageSize: -1 }).then(res => {
                            if (res.success) {
                                this.devices = res.data.records
                            } else {
                                this.$message.error('加载设备列表失败')
                            }
                        })
                        this.$emit('data-update', this.formData)
                        this.$emit('update:jsonData', this.devices)
                    }
                    this.loading = false
                }
            },
            // 仓库发生改变
            handleWarehouseChange(value) {
                console.log('value', value)
                const formData = this.$refs.BaseForm.getFormData()
                this.formData = { ...formData }
                // 自动清空报损数量和报损设备
                this.formData.count = 0
                this.formData.devices = []
                this.devices = []
                //
                if (value.place.value === '09509d7b-5be3-4a89-a472-58c14b35cc2c') {
                    this.deviceListDialog.extendParams = {
                        unitStatus: 1,
                        lockedProps: ['productCategory', 'warehousesId', 'shippingSpaceId', 'typeId', 'unitStatus']
                    }
                } else this.deviceListDialog.extendParams = {}
            },
            // 查看申请报损设备列表
            handleShowDeviceList() {
                // 必须先选择产品
                if (this.formData.shippingSpaceId && this.formData.warehousesId) {
                    this.deviceListDialog.visible = true
                } else {
                    this.$message.warning('请先选择仓库和仓位')
                }
            },
            // 更新报损设备
            handleListChange(list) {
                this.devices = list
                const data = this.$refs.BaseForm.getFormData()
                this.formData = { ...this.formData, ...data }
                this.formData.count = list.length
                this.$emit('update:jsonData', this.devices)
            }
        }
    }
</script>

<style lang='scss' scoped>
.input-dialog {
    padding: 20px 0;
    .text {
        margin-bottom: 15px;
    }
}
</style>
