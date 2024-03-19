<!--
* @description 选择过保翻新/旧设备维修寄修设备
* @author yc
!-->
<template>
    <div>
        <el-dialog
            v-if="visible"
            :visible="visible"
            :title="title"
            :close-on-click-modal="false"
            width="1300px"
            class="not-padding"
            append-to-body
            @close="$emit('update:visible', false)"
        >
            <div class="container">
                <el-tabs v-model="tabActive" class="layout-tabs">
                    <el-tab-pane name="0" label="报损库" v-if="optionalWarehouse.includes('0')"/>
                    <el-tab-pane name="1" label="旧设备库" v-if="optionalWarehouse.includes('1')"/>
                    <el-tab-pane name="2" label="备用设备库" v-if="optionalWarehouse.includes('2')"/>
                </el-tabs>
                <Device
                    :value="value"
                    :excludes="excludes"
                    :extend-params="extendParams"
                    :custom-request="customRequest"
                    multiple
                    height="634px"
                    @change="handlePickChange"
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
    import sendRevisedApi from '@/api/operationsManagement/sendRevised'
    // 方法
    // 组件
    import Device from '@/components/SelectDialog/Device'

    export default {
        name: 'ReplaceDeviceDialog',
        components: {
            Device
        },
        props: {
            value: null,
            title: { type: String, default: '选择寄修设备' },
            params: { type: Object, default: () => ({}) },
            visible: { type: Boolean, default: false },
            excludes: { type: Array, default: () => [] },
            warehouse: { type: String, default: '0' },
            optionalWarehouse: { type: Array, default: () => ['0', '1', '2'] }
        },
        data() {
            return {
                tabActive: '0',
                selectList: [],
                searchParam: {
                    pageSize: 15
                },
                customRequest: sendRevisedApi.getScrapDevices,
                warehouseEnum: [
                    // 报损库
                    {
                        warehousesId: '1bba900a-26c8-492e-bd6d-1583814866c9',
                        typeId: this.getWarehousesSpaceType(0, '报损')
                    },
                    // 旧设备库
                    {
                        warehousesId: '1bba900a-26c8-492e-bd6d-1583814866c9',
                        typeId: this.getWarehousesSpaceType(0, '旧设备')
                    },
                    // 备用设备库
                    {
                        warehousesId: '9f1d6d84-98da-4bc3-bc7c-ec299ef2b4d5',
                        typeId: this.getWarehousesSpaceType(0, '备用')
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
                    productType: '288F8C2D-9CEB-46FC-87C9-DC4C16108162',
                    productCategory: 'B16C3151-11D2-4364-8F45-63EFFFFCF424',
                    filterRepairDevice: 1,
                    lockedProps: ['productType', 'supplierId'],
                    notSelectClick: () => {
                        this.$message.warning('该设备已被选择！')
                    }
                }
            }
        },
        watch: {
        },
        mounted() {
            this.tabActive = this.warehouse || '0'
            this.selectList = this.value || []
        },
        methods: {
            // 点击提交按钮时触发
            handleSubmit() {
                var list = this.selectList
                if (list.length) {
                    this.$emit('update:visible', false)
                    this.$emit('change', list)
                } else {
                    this.$message.warning('请至少选中一项')
                }
            },
            handlePickChange(list) {
                this.selectList = list
            }
        }
    }
</script>

<style lang='scss' scoped>
.container {
    padding: 0 15px 10px;
}
</style>
