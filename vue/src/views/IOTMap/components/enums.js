import { mapStyle_dark, mapStyle_normal } from '@/components/map/mapStyleConfig'

export default {
    mapTypeOptions: [
        { id: 1, mapType: 'BMAP_NORMAL_MAP', label: '矢量地图', mapStyle: mapStyle_normal, icon: 'el-icon-position' },
        { id: 2, mapType: 'BMAP_NORMAL_MAP', label: '个性地图', mapStyle: mapStyle_dark, icon: 'el-icon-map-location' },
        { id: 3, mapType: 'BMAP_HYBRID_MAP', label: '卫星地图', mapStyle: null, icon: 'el-icon-basketball' }
    ],
    mapTileOptions: [
        { value: 1, label: '聚合+图标' },
        { value: 2, label: '散点' },
        { value: 3, label: '海量点' }
    ],
    salesType: [
        { value: 0, label: '销售' },
        { value: 1, label: '租赁' }
    ],
    productTypeList: [
        { value: '95E968C3-D1BE-4A6C-93A8-6AF62558B909', label: '车载设备' },
        { value: '288F8C2D-9CEB-46FC-87C9-DC4C16108162', label: '人员设备' }
    ]
}
