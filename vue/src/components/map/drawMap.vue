<!--
* @description
* @fileName drawMap.vue
* @author 李扬
* @date 2019/05/15 19:59:13
* @version V1.0.0
!-->
<template>
    <div class="mapDevice">
        <el-dialog
            :visible.sync="editAddAddress"
            :before-close="closeMapDialog"
            :close-on-click-modal="false"
            :fullscreen="true"
            :title="mapTitle"
            class="drawMap_dialog"
            append-to-body
        >
            <baidu-map
                :map-style="mapStyle"
                :map-click="false"
                :center="center"
                :zoom="15"
                :scroll-wheel-zoom="true"
                :style="{height}"
                @click="getClickInfo"
                @searchcomplete="handleSearchComplete"
            >
                <map-auto-complete :is-show="!isDetail"/>
                <template v-if="markerPoint.lng != null">
                    <!-- 判断是否为自定义标点 -->
                    <MapLabelPoint
                        v-if="markerPoint.isCustomizePoint"
                        :form-data="markerPoint"
                        @searchcomplete="handleSearchComplete"/>
                    <bm-marker
                        v-else
                        :position="markerPoint"
                        @searchcomplete="handleSearchComplete"
                    />
                </template>
                <!-- 额外 打点数据遍历 （目前仅保证 支持方正的 icon） -->
                <template v-if="extendsPoints.length">
                    <MapLabelPoint
                        v-for="(item, idx) of extendsPoints"
                        :key="idx"
                        :form-data="item"/>
                </template>
                <bm-map-type v-if="showMapTypes" :map-types="['BMAP_NORMAL_MAP', 'BMAP_HYBRID_MAP']" :offset="{ width: 100, height: 10}" anchor="BMAP_ANCHOR_TOP_RIGHT"/>
                <bm-navigation anchor="BMAP_ANCHOR_TOP_RIGHT"/>
                <!-- 区域 -->
                <template v-if="polygonData.polygons">
                    <bm-polygon
                        v-for="(poly, idx) in polygonData.polygons"
                        :key="idx"
                        :path="poly"
                        :stroke-opacity="comPolygon.strokeOpacity"
                        :fill-opacity="comPolygon.fillOpacity"
                        :stroke-weight="comPolygon.strokeWeight"
                        :stroke-color="comPolygon.strokeColor"
                        :fill-color="comPolygon.fillColor"/>
                </template>
            </baidu-map>
            <span v-if="!isDetail" slot="footer">
                <el-button size="mini" @click="closeMapDialog">取 消</el-button>
                <el-button type="primary" size="mini" @click="closeNewMapDialog">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import MapAutoComplete from '@/components/map/MapAutoComplete'
    import MapLabelPoint from '@/components/map/MapLabelPoint'
    import { mapStyle_noPointsOfInterest } from '@/components/map/mapStyleConfig'
    export default {
        components: {
            MapAutoComplete,
            MapLabelPoint
        },
        props: {
            editAddAddress: {
                type: Boolean
            },
            showMapTypes: {
                type: Boolean,
                default: true
            },
            isDetail: {
                type: Boolean,
                default: false
            },
            center: {
                type: [String, Object],
                default: '深圳'
            },
            detailAddress: {
                type: String
            },
            mapTitle: {
                type: String,
                default: '选择位置'
            },
            point: {
                type: Object,
                default: () => {
                    return {
                        lng: null,
                        lat: null
                    }
                }
            },
            extendsPoints: {
                type: Array,
                default: () => []
            /* return [ {
              lng: null,
              lat: null,
              text: '展示的label',
              imgUrl: '展示ion的url'
          } ]*/
            },
            // 用于展示 区域块的 数据 参考 computed comPolygon 相关数据
            polygonData: {
                type: Object,
                default: () => ({})
            }
        },
        data() {
            return {
                markerPoint: {
                    lng: 0,
                    lat: 0
                },
                location: null,
                height: null,
                mapStyle: mapStyle_noPointsOfInterest
            }
        },
        computed: {
            comPolygon() {
                return {
                    polygon: [[]],
                    strokeOpacity: 1,
                    fillOpacity: 0.2,
                    strokeWeight: 2,
                    strokeColor: '#11a6e8',
                    fillColor: '#11a6e8',
                    // strokeColor: '#e49b3b',
                    // fillColor: '#f8d09c',
                    ...this.polygonData
                }
            }
        },
        created() {
            this.windowWidth()
            if (this.point && this.point.lat) {
                this.markerPoint = Object.assign({}, this.point)
            }
            if (this.detailAddress) {
                this.location = this.detailAddress.trim()
            }
        },
        methods: {
            closeMapDialog() {
                this.$emit('closeEditMap1')
            },
            handleSearchComplete(res) {
                this.path = res
                    .getPlan(0)
                    .getRoute(0)
                    .getPath()
            },
            closeNewMapDialog() {
                if (!this.location) {
                    this.$message({
                        message: '请先标注所在区域',
                        type: 'error'
                    })
                    return
                }
                this.$emit('closeEditMap2', [this.markerPoint, this.location])
            },
            windowWidth() {
                const h = this.isDetail ? 44 : 104
                this.height = document.body.clientHeight - h + 'px'
            },
            // 标点
            getClickInfo(e) {
                if (this.isDetail) {
                    return
                }
                this.markerPoint.lng = e.point.lng
                this.markerPoint.lat = e.point.lat
                this.getCity()
            },
            // 获取地理位置
            getCity() {
                const _this = this
                const myGeo = new BMap.Geocoder()
                myGeo.getLocation(
                    new BMap.Point(_this.markerPoint.lng, _this.markerPoint.lat),
                    data => {
                        if (data.addressComponents) {
                            const result = data.addressComponents
                            const location = {
                                creditProvince: result.province || '', // 省
                                creditCity: result.city || '', // 市
                                creditArea: result.district || '', // 区
                                creditStreet: (result.street || '') + (result.streetNumber || '') // 街道
                            }
                            _this.location =
                                location.creditProvince +
                                location.creditCity +
                                location.creditArea +
                                location.creditStreet
                        }
                    }
                )
            }
        }
    }
</script>

<style lang='scss'>
.drawMap_dialog {
  .el-dialog.is-fullscreen {
    margin-top: 0 !important;
  }
  .el-dialog__body {
    padding: 0;
  }
}
</style>
