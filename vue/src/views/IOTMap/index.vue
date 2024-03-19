<template>
    <div class="map-container">
        <baidu-map
            v-loading="mapConfig.mapLoading"
            :map-style="mapConfig.mapStyle"
            :map-click="true"
            :map-type="mapConfig.mapType"
            :center="mapConfig.center"
            :zoom="mapConfig.zoom"
            :max-zoom="mapConfig.maxZoom"
            :min-zoom="mapConfig.minZoom"
            :scroll-wheel-zoom="true"
            style="height: 100%;width: 100%"
            @click="handleClick"
            @searchcomplete="handleSearchComplete"
            @ready="handleReady"
            @mousemove="handleMousemove"
            @zoomend="getDataByZoom"
        >
            <!-- 右上角全屏按钮 -->
            <FullScreenButton
                :theme-type="themeType"
                :is-in-dialog="isInDialog"
                @update:visible="$emit('close')"
            />
            <!-- 顶部统计 -->
            <DeviceCount
                :number="mapData.allCount"
                :theme-type="themeType"
                :map-config="mapConfig"
            />
            <!-- 控制面板按钮  -->
            <ControlButton
                :value="mapConfig.controlPaneVisible"
                :theme-type="themeType"
                @change="showControlPane"
                @fresh="isReload = new Date()"
            />
            <!-- 右下角图例  -->
            <ColorPane :theme-type="themeType"/>
            <!-- 省级/城市数据点  -->
            <template v-if="mapConfig.mapTile === 1">
                <ProvinceOverLay
                    v-for="(item, index) in mapData.regionData"
                    :key="index"
                    :position="{lng: item.lng, lat: item.lat}"
                    :text="item.name"
                    :count="item.count"
                    :theme-type="themeType"
                    :show-detail="mapConfig.showDetail"
                    @provinceClick="handleProvinceClick($event)"
                />
            </template>
            <!-- 设备数据点 -->
            <template v-if="mapConfig.mapTile !== 2">
                <DeviceOverLay
                    v-for="(item, index) in handleDataOptimization(mapData.deviceData, 500)"
                    :key="index"
                    :position="{lng: item.lng, lat: item.lat}"
                    :text="item.name"
                    :point-data="item"
                    :theme-type="themeType"
                    :map-tile="mapConfig.mapTile"
                    :show-detail="mapConfig.showDetail"
                />
            </template>
            <!-- 散点 -->
            <bml-marker-clusterer
                v-show="mapConfig.mapTile === 2"
                :styles="clustererStyles"
                :min-cluster-size="1"
                :average-center="true">
                <template v-if="mapConfig.mapTile === 2">
                    <bm-marker
                        v-for="(item, index) in handleDataOptimization(mapData.deviceData, 500)"
                        :key="index"
                        :position="{lng: item.lng, lat: item.lat}"
                    />
                </template>
            </bml-marker-clusterer>
        </baidu-map>
        <!-- 控制面板 -->
        <ControlPane
            :visible.sync="mapConfig.controlPaneVisible"
            :map-config="mapConfig"
            :theme-type="themeType"
            :map-search-form="mapSearchForm"
            :region-list="mapData.regionData"
            @mapStyleChange="handleMapStyleChange"
            @mapTileChange="handleMapTileChange"
            @update="handleUpdateMapConfig"
            @save="handleControlSave"
            @reset="handleControlReset"
            @change="getDataByZoom"
        />
    </div>
</template>

