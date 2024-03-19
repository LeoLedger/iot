// 列表项
import smart_1 from '@/views/inventoryManagement/intelligentDevice/tableColumns/smart_1'
import smart_2 from '@/views/inventoryManagement/intelligentDevice/tableColumns/smart_2'
import smart_3 from '@/views/inventoryManagement/intelligentDevice/tableColumns/smart_3'
import smart_4 from '@/views/inventoryManagement/intelligentDevice/tableColumns/smart_4'
import smart_5 from '@/views/inventoryManagement/intelligentDevice/tableColumns/smart_5'
import smart_6 from '@/views/inventoryManagement/intelligentDevice/tableColumns/smart_6'
import other_1 from '@/views/inventoryManagement/otherProducts/tableColumns/other_1'
import other_2 from '@/views/inventoryManagement/otherProducts/tableColumns/other_2'
import sim_1 from '@/views/inventoryManagement/SIM/tableColumns/sim_1'
import sim_2 from '@/views/inventoryManagement/SIM/tableColumns/sim_2'
import sim_3 from '@/views/inventoryManagement/SIM/tableColumns/sim_3'
// 过滤项
import FilterSmart from '@/views/inventoryManagement/intelligentDevice/filter/index_1'
import FilterOther from '@/views/inventoryManagement/otherProducts/filter/index_1'
import FilterSim from '@/views/inventoryManagement/SIM/filter/index_1'
// 弹框过滤项
import pop_smart_1 from '@/views/inventoryManagement/intelligentDevice/filterPopup/smart_1'
import pop_smart_2 from '@/views/inventoryManagement/intelligentDevice/filterPopup/smart_2'
import pop_smart_3 from '@/views/inventoryManagement/intelligentDevice/filterPopup/smart_3'
import pop_smart_4 from '@/views/inventoryManagement/intelligentDevice/filterPopup/smart_4'
import pop_smart_5 from '@/views/inventoryManagement/intelligentDevice/filterPopup/smart_5'
import pop_smart_6 from '@/views/inventoryManagement/intelligentDevice/filterPopup/smart_6'
import pop_other_1 from '@/views/inventoryManagement/otherProducts/filterPopup/other_1'
import pop_other_2 from '@/views/inventoryManagement/otherProducts/filterPopup/other_2'
import pop_sim_1 from '@/views/inventoryManagement/SIM/filterPopup/sim_1'
import pop_sim_2 from '@/views/inventoryManagement/SIM/filterPopup/sim_2'
// API
import warehousesApi from '@/api/inventory/warehouses'
// 其他组件
import NoData from '@/components/NoData'
import deviceApi from '@/api/inventory/device'
export default {
    components: {
        NoData,
        FilterSmart,
        FilterOther,
        FilterSim,
        pop_smart_1: pop_smart_1,
        pop_smart_2: pop_smart_2,
        pop_smart_3: pop_smart_3,
        pop_smart_4: pop_smart_4,
        pop_smart_5: pop_smart_5,
        pop_smart_6: pop_smart_6,
        pop_other_1: pop_other_1,
        pop_other_2: pop_other_2,
        pop_sim_1: pop_sim_1,
        pop_sim_2: pop_sim_2
    },
    // 共有参数
    props: {},
    //
    data() {
        return {
            // 产品类型 1: 智能 2: 其他  3:SIM卡
            productType: 'B16C3151-11D2-4364-8F45-63EFFFFCF424',
            // 当前仓位类型
            currentSpaceType: 1,
            // 根据仓位定义不同的操作按钮
            warehousesSpaceButton: {
                'B16C3151-11D2-4364-8F45-63EFFFFCF424_1': { name: '全新设备', buttonLabel: '入库', buttonType: 'success', buttonIcon: 'el-icon-plus',
                                                            accessKey: 'ty.iot.approval.storagePut.create',
                                                            buttonAction: (val) => this.handleButtonClick(1, val) },
                'B16C3151-11D2-4364-8F45-63EFFFFCF424_2': { name: '旧设备', buttonLabel: '报损', buttonType: 'danger', buttonIcon: 'el-icon-plus',
                                                            accessKey: 'ty.iot.approval.deviceDamaged.create',
                                                            buttonAction: (val) => this.handleButtonClick(2, val) },
                'B16C3151-11D2-4364-8F45-63EFFFFCF424_3': { name: '备用设备', buttonLabel: '分配', buttonType: 'primary', buttonIcon: 'el-icon-plus',
                                                            accessKey: 'ty.iot.intelligentDevice.distribution',
                                                            buttonAction: (val) => this.handleButtonClick(3, val) },
                'B16C3151-11D2-4364-8F45-63EFFFFCF424_4': { name: '在运营设备', buttonLabel: false },
                'B16C3151-11D2-4364-8F45-63EFFFFCF424_5': { name: '寄存设备', buttonLabel: false },
                'B16C3151-11D2-4364-8F45-63EFFFFCF424_6': { name: '报损设备', buttonLabel: '挂起', buttonType: 'danger', buttonIcon: 'el-icon-minus',
                                                            accessKey: 'ty.iot.intelligentDevice.distribution',
                                                            buttonAction: (val) => this.handleButtonClick(4, val) },
                'FBB2B7F6-CD9A-48CA-8300-C72D34BC3100_1': { name: '全新库存', buttonLabel: '入库', buttonType: 'success', buttonIcon: 'el-icon-plus',
                                                            accessKey: 'ty.iot.approval.storagePut.create',
                                                            buttonAction: (val) => this.handleButtonClick(1, val) },
                'FBB2B7F6-CD9A-48CA-8300-C72D34BC3100_2': { name: '已出库', buttonLabel: false },
                'BBB76246-2925-43D8-B81D-D5FF74F1D1D7_1': { name: '全新库存', buttonLabel: '入库', buttonType: 'success', buttonIcon: 'el-icon-plus',
                                                            accessKey: 'ty.iot.approval.storagePut.create',
                                                            buttonAction: (val) => this.handleButtonClick(1, val) },
                'BBB76246-2925-43D8-B81D-D5FF74F1D1D7_2': { name: '已出库', buttonLabel: '入库', buttonType: 'success', buttonIcon: 'el-icon-plus',
                                                            accessKey: 'ty.iot.approval.storagePut.create',
                                                            buttonAction: (val) => this.handleButtonClick(1, val) },
                'BBB76246-2925-43D8-B81D-D5FF74F1D1D7_3': { name: '已报废', buttonLabel: false }
            },
            // 根据仓位定义不同的列表项
            warehousesSpaceTableColumns: {
                'B16C3151-11D2-4364-8F45-63EFFFFCF424_1': smart_1.columns,
                'B16C3151-11D2-4364-8F45-63EFFFFCF424_2': smart_2.columns,
                'B16C3151-11D2-4364-8F45-63EFFFFCF424_3': smart_3.columns,
                'B16C3151-11D2-4364-8F45-63EFFFFCF424_4': smart_4.columns,
                'B16C3151-11D2-4364-8F45-63EFFFFCF424_5': smart_5.columns,
                'B16C3151-11D2-4364-8F45-63EFFFFCF424_6': smart_6.columns,
                'FBB2B7F6-CD9A-48CA-8300-C72D34BC3100_1': other_1.columns,
                'FBB2B7F6-CD9A-48CA-8300-C72D34BC3100_2': other_2.columns,
                'BBB76246-2925-43D8-B81D-D5FF74F1D1D7_1': sim_1.columns,
                'BBB76246-2925-43D8-B81D-D5FF74F1D1D7_2': sim_2.columns,
                'BBB76246-2925-43D8-B81D-D5FF74F1D1D7_3': sim_3.columns
            },
            // 根据仓位定义不同的筛选器
            warehousesSpaceFilterPopup: {
                'B16C3151-11D2-4364-8F45-63EFFFFCF424_1': 'pop_smart_1',
                'B16C3151-11D2-4364-8F45-63EFFFFCF424_2': 'pop_smart_2',
                'B16C3151-11D2-4364-8F45-63EFFFFCF424_3': 'pop_smart_3',
                'B16C3151-11D2-4364-8F45-63EFFFFCF424_4': 'pop_smart_4',
                'B16C3151-11D2-4364-8F45-63EFFFFCF424_5': 'pop_smart_5',
                'B16C3151-11D2-4364-8F45-63EFFFFCF424_6': 'pop_smart_6',
                'FBB2B7F6-CD9A-48CA-8300-C72D34BC3100_1': 'pop_other_1',
                'FBB2B7F6-CD9A-48CA-8300-C72D34BC3100_2': 'pop_other_2',
                'BBB76246-2925-43D8-B81D-D5FF74F1D1D7_1': 'pop_sim_1',
                'BBB76246-2925-43D8-B81D-D5FF74F1D1D7_2': 'pop_sim_2',
                'BBB76246-2925-43D8-B81D-D5FF74F1D1D7_3': 'pop_sim_2'
            },
            searchParamsLock: {
                warehousesId: null, // 仓库guid
                warehousesSpaceId: null // 仓位guid
            },
            // 备用设备分配窗口
            backupDialog: {
                visible: false,
                rowData: {}
            },
            // 仓库窗口
            groupDialog: {
                visible: false,
                dataId: null,
                type: 'create' // 'edit' or 'detail'
            },
            // 入库窗口
            putInDialog: {
                visible: false
            },
            // 报损窗口
            damagedDialog: {
                visible: false
            },
            // 挂起窗口
            setOffDialog: {
                visible: false
            },
            // 产品类型
            productTypeList: [],
            productTypeRemoteMethod: deviceApi.getDictList
        }
    },
    computed: {
        btnOption() {
            const key = this.productType + '_' + this.currentSpaceType
            return this.warehousesSpaceButton[key] || null
        },
        // space device key 区分不同仓位的设备列表的key
        sdk() {
            return this.productType + '_' + this.currentSpaceType
        }
    },
    watch: {},
    mounted() {

    },
    methods: {
        // 左侧 - 新建仓库
        handleGroupAdd() {
            this.groupDialog = {
                visible: true,
                dataId: null,
                type: 'create'
            }
        },
        // 左侧 - 编辑仓库
        handleGroupEdit(item) {
            this.groupDialog = {
                visible: true,
                dataId: item.guidId,
                type: 'edit'
            }
        },
        // 左侧 - 仓库详情
        handleGroupDetail(item) {
            this.groupDialog = {
                visible: true,
                dataId: item.guidId,
                productCategory: this.productType,
                type: 'detail'
            }
        },

        // 左侧 - 删除组
        handleGroupDelete(row, funcName) {
            this.$confirm('是否确认删除?', '警告', {
                confirmButtonText: '删除',
                cancelButtonText: '取消',
                type: 'warning',
                center: true
            }).then(() => {
                warehousesApi.delete(row.guidId).then(res => {
                    if (res.success) {
                        this.$message({ type: 'success', message: '删除成功' })
                        funcName()
                    }
                })
            }).catch(() => {})
        },
        // 处理按钮点击事件
        handleButtonClick(type, searchParam) {
            switch (type) {
            case 1:
                // 入库
                this.putInDialog.visible = true
                break
            case 2:
                // 报损
                this.damagedDialog.visible = true
                break
            case 3:
                // 分配
                this.backupDialog.rowData.warehousesId = searchParam.warehousesId || null
                this.backupDialog.rowData.warehousesSpaceId = searchParam.warehousesSpaceId || null
                console.log('searchParam', searchParam)
                this.backupDialog.visible = true
                break
            case 4:
                // 挂起
                this.setOffDialog.visible = true
                break
            default:
                break
            }
        },
        // 处理详情点击事件
        handleDetailClick({ row, column }) {
            console.log('data', { row, column })
        }
    }
}
