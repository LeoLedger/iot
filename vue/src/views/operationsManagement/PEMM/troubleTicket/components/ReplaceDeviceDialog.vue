<!--
* @description 选择备用设备
* @author yc
!-->
<template>
    <div>
        <el-dialog
            v-if="visible"
            :visible="visible"
            :title="title"
            :close-on-click-modal="false"
            width="1200px"
            class="not-padding"
            append-to-body
            @close="$emit('update:visible', false)"
        >
            <div class="container">
                <el-tabs v-model="tabActive" class="layout-tabs">
                    <el-tab-pane :disabled="loading" name="0" label="项目备用库"/>
                    <el-tab-pane :disabled="loading" name="2" label="挂起设备"/>
                    <el-tab-pane v-if="isOriginalDevice" :disabled="loading" name="3" label="原设备"/>
                </el-tabs>
                <Device
                    ref="Device"
                    :value="value"
                    :excludes="excludes"
                    :extend-params="extendParams"
                    :custom-request="customRequest"
                    @change="handlePickChange"
                    @loading-change="handleLoadingChange"
                />
            </div>
            <span slot="footer">
                <el-button size="mini" @click="$emit('update:visible', false)">取 消</el-button>
                <el-button v-prereclick type="primary" size="mini" @click="handleSubmit">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    // API
    import troubleTicketApi from '@/api/operationsManagement/troubleTicket'
    // 方法
    // 组件
    import Device from '@/components/SelectDialog/Device'

    export default {
        name: 'ReplaceDeviceDialog',
        components: {
            Device
        },
        props: {
            type: { type: [String, Number], default: '0' },
            value: { type: null, default: '' },
            title: { type: String, default: '替换备用设备' },
            visible: { type: Boolean, default: false },
            params: { type: Object, default: () => ({}) },
            excludes: { type: Array, default: () => [] },
            rowData: Object
        },
        data() {
            let { imei, projectId, sectionId } = this.rowData
            return {
                loading: false,
                tabActive: '0',
                selectList: [],
                searchParam: {
                    pageSize: 10,
                    productType: '288F8C2D-9CEB-46FC-87C9-DC4C16108162',
                    productCategory: 'B16C3151-11D2-4364-8F45-63EFFFFCF424'
                },
                customRequest: troubleTicketApi.getReplaceDevice,
                warehouseEnum: [
                    // 项目备用库
                    {
                        standbyProjectId: projectId,
                        warehousesId: '9f1d6d84-98da-4bc3-bc7c-ec299ef2b4d5',
                        typeId: this.getWarehousesSpaceType(0, '备用'),
                        lockedProps: ['productType']
                    },
                    // 全新设备
                    {},
                    // 挂起设备
                    {
                        sectionId,
                        projectId,
                        unitStatus: 8,
                        warehousesId: '1bba900a-26c8-492e-bd6d-1583814866c9',
                        typeId: this.getWarehousesSpaceType(0, '报损'),
                        lockedProps: ['projectId', 'sectionId', 'unitStatus', 'productType']
                    },
                    // 原设备
                    {
                        imei,
                        sectionId,
                        projectId,
                        typeId: this.getWarehousesSpaceType(0, '在运营'),
                        lockedProps: ['imei', 'projectId', 'sectionId', 'productType']
                    }
                ]
            }
        },
        computed: {
            extendParams() {
                return {
                    ...this.searchParam,
                    ...this.params,
                    ...this.warehouseEnum[this.tabActive],
                    notSelectClick: () => {
                        this.$message.warning('该设备已被选择！')
                    }
                }
            },
            // 是否可以选择原设备
            isOriginalDevice() {
                let { deviceId, handlingWay } = this.rowData
                return [0, 1].includes(handlingWay) && deviceId
            }
        },
        watch: {
            type: {
                immediate: true,
                handler(value) {
                    switch (Number(value)) {
                    case 0:
                    case 1:
                        value = 0
                        break
                    case 2:
                        value = 2
                        break
                    }
                    this.tabActive = String(value)
                }
            }
        },
        mounted() {
        },
        methods: {
            // 点击提交按钮时触发
            handleSubmit() {
                var data = this.selectList[0]
                if (!this.value && !data) {
                    this.$message.warning('请至少选中一项')
                } else {
                    let type = Number(this.tabActive)
                    if (type === 0) {
                        type = data.isNewDevice ? 1 : type
                    }
                    this.$emit('update:visible', false)
                    this.$emit('change', {
                        type,
                        data
                    })
                }
            },
            handlePickChange(list) {
                this.selectList = list
            },
            handleLoadingChange(loading) {
                this.loading = loading
            }
        }
    }
</script>

<style lang='scss' scoped>
.container {
    padding: 0 15px 10px;
}
</style>