<script>
    import { mapStyle_normal, mapStyle_dark } from '@/components/map/mapStyleConfig'
    import DeviceCount from '@/views/IOTMap/components/DeviceCount'
    import ControlPane from '@/views/IOTMap/components/ControlPane'
    import ControlButton from '@/views/IOTMap/components/ControlButton'
    import IOTMapApi from '@/api/IOTMap'
    import ProvinceOverLay from '@/views/IOTMap/components/ProvinceOverLay'
    import DeviceOverLay from '@/views/IOTMap/components/DeviceOverLay'
    import ColorPane from '@/views/IOTMap/components/ColorPane'
    import FullScreenButton from '@/views/IOTMap/components/FullScreenButton'
    import { BmlMarkerClusterer } from '@/components/vue-baidu-map/components'
    import point1 from '@/../static/clustererIcon/point-1.png'
    import point2 from '@/../static/clustererIcon/point-2.png'
    import point3 from '@/../static/clustererIcon/point-3.png'
    import point4 from '@/../static/clustererIcon/point-4.png'
    import point5 from '@/../static/clustererIcon/point-5.png'
    import point6 from '@/../static/clustererIcon/point-6.png'
    import point7 from '@/../static/clustererIcon/point-7.png'
    import point8 from '@/../static/clustererIcon/point-8.png'
    import point9 from '@/../static/clustererIcon/point-9.png'
    import point10 from '@/../static/clustererIcon/point-10.png'
    import point11 from '@/../static/clustererIcon/point-11.png'
    import point12 from '@/../static/clustererIcon/point-12.png'
    const defaultMapConfig = {
        // 全国视图 5-7 / 省级 8-12 / 市级 13
        zoom: 5,
        maxZoom: 18,
        minZoom: 5,
        // 中心
        center: {
            lat: 34.32437549290318,
            lng: 108.98325987482973
        },
        // 中心点地址
        centerAddress: '',
        // 当前鼠标所在点坐标
        activePoint: '',
        // 地图加载
        mapLoading: true,
        // 地图样式
        mapStyle: mapStyle_normal,
        // 地图类型
        mapTypeId: 1,
        mapType: 'BMAP_NORMAL_MAP',
        // 图层显示方式
        mapTile: 1,
        // 显示概要
        showDetail: false,
        // 显示控制面板
        controlPaneVisible: false
    }
    const defaultMapSearchForm = {
        sectionSalesType: null,
        sonMapIds: [],
        customerIds: [],
        projectIds: []
    }
    export default {
        name: 'IOTMap',
        components: { BmlMarkerClusterer, FullScreenButton, ColorPane, ProvinceOverLay, ControlButton, ControlPane, DeviceCount, DeviceOverLay },
        props: {
            // 判断本页面是不是全屏窗口打开的
            isInDialog: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                // 地图主题类型
                themeType: 0,
                mapStyle_normal,
                mapStyle_dark,
                // 地图配置项
                mapConfig: Object.assign({}, defaultMapConfig),
                // 地图控制面板的过滤表单
                mapSearchForm: JSON.parse(JSON.stringify(defaultMapSearchForm)),
                // 地图数据源
                mapData: {
                    allCount: 0,
                    regionData: [],
                    deviceData: []
                },
                // 地图组件刷新标志
                isReload: new Date(),
                // 地图对象
                BMap: null,
                map: null,
                // 缓存 省级聚合时 数据获取类型 (0表示全国数据 1省级 2市级)通过该字段变化来判断是否清空地图上的点
                showType: 0,
                // 缓存 图层显示方式 通过该字段变化来判断是否清空地图上的点
                originMapTile: 1,
                // 散点聚合样式
                clustererStyles: [
                    { url: point1, size: { width: 32, height: 32 }},
                    { url: point2, size: { width: 42, height: 42 }},
                    { url: point3, size: { width: 56, height: 56 }},
                    { url: point4, size: { width: 64, height: 64 }},
                    { url: point5, size: { width: 72, height: 72 }},
                    { url: point6, size: { width: 84, height: 84 }},
                    { url: point7, size: { width: 96, height: 96 }},
                    { url: point8, size: { width: 108, height: 108 }},
                    { url: point9, size: { width: 128, height: 128 }},
                    { url: point10, size: { width: 156, height: 156 }},
                    { url: point11, size: { width: 172, height: 172 }},
                    { url: point12, size: { width: 198, height: 198 }}
                ],
                // 边界绘制配置项
                boundaryConfig: {
                    normal: {
                        country: {
                            strokeColor: '#29DFEE',
                            strokeWeight: 4,
                            strokeOpacity: 1,
                            strokeStyle: 'solid',
                            fillColor: '',
                            fillOpacity: 0
                        },
                        province: {
                            strokeColor: '#29DFEE',
                            strokeWeight: 4,
                            strokeOpacity: 1,
                            strokeStyle: 'solid',
                            fillColor: '',
                            fillOpacity: 0
                        },
                        city: {
                            strokeColor: '#29DFEE',
                            strokeWeight: 4,
                            strokeOpacity: 1,
                            strokeStyle: 'solid',
                            fillColor: '',
                            fillOpacity: 0
                        }
                    },
                    dark: {}
                }
            }
        },
        computed: {
            getBoundaryStyle() {
                if (this.mapConfig.mapType === 'BMAP_HYBRID_MAP') {
                    // 本来应该返回dark 但是目前没有配置dark的独立样式 所以暂时返回normal
                    return this.boundaryConfig.normal
                } else return this.boundaryConfig.normal
            }
        },
        watch: {
            // 监听地图显示类型,更新地图主题
            'mapConfig.mapTypeId': {
                deep: true,
                immediate: true,
                handler(val) {
                    // 地图主题 0:简白 1:深黑
                    this.themeType = (this.mapConfig.mapTypeId === 2) ? 1 : 0
                }
            }
        },
        mounted() {},
        methods: {
            // 地图加载
            handleReady({ BMap, map }) {
                let that = this
                that.map = map
                that.BMap = BMap
                that.mapConfig.mapLoading = false
                // 设置默认主题
                map.setMapStyleV2(that.mapConfig.mapStyle)
                // 读取用户个性化数据
                that.getUserConfig()
            },
            // 显示控制面板
            showControlPane() {
                this.mapConfig.controlPaneVisible = !this.mapConfig.controlPaneVisible
            },
            // 获取鼠标所在点的坐标
            handleMousemove(e) {
                this.mapConfig.activePoint = e.point
            },
            // 获取用户画像
            getUserConfig() {
                // json 转 对象
                IOTMapApi.getUserMapConfig().then(res => {
                    console.log('res', res)
                    if (res.success) {
                        const json = res.data.jsonData
                        const data = JSON.parse(json)
                        if (data) {
                            if (data.mapSearchForm) this.mapSearchForm = Object.assign({}, this.mapSearchForm, data.mapSearchForm)
                            if (data.mapConfig) this.mapConfig = Object.assign({}, this.mapConfig, data.mapConfig)
                            // 设置默认主题
                            this.handleMapStyleChange({ mapStyle: this.mapConfig.mapStyle })
                            // 设置缩放级别
                            this.map.setCenter(this.mapConfig.center)
                            this.map.setZoom(this.mapConfig.zoom)
                            this.mapConfig.activePoint = this.mapConfig.center
                            // 这里必须清空中心点的地址字段,不然getLocation函数会认为中心点没有变化,不会进行加载
                            this.mapConfig.centerAddress = ''
                            this.$message.success('成功读取用户自定义配置')
                        }
                    }
                    // 加载数据
                    this.getDataByZoom()
                })
            },
            // zoom变化时切换地图类型
            getDataByZoom() {
                if (this.map) {
                    this.mapConfig.mapLoading = true
                    // 图层显示类型是否变化
                    if (this.originMapTile !== this.mapConfig.mapTile) {
                        this.map.clearOverlays()
                        this.map.setZoom(5)
                        this.mapData = {
                            allCount: 0,
                            regionData: [],
                            deviceData: []
                        }
                    }
                    // 缓存图层显示类型
                    this.originMapTile = this.mapConfig.mapTile
                    // 判断图层显示类型
                    if (this.mapConfig.mapTile === 1) {
                        // 根据zoom判断当前调用哪个接口
                        this.mapConfig.zoom = this.map.getZoom()
                        let showType = 0
                        if (this.mapConfig.zoom <= 7) {
                            showType = 1
                        } else if (this.mapConfig.zoom <= 10) {
                            showType = 2
                        } else {
                            showType = 3
                        }
                        // 通过showType字段是否变化来判断是否重置地址标记
                        if (this.showType !== showType) {
                            this.map.clearOverlays()
                        }
                        // 更新地图中心点
                        if (showType === 1) {
                            this.showType = 1
                            this.getProvinceInCountry()
                        } else if (showType === 2) {
                            this.showType = 2
                            this.getCityInProvince()
                        } else {
                            this.showType = 3
                            this.getDeviceListInCity()
                        }
                    } else if (this.mapConfig.mapTile === 2) {
                        // 绘制散点
                        this.setBmlMarkerClusterer()
                    } else {
                        // 绘制海量点
                        this.setBmPointCollection()
                    }
                }
            },
            // 清除所有标记物
            clearAllLays() {
                this.map.clearOverlays()
            },
            // 绘制散点
            async setBmlMarkerClusterer() {
                // 散点
                const params = { ...this.mapSearchForm, level: 'country' }
                const res = await IOTMapApi.getDeviceList(params)
                if (res.success) {
                    this.mapData.allCount = res.data.allCount
                    this.mapData.deviceData = res.data.deviceData
                }
                this.mapConfig.mapLoading = false
            },
            // 绘制海量点
            async setBmPointCollection() {
                // 散点
                const params = { ...this.mapSearchForm, level: 'country' }
                const res = await IOTMapApi.getDeviceList(params)
                if (res.success) {
                    this.mapData.allCount = res.data.allCount
                    this.mapData.deviceData = res.data.deviceData
                }
                this.mapConfig.mapLoading = false
            },
            // 获取中心点所在省
            async getLocation({ lng, lat }) {
                const this_ = this
                const Geo = new BMap.Geocoder()
                const point = new BMap.Point(lng, lat)
                await Geo.getLocation(point, function(rs) {
                    const addComp = rs.addressComponents
                    console.log('当前中心点: ' + addComp.province)
                    if (this_.mapConfig.centerAddress !== addComp.province) {
                        // 中心点改变清空所有点
                        this_.clearAllLays()
                        this_.mapConfig.centerAddress = addComp.province
                        console.log('绘制' + addComp.province + '的边界')
                        // 绘制省的边界
                        this_.getBoundary(addComp.province, this_, this_.getBoundaryStyle.province)
                        // 根据省名获取省的mapId 去除省名称里的省和市两个字
                        const regionName = this_.mapConfig.centerAddress.replace(/省|市/, '')
                        IOTMapApi.getMapId({ level: 'province', name: regionName }).then(res__ => {
                            if (res__.success && res__.data) {
                                const mapId = res__.data
                                // 获取到中心点的所在省后发送查询
                                const params = { ...this_.mapSearchForm, mapId: mapId, level: 'province' }
                                IOTMapApi.getProvinceList(params).then(res => {
                                    this_.mapData = res.data
                                    this_.mapConfig.mapLoading = false
                                })
                            } else this_.mapConfig.mapLoading = false
                        })
                    } else this_.mapConfig.mapLoading = false
                })
            },
            // 获取中心点所在市
            async getLocationCity({ lng, lat }) {
                const this_ = this
                const Geo = new BMap.Geocoder()
                const point = new BMap.Point(lng, lat)
                await Geo.getLocation(point, function(rs) {
                    const addComp = rs.addressComponents
                    if (this_.mapConfig.centerAddress !== addComp.city) {
                        // 中心点改变清空所有点
                        this_.clearAllLays()
                        this_.mapConfig.centerAddress = addComp.city
                        // 绘制市的边界
                        console.log('绘制' + addComp.city + '的边界')
                        this_.getBoundary(addComp.city, this_, this_.getBoundaryStyle.city)
                        // 根据省名获取省的mapId 去除省名称里的省和市两个字
                        const regionName = this_.mapConfig.centerAddress.replace(/省|市/, '')
                        IOTMapApi.getMapId({ level: 'city', name: regionName }).then(res__ => {
                            if (res__.success && res__.data) {
                                const mapId = res__.data
                                // 获取到中心点的所在省后发送查询
                                const params = { ...this_.mapSearchForm, mapId: mapId, level: 'city' }
                                IOTMapApi.getDeviceList(params).then(res => {
                                    this_.mapData = res.data
                                    this_.mapConfig.mapLoading = false
                                })
                            } else this_.mapConfig.mapLoading = false
                        })
                    } else this_.mapConfig.mapLoading = false
                })
            },
            // 获取全国视图时的省级列表
            async getProvinceInCountry() {
                // 重置中心点
                this.mapConfig.centerAddress = ''
                const params = { ...this.mapSearchForm, mapId: '', level: 'country' }
                const res = await IOTMapApi.getProvinceList(params)
                this.mapData = res.data
                this.mapConfig.mapLoading = false
            },
            getCityInProvince() {
                // 根据中心点,判断当前在哪个省
                this.getLocation(this.mapConfig.activePoint)
            },
            getDeviceListInCity() {
                // 根据中心点,判断当前在哪个省
                this.getLocationCity(this.mapConfig.activePoint)
            },
            async getBoundary(name, _this, config) {
                const bdary = new BMap.Boundary()
                await bdary.get(name, function(rs) {
                    const dbxList = rs.boundaries
                    dbxList.map(dbx => {
                        const bounder = _this.getOptimizationBounder(dbx)
                        const ply = new BMap.Polygon(bounder, config)
                        _this.map.addOverlay(ply)
                    })
                })
            },
            // 将多边形的坐标点进行处理
            getOptimizationBounder(bounder) {
                // 边界点挑选倍率
                const PICK_MAGNIFICATION = 50
                const bounderArr = bounder.split(';')
                // 如果总数量低于100个则不绘制
                if (bounderArr.length < 100) return ''
                // 如果总数量低于500个则不过滤
                if (bounderArr.length < 500) return bounder
                // 等距筛选点位
                const minBounder = bounderArr.filter((point, index) => !(index % PICK_MAGNIFICATION))
                return minBounder.join(';')
            },
            handleClick(e) {},
            handleSearchComplete() {},
            handleControlReset() {
                // 重置
                this.mapConfig = Object.assign({}, defaultMapConfig)
                this.mapSearchForm = JSON.parse(JSON.stringify(defaultMapSearchForm))
                // 重置地图主题
                this.map.setMapStyleV2(this.mapConfig.mapStyle)
                // 重新加载数据
                this.getDataByZoom()
            },
            handleControlSave({ mapSearchForm, mapConfig }) {
                // 保存缩放级别和中心点
                // 保存用户画像
                const jsonData = JSON.stringify({
                    mapSearchForm: { ...mapSearchForm },
                    mapConfig: { ...mapConfig, zoom: this.map.getZoom(), center: this.map.getCenter() }
                })
                IOTMapApi.updateUserMapConfig({ jsonData }).then(res => {
                    if (res.success) {
                        this.$message.success('用户配置保存成功')
                    } else this.$message.error('用户配置保存失败')
                })
            },
            // 地图样式改变
            handleMapStyleChange(item) {
                if (item.mapStyle) {
                    this.mapConfig.mapStyle = item.mapStyle
                    this.map.setMapStyleV2(item.mapStyle)
                } else {
                    // this.mapConfig.mapStyle = {}
                    this.mapConfig.mapType = item.mapType
                    this.mapConfig.mapTypeId = item.id
                }
                const loading = this.$loading({
                    lock: true,
                    text: '加载中',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                })
                setTimeout(() => {
                    loading.close()
                }, 1000)
            },
            // 图层显示方式改变
            handleMapTileChange(value) {
                // this.mapConfig.mapTile = value
                this.getDataByZoom()
            },
            // 控制面板数据刷新
            handleUpdateMapConfig(config) {
                this.mapConfig = Object.assign({}, config)
            },
            // 覆盖物被点击
            handleProvinceClick(item) {
                // 根据当前zoom判断现在是省级进入市级,还是市级进入市内列表
                const cZoom = this.map.getZoom()
                if (cZoom <= 7) {
                    this.map.setZoom(8)
                } else if (cZoom <= 10) {
                    this.map.setZoom(11)
                }
                this.mapConfig.activePoint = item.position
                this.mapConfig.center = item.position
                this.getDataByZoom()
            },
            // 散点和海量点数据优化, 返回num个样点
            handleDataOptimization(data, num) {
                data = data || []
                if (num > data.length) {
                    return
                }
                const tempArr = data.slice(0)
                const newArrList = []
                for (let i = 0; i < num; i++) {
                    const random = Math.floor(Math.random() * (tempArr.length - 1))
                    const arr = tempArr[random]
                    tempArr.splice(random, 1)
                    newArrList.push(arr)
                }
                return newArrList
            }
        }
    }
</script>

<style scoped lang="scss">
.map-container {
  height:100%;margin:0px;padding:0px
}

</style>
