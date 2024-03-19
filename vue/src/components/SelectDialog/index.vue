<!--
* @description 选择弹窗
* @author yc
!-->
<template>
    <el-dialog
        v-if="visible"
        :title="title"
        :visible="visible"
        :close-on-click-modal="false"
        width="1200px"
        append-to-body
        @close="$emit('update:visible', false)"
    >
        <keep-alive v-if="visible" :include="pickTypes">
            <component
                ref="PickerComponent"
                :is="type"
                :value="value"
                :multiple="multiple"
                :excludes="excludes"
                :extend-params="extendParams"
                :extend-columns="extendColumns"
                :max-count="maxCount"
                :overage-message="overageMessage"
                :only-show="onlyShow"
                :data-list="dataList"
                :set-table-options="setTableOptions"
                :custom-request="customRequest"
            />
        </keep-alive>
        <span v-if="!onlyShow" slot="footer">
            <el-button size="mini" @click="$emit('update:visible', false)">取 消</el-button>
            <el-button v-prereclick type="primary" size="mini" @click="handleSubmit">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import Sim from '@/components/SelectDialog/Sim'
    import Device from '@/components/SelectDialog/Device'
    import People from '@/components/SelectDialog/People'
    import Project from '@/components/SelectDialog/Project'
    import Product from '@/components/SelectDialog/Product'
    import Company from '@/components/SelectDialog/Company'
    import Express from '@/components/SelectDialog/Express'
    import ExpressBill from '@/components/SelectDialog/ExpressBill'
    import MaintainBill from '@/components/SelectDialog/MaintainBill'
    import Invoice from '@/components/SelectDialog/Invoice'
    import Sections from '@/components/SelectDialog/Sections'
    import Contacts from '@/components/SelectDialog/Contacts'
    import EmpowerIp from '@/components/SelectDialog/EmpowerIp'
    import ProjectEO from '@/components/SelectDialog/ProjectEO'
    import MoneyClaim from '@/components/SelectDialog/MoneyClaim'
    import StoragePut from '@/components/SelectDialog/StoragePut'
    import StorageOut from '@/components/SelectDialog/StorageOut'
    import Receivables from '@/components/SelectDialog/Receivables'
    import DeviceFailure from '@/components/SelectDialog/DeviceFailure'
    import SalesContract from '@/components/SelectDialog/SalesContract'
    import PurchaseContract from '@/components/SelectDialog/PurchaseContract'
    import MaterialTesting from '@/components/SelectDialog/MaterialTesting'
    import MaintenanceBill from '@/components/SelectDialog/MaintenanceBill'
    import DeviceInstallBill from '@/components/SelectDialog/DeviceInstallBill'

    import types from '@/components/SelectDialog/types'

    const pickTypes = Object.keys(types)

    export default {
        name: 'SelectDialog',
        components: {
            Sim,
            Device,
            People,
            Project,
            Product,
            Company,
            Express,
            Sections,
            Contacts,
            EmpowerIp,
            ProjectEO,
            MoneyClaim,
            StoragePut,
            StorageOut,
            Receivables,
            DeviceFailure,
            SalesContract,
            PurchaseContract,
            MaterialTesting,
            ExpressBill,
            MaintainBill,
            Invoice,
            MaintenanceBill,
            DeviceInstallBill
        },
        props: {
            type: { type: String, default: '' },
            title: { type: String, default: '' },
            value: { type: null, default: '' },
            height: { type: String },
            visible: { type: Boolean, default: false },
            // 是否多选
            multiple: { type: Boolean, default: false },
            // 排除项
            excludes: { type: Array, default: () => [] },
            // 最大选择文本
            maxCount: { type: Number, default: Infinity },
            // 超出数量时的提示信息文本
            overageMessage: { type: String },
            // 是否只用于展示
            onlyShow: { type: Boolean, default: false },
            // 展示的数据
            dataList: { type: Array },
            // 扩展参数
            extendParams: { type: Object, default: () => ({}) },
            // 自定义额外的表格列
            extendColumns: { type: Array },
            // 自定义请求函数
            customRequest: { type: Function },
            // 列表配置项
            setTableOptions: { type: Object, default: () => ({}) }
        },
        data() {
            return {
                pickTypes
            }
        },
        computed: {
        },
        methods: {
            handleSubmit() {
                let selectList = this.$refs.PickerComponent.selectList
                var count = selectList.length
                if (!this.value && !count) {
                    this.$message.warning('请至少选中一项')
                } else if (this.multiple && count > this.maxCount) {
                    this.$message.warning(this.overageMessage || `最大可选择数量"${this.maxCount}"，已选择"${count}"，请取消选择部分数据后再试！`)
                } else {
                    this.$emit('update:visible', false)
                    this.$emit('change', selectList)
                }
            }
        }
    }
</script>

<style lang='scss' scoped>

</style>
