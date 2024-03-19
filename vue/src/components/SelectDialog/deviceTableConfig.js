// 方法
import enums from '@/utils/enum'
// 表格配置
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
import pop_sim_3 from '@/views/inventoryManagement/SIM/filterPopup/sim_1'

export default {
    mixin: {
        components: {
            FilterSmart,
            FilterOther,
            FilterSim,
            pop_smart_1,
            pop_smart_2,
            pop_smart_3,
            pop_smart_4,
            pop_smart_5,
            pop_smart_6,
            pop_other_1,
            pop_other_2,
            pop_sim_1,
            pop_sim_2,
            pop_sim_3
        },
        methods: {
            // 根据typeId获取表格配置项
            getTableConfig(typeId) {
                let warehousesSpace
                let warehouses = [
                    'warehousesSpaceTypeSmart',
                    'warehousesSpaceTypeOther',
                    'warehousesSpaceTypeSim'
                ].find(key => {
                    // 找到该typeId属于哪个产品类型仓库
                    let data = enums[key].find(item => item.guidId === typeId)
                    if (data) {
                        warehousesSpace = data.label
                        return true
                    }
                })
                // 如果没有找到仓库，从筛选参数对象上获取
                if (!warehouses) {
                    warehouses = this.publicParam.warehouses || false
                }
                // 如果没有找到仓位，默认全新仓库
                warehousesSpace = warehousesSpace || '全新'

                if (warehouses && warehousesSpace) {
                    switch (warehouses) {
                    // 智能设备
                    case 'warehousesSpaceTypeSmart':
                        switch (warehousesSpace) {
                        case '全新':
                            return {
                                columns: smart_1.columns,
                                filterItem: 'FilterSmart',
                                filterPopup: 'pop_smart_1'
                            }
                        case '旧设备':
                            return {
                                columns: smart_2.columns,
                                filterItem: 'FilterSmart',
                                filterPopup: 'pop_smart_2'
                            }
                        case '备用':
                            return {
                                columns: smart_3.columns,
                                filterItem: 'FilterSmart',
                                filterPopup: 'pop_smart_3'
                            }
                        case '在运营':
                            return {
                                columns: smart_4.columns,
                                filterItem: 'FilterSmart',
                                filterPopup: 'pop_smart_4'
                            }
                        case '寄存':
                            return {
                                columns: smart_5.columns,
                                filterItem: 'FilterSmart',
                                filterPopup: 'pop_smart_5'
                            }
                        case '报损':
                            return {
                                columns: smart_6.columns,
                                filterItem: 'FilterSmart',
                                filterPopup: 'pop_smart_6'
                            }
                        }
                        break
                    // 非智能设备
                    case 'warehousesSpaceTypeOther':
                        switch (warehousesSpace) {
                        case '全新':
                            return {
                                columns: other_1.columns,
                                filterItem: 'FilterOther',
                                filterPopup: 'pop_other_1'
                            }
                        case '已出库':
                            return {
                                columns: other_2.columns,
                                filterItem: 'FilterOther',
                                filterPopup: 'pop_other_2'
                            }
                        }
                        break
                    // SIM卡
                    case 'warehousesSpaceTypeSim':
                        switch (warehousesSpace) {
                        case '全新':
                            return {
                                columns: sim_1.columns,
                                filterItem: 'FilterSim',
                                filterPopup: 'pop_sim_1'
                            }
                        case '已出库':
                            return {
                                columns: sim_2.columns,
                                filterItem: 'FilterSim',
                                filterPopup: 'pop_sim_2'
                            }
                        case '已报废':
                            return {
                                columns: sim_3.columns,
                                filterItem: 'FilterSim',
                                filterPopup: 'pop_sim_3'
                            }
                        case '备用':
                            return {}
                        }
                        break
                    }
                }
            }
        }
    }
}
