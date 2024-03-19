<!--
* @fileName 库存管理 - 智能设备详情
* @author   望浩然
* @date     2021/4/6
-->

<template>
    <div>
        <el-dialog
            :visible.sync="visible"
            :before-close="handleCancel"
            :close-on-click-modal="false"
            title="设备详情查看"
            class="not-padding"
            width="800px"
            append-to-body>
            <div class="">
                <collapse-tab-layout
                    :tab-list="tabList"
                    show-tab
                    style="padding: 0 0 10px 10px"
                >
                    <template slot="BaseForm">
                        <BaseForm
                            ref="BaseForm"
                            :is-edit="true"
                            :disabled="true"
                            :form-data="formData"
                            @updateSim="updateSim"
                            @showAccount="handleShowAccount"
                        />
                    </template>
                    <template slot="ExtendForm">
                        <ExtendForm
                            ref="ExtendForm"
                            :is-edit="true"
                            :disabled="true"
                            :form-data="formData"
                            @showAccount="handleShowAccount"/>
                    </template>
                    <template slot="DeviceLog">
                        <device-log-table :data-id="formData.guidId" style="margin-right: 10px"/>
                    </template>
                    <template slot="CommLog">
                        <device-comm-log-table :data-id="formData.imei" style="margin-right: 10px"/>
                    </template>
                </collapse-tab-layout>
            </div>
            <span slot="footer">
                <el-button size="mini" @click="handleCancel">关 闭</el-button>
            </span>
        </el-dialog>
        <SelectSimDialog
            v-if="selectSimDialog.visible"
            :extend-params="selectSimDialog.extendParams"
            :visible.sync="selectSimDialog.visible"
            @confirm="handleSelectSimChange"
        />
        <AccountDetailDialog
            v-if="accountDialog.visible"
            :data-id="accountDialog.dataId"
            :extend-params="accountDialog.extendParams"
            :visible.sync="accountDialog.visible"
        />
    </div>
</template>

<script>
    import BaseForm from '@/views/inventoryManagement/DeviceComponents/deviceBaseForm'
    import ExtendForm from './deviceExtendForm'
    import DeviceLogTable from '@/views/inventoryManagement/DeviceComponents/deviceLogTable'
    import DeviceCommLogTable from '@/views/inventoryManagement/DeviceComponents/deviceCommLogTable'
    import deviceApi from '@/api/inventory/device'
    import CollapseTabLayout from '@/components/CollapseTabLayout'
    import SelectSimDialog from '@/views/inventoryManagement/DeviceComponents/SelectSimDialog'
    import AccountDetailDialog from './AccountDetailDialog'
    export default {
        components: { AccountDetailDialog, SelectSimDialog, CollapseTabLayout, DeviceCommLogTable, DeviceLogTable, BaseForm, ExtendForm },
        props: {
            // 数据ID
            dataId: {
                type: String,
                default: null
            },
            // 窗口可视属性
            visible: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                selectSimDialog: {
                    visible: false,
                    extendParams: {}
                },
                accountDialog: {
                    visible: false,
                    dataId: null,
                    extendParams: {}
                },
                formData: {},
                tabList: [
                    { name: '0',
                      label: '基础信息',
                      collapseList: [
                          { title: '设备信息', disabled: true, slotName: 'BaseForm' },
                          { title: '扩展信息', button: false, slotName: 'ExtendForm' }
                      ] },
                    { name: '1', label: '设备日志', slotName: 'DeviceLog' },
                    { name: '2', label: '通信记录', slotName: 'CommLog' }
                ]
            }
        },
        computed: {},
        watch: {
            // 监听dataId重新初始化表单数据
            dataId(val) {
                this.init()
            }
        },
        mounted() {
            this.init()
        },
        destroyed() {
            this.formData = {}
        },
        methods: {
            init() {
                // 初始化
                this.getDetail()
            },
            // 通过dateId获取表单数据
            async getDetail() {
                this.formData = {}
                if (this.dataId) {
                    this.loading = true
                    // 根据dataId是否包含-判断是imei还是guid
                    let res = {}
                    if (this.dataId.indexOf('-') > -1) {
                        res = await deviceApi.detail(this.dataId)
                    } else {
                        res = await deviceApi.detailByImei(this.dataId)
                    }
                    if (res.success && res.data) {
                        this.formData = res.data
                        // 格式化金额
                        this.formData.unitResidual = Number(String(this.formData.unitResidual).replace(/^(.*\..{4}).*$/, '$1'))
                        this.formData.warrantyRemainAmount = Number(String(this.formData.warrantyRemainAmount).replace(/^(.*\..{4}).*$/, '$1'))
                        this.formData.surplusServiceFee = Number(String(this.formData.surplusServiceFee).replace(/^(.*\..{4}).*$/, '$1'))
                        // 封装库存状态字段
                        this.formData._status = res.data.warehousesName + ' | ' + res.data.warehousesSpaceName
                        // 通过empowerIp获取Name
                        this.formData.empowerName = (this.getDict('empowerIp').find(v => v.value === res.data.empowerIp) || {}).label || ''
                    } else {
                        this.$message({ type: 'warning', message: '未找到该设备' })
                        this.handleCancel()
                    }
                    setTimeout(() => {
                        this.loading = false
                    }, 500)
                }
            },
            handleCancel() {
                this.$emit('close', false)
                this.$emit('update:visible')
            },
            updateSim() {
                // 修改SIM卡号
                this.selectSimDialog.visible = true
                this.selectSimDialog.extendParams = {
                    // SIM卡
                    productCategory: 'BBB76246-2925-43D8-B81D-D5FF74F1D1D7'
                }
            },
            handleShowAccount(prop) {
                if (prop === 'unitResidual') {
                    this.accountDialog.extendParams = {
                        feeType: 6
                    }
                }
                if (prop === 'surplusServiceFee') {
                    this.accountDialog.extendParams = {
                        feeType: 2
                    }
                }
                if (prop === 'warrantyRemainAmount') {
                    this.accountDialog.extendParams = {
                        feeType: 7
                    }
                }
                this.accountDialog.visible = true
                this.accountDialog.dataId = this.formData.guidId
            },
            async handleSelectSimChange(row) {
                const _this = this
                await this.$confirm('确认替换SIM卡？', '提示', {
                    confirmButtonText: '确认替换',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                })
                try {
                    const res = await deviceApi.updateSim({ imei: _this.formData.imei, sim: row.sim })
                    if (res.success) {
                        _this.init()
                        _this.$message.success('替换SIM卡成功')
                    } else _this.$message.error('替换SIM卡失败')
                } catch (e) {}
            }
        }
    }
</script>

<style scoped lang="scss">
.group-container {
  .group-item {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
    .label {
      border-bottom: 1px solid #f5f7fa;
      padding: 0 10px;
      height: 35px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      .text {
        font-size: 13px;
        &:before {
          height: 10px;
          content: '';
          width:0;
          border-left: 3px solid #2abeff;
          margin-right: 10px;
        }
      }
    }
    .children {
      display: flex;
      flex-direction: row;
      .item {
        min-width: 120px;
        padding: 5px 20px;
        text-align: center;
        color: #2a2a2a;
        background: #e4e4e4;
        margin-right: 10px;
        border-radius: 20px;
        &.active {
          background: #13C2C2;
          color: white;
        }
      }
    }
  }
}
</style>
