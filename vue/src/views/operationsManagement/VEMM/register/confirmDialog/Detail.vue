<!--
* @description 维修单 - 详情
* @author 望浩然
* @date 2021/5/12 -
!-->
<template>
    <div>
        <el-dialog
            :visible="visible"
            title="维修单详情"
            width="1400px"
            class="not-padding"
            append-to-body
            @close="$emit('update:visible', false)"
        >
            <div class="layout-detail-container">
                <collapse-tab-layout
                    :show-tab="false"
                    :collapse-list="collapseList"
                >
                    <template slot="BaseForm">
                        <BaseForm
                            ref="BaseForm"
                            :form-data="formData"
                            :disabled="true"
                        />
                    </template>
                    <template slot="deviceList">
                        <FaultDeviceList
                            ref="FaultDeviceList"
                            :data-list="listFaultCu"
                            :is-edit="false"
                        />
                    </template>
                </collapse-tab-layout>
            </div>
            <span slot="footer">
                <el-button size="mini" @click="$emit('update:visible', false)">关 闭</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import BaseForm from './BaseForm'
    import CollapseTabLayout from '@/components/CollapseTabLayout'
    import troubleApi from '@/api/operationsManagement/carTroubleTicket'
    import FaultDeviceList from './FaultDeviceList'
    export default {
        components: {
            FaultDeviceList,
            CollapseTabLayout,
            BaseForm
        },
        props: {
            visible: { type: Boolean, default: false },
            dataId: { type: String, default: null }
        },
        data() {
            return {
                loading: false,
                // 故障单详情
                formData: {},
                collapseList: [
                    { disabled: true, title: '基础信息', button: false, slotName: 'BaseForm' },
                    { disabled: true, title: '故障设备', button: false, slotName: 'deviceList' }
                ],
                // 故障设备列表
                listFaultCu: [],
                // 导入窗口
                importDialog: {
                    visible: false,
                    exportParams: {},
                    importParams: {}
                }
            }
        },
        computed: {},
        watch: {
            dataId() {
                this.init()
            }
        },
        mounted() {
            this.init()
        },
        methods: {
            init() {
                this.getDetail()
            },
            getDetail() {
                this.formData = {}
                if (this.dataId) {
                    this.loading = true
                    troubleApi.detail(this.dataId).then(res => {
                        if (res.success) {
                            this.formData = res.data
                            this.listFaultCu = res.data.listFaultCu || []
                        }
                        setTimeout(() => {
                            this.loading = false
                        }, 500)
                    })
                }
            },
            handleClose() {
                this.$emit('close')
                this.$emit('update:visible', false)
            }
        }
    }
</script>

<style lang='scss' scoped>
.body-wrap {
    height: 450px;
}
</style>
