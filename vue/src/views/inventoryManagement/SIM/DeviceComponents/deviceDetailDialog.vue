<!--
* @fileName 库存管理 - SIM卡详情查看
* @author   望浩然
* @date     2021/4/6
-->

<template>
    <div>
        <el-dialog
            :visible.sync="visible"
            :before-close="handleCancel"
            :close-on-click-modal="false"
            title="SIM卡详情查看"
            class="not-top-padding"
            width="800px"
            append-to-body>
            <div class="">
                <el-tabs v-model="activeTab">
                    <el-tab-pane name="0" label="基础信息">
                        <BaseForm
                            ref="BaseForm"
                            :is-edit="true"
                            :disabled="true"
                            :form-data="formData"/>
                    </el-tab-pane>
                    <el-tab-pane name="1" label="日志记录">
                        <device-log-table :data-id="formData.guidId"/>
                    </el-tab-pane>
                </el-tabs>
            </div>
            <span slot="footer">
                <el-button size="mini" @click="handleCancel">关 闭</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import BaseForm from '@/views/inventoryManagement/SIM/DeviceComponents/deviceBaseForm'
    import DeviceLogTable from '@/views/inventoryManagement/SIM/DeviceComponents/deviceLogTable'
    import deviceApi from '@/api/inventory/deviceSim'
    export default {
        components: { DeviceLogTable, BaseForm },
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
                formData: {},
                // 标签
                activeTab: '0'
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
                    let res
                    if (this.dataId.indexOf('-') > -1) {
                        res = await deviceApi.detail(this.dataId)
                    } else {
                        res = await deviceApi.detailBySiM(this.dataId)
                    }
                    if (res.success) {
                        this.formData = res.data
                        this.formData._status = res.data.warehousesName + ' | ' + res.data.warehousesSpaceName
                    }
                    setTimeout(() => {
                        this.loading = false
                    }, 500)
                }
            },
            handleCancel() {
                this.$emit('close', false)
                this.$emit('update:visible')
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
