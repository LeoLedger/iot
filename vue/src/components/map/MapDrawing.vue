<template>
    <bm-control>
        <bm-map-type v-if="showSwitchMapType" :map-types="['BMAP_NORMAL_MAP', 'BMAP_HYBRID_MAP']" :offset="mapTypeOffset" anchor="BMAP_ANCHOR_TOP_RIGHT"/>
        <bm-navigation
            :offset="{width: 10,height: 20}"
            anchor="BMAP_ANCHOR_BOTTOM_RIGHT"
            type="BMAP_NAVIGATION_CONTROL_ZOOM"
        />
        <bm-control
            v-if="isShow && isEditing"
            :offset="offset"
            :anchor="anchor"
            @ready="mapReady"
        >
            <el-button
                v-if="type.indexOf(1) > -1"
                :class="{ active: activeIndex == 1 }"
                size="mini"
                plain
                type="primary"
                @click="drawingPoint"
            ><i class="el-icon-location-outline" /> 标点</el-button>
            <el-button
                v-if="type.indexOf(2) > -1"
                :class="{ active: activeIndex == 2 }"
                size="mini"
                plain
                type="primary"
                @click="drawingLine"
            ><i class="el-icon-edit" /> 画线</el-button>
            <el-button
                v-if="type.indexOf(3) > -1"
                :class="{ active: activeIndex == 3 }"
                size="mini"
                plain
                type="primary"
                @click="drawingPolygon"
            ><i class="el-icon-crop" /> 画面</el-button>
            <el-button
                v-if="clear"
                size="mini"
                plain
                type="danger"
                @click="clearOverlay"
            ><i class="el-icon-refresh-left"/> 清除</el-button>
            <el-button
                v-if="type.length > 0"
                size="mini"
                plain
                type="success"
                @click="clearActiveIndex"
            ><i class="el-icon-thumb"/> 移动</el-button>
        </bm-control>
        <bm-marker v-if="markerPoint.lng != null" :position="markerPoint">
            <!-- <bm-label content="删除" title="删除" :offset="{width: 20,height: 0}"></bm-label> -->
        </bm-marker>
        <bm-polyline
            v-for="(path, index1) in linePoints"
            :editing="isEditing && type.indexOf(2) > -1"
            :key="'line' + index1"
            :path="path"
            :stroke-color="strokeColor"
            :stroke-weight="strokeWeight"
            @lineupdate="onLineupdate($event, index1)"
            @dblclick="onOverlayDbClick($event, index1, 1)"
        />
        <bm-polygon
            v-for="(path, index2) in polygonPoints"
            :editing="isEditing && type.indexOf(3) > -1"
            :key="'polygon' + index2"
            :path="path"
            :stroke-color="strokeColor"
            :stroke-weight="strokeWeight"
            :fill-color="fillColor"
            :fill-opacity="fillOpacity"
            @lineupdate="onPolygonupdate($event, index2)"
        />
        <template v-if="isEditing">
            <div v-for="(path, index) in linePoints" :key="'line_label' + index">
                <map-label
                    v-if="path.length > 0"
                    :offset="{ width: 20, height: 0 }"
                    :position="path[0]"
                    content="删除"
                    title="删除此覆盖物"
                    @click="onOverlayDbClick($event, index, 1)"
                />
            </div>
            <div v-for="(path, index) in polygonPoints" :key="'polygon_label' + index">
                <map-label
                    v-if="path.length > 0 && isEditing && showDeleteBtn"
                    :offset="{ width: 20, height: 0 }"
                    :position="path[0]"
                    content="删除"
                    title="删除此覆盖物"
                    @click="onOverlayDbClick($event, index, 2)"
                />
            </div>
        </template>

    </bm-control>
</template>
<script>
    import MapLabel from './MapLabel'
    export default {
        name: 'MapDrawing',
        components: {
            MapLabel
        },
        props: {
            /** 是否显示清除覆盖物按钮 */
            clear: {
                type: Boolean,
                default: true
            },
            /** 填充透明度 */
            fillOpacity: {
                type: Number,
                default: 0.2
            },
            /** 填充颜色 */
            fillColor: {
                type: String,
                default: '#11a6e8'
            },
            /** 线条颜色 */
            strokeColor: {
                type: String,
                default: '#11a6e8'
            },
            /** 线条宽度 */
            strokeWeight: {
                type: Number,
                default: 2
            },
            /** 是否可編輯 */
            isEditing: {
                type: Boolean,
                default: true
            },
            /**
             * 显示的类型。
             */
            isShow: {
                type: Boolean,
                default: true
            },
            /**
             * 显示的类型。
             */
            type: {
                type: Array,
                default() {
                    return [1, 2, 3]
                }
            },
            /**
             * 控件定位。
             */
            anchor: {
                type: String,
                default: 'BMAP_ANCHOR_TOP_RIGHT'
            },
            /**
             * 偏移量。
             */
            offset: {
                type: Object,
                default() {
                    return {
                        width: 10,
                        height: 10
                    }
                }
            },
            /**
             * 坐标点。
             */
            markerPoint: {
                type: Object,
                default() {
                    return {
                        lng: null,
                        lat: null
                    }
                }
            },
            /**
             * 线段。
             */
            linePoints: {
                type: Array,
                default() {
                    return []
                }
            },
            /**
             * 多边形。
             */
            polygonPoints: {
                type: Array,
                default() {
                    return []
                }
            },
            canDbclick: {
                type: Boolean,
                default: true
            },
            // onlyDrawPoint: {
            //   type: Boolean,
            //   default: false
            // },
            drawPoint: {
                type: Boolean,
                default: false
            },
            // 是否展示 切换 地图类型
            showSwitchMapType: {
                type: Boolean,
                default: true
            },
            // 地图类型 的偏移量
            mapTypeOffset: {
                type: Object,
                default: () => ({
                    width: 10,
                    height: 50
                })
            },
            // 隐藏自定义的删除按钮
            showDeleteBtn: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                map: null,
                activeIndex: null
            }
        },
        watch: {
            drawPoint: {
                handler(val) {
                    if (val) {
                        this.onMapRightClick()
                    }
                }
            }
        },

        methods: {
            mapReady(res) {
                this.map = res.map

                this.map.addEventListener('click', e => {
                    this.onMapClick(e)
                })

                this.map.addEventListener('rightclick', e => {
                    this.onMapRightClick()
                })

                this.map.addEventListener('mousemove', e => {
                    this.onMapMousemove(e)
                })
            },
            onMapClick(e) {
                switch (this.activeIndex) {
                case 1:
                    this.$emit('MarkerUpdate', e.point)
                    break
                case 2: {
                    const paths = this.linePoints
                    !paths.length && paths.push([])
                    paths[paths.length - 1].push(e.point)
                    break
                }
                case 3: {
                    const paths = this.polygonPoints
                    !paths.length && paths.push([])
                    paths[paths.length - 1].push(e.point)
                    break
                }
                }
            },
            onMapRightClick() {
                this.$emit('onlyPoint', true)
                switch (this.activeIndex) {
                case 2: {
                    const len = this.linePoints.length
                    if (len > 0) {
                        const path = this.linePoints[len - 1]
                        if (path.length == 0) {
                            this.linePoints.splice(len - 1, 1)
                        } else {
                            path.pop()
                        }
                    }
                    break
                }
                case 3: {
                    const len = this.polygonPoints.length
                    if (len > 0) {
                        const path = this.polygonPoints[len - 1]
                        if (path.length == 0) {
                            this.polygonPoints.splice(len - 1, 1)
                        } else {
                            path.pop()
                        }
                    }
                    break
                }
                }

                this.activeIndex = null
                this.$emit('activeIndex', this.activeIndex)
                this.map.setDefaultCursor(
                    'url(https://api.map.baidu.com/images/openhand.cur) 8 8,default'
                )
            },
            onMapMousemove(e) {
                switch (this.activeIndex) {
                case 2:
                    this.syncPolyline(e)
                    break
                case 3:
                    this.syncPolygon(e)
                    break
                }
            },
            syncPolygon(e) {
                const len = this.polygonPoints.length
                if (!len) {
                    return
                }

                const path = this.polygonPoints[len - 1]
                if (!path.length) {
                    return
                }

                const p = { lng: e.point.lng, lat: e.point.lat }
                if (path.length === 1) {
                    path.push(p)
                }

                this.$set(path, path.length - 1, p)
            },
            syncPolyline(e) {
                const len = this.linePoints.length
                if (!len) {
                    return
                }

                const path = this.linePoints[len - 1]
                if (!path.length) {
                    return
                }

                const p = { lng: e.point.lng, lat: e.point.lat }
                if (path.length === 1) {
                    path.push(p)
                }

                this.$set(path, path.length - 1, p)
            },
            drawingPoint() {
                this.$emit('onlyPoint', false)
                if (this.activeIndex != 1) {
                    this.activeIndex = 1
                    this.map.setDefaultCursor('crosshair')
                } else {
                    this.activeIndex = null
                    this.map.setDefaultCursor(
                        'url(https://api.map.baidu.com/images/openhand.cur) 8 8,default'
                    )
                }
                this.$emit('activeIndex', this.activeIndex)
                document.activeElement.blur()
            },
            drawingLine() {
                this.$emit('onlyPoint', false)
                if (this.activeIndex != 2) {
                    this.activeIndex = 2
                    this.map.setDefaultCursor('crosshair')
                    const paths = this.linePoints

                    if (!paths.length) {
                        paths.push([])
                    }
                    const path = paths[paths.length - 1]
                    // path.pop();
                    if (path.length) {
                        paths.push([])
                    }
                } else {
                    this.activeIndex = null
                    this.map.setDefaultCursor(
                        'url(https://api.map.baidu.com/images/openhand.cur) 8 8,default'
                    )
                }
                this.$emit('activeIndex', this.activeIndex)
                document.activeElement.blur()
            },
            drawingPolygon() {
                this.$emit('onlyPoint', false)
                if (this.activeIndex != 3) {
                    this.activeIndex = 3
                    this.map.setDefaultCursor('crosshair')
                    this.polygonPoints.push([])
                } else {
                    this.activeIndex = null
                    this.map.setDefaultCursor(
                        'url(https://api.map.baidu.com/images/openhand.cur) 8 8,default'
                    )
                }
                this.$emit('activeIndex', this.activeIndex)
                document.activeElement.blur()
            },
            onLineupdate(e, index) {
                this.$set(this.linePoints, index, e.target.getPath())
            },
            onPolygonupdate(e, index) {
                this.$set(this.polygonPoints, index, e.target.getPath())
            },
            clearOverlay() {
                document.activeElement.blur()
                this.$confirm('确认清除地图上的覆盖物？', '提示', {
                    type: 'warning'
                })
                    .then(() => {
                        this.$emit('onlyPoint', true)
                        this.$emit('clearOverlay')
                    })
                    .catch(_ => {
                        return false
                    })
            },
            onOverlayDbClick(e, index, type) {
                if (this.canDbclick) {
                    this.$confirm('是否移除此覆盖物？', '提示', {
                        type: 'warning'
                    })
                        .then(() => {
                            if (type == 1) {
                                this.linePoints.splice(index, 1)
                            } else {
                                this.polygonPoints.splice(index, 1)
                            }
                        })
                        .catch(_ => {
                            return false
                        })
                } else {
                    return false
                }
            },
            clearActiveIndex() {
                // if (this.activeIndex !== null) {
                //     this.activeIndex = null
                //     // this.$message({ message: '已切换为拖动模式' })
                // }
                // this.map.setDefaultCursor(
                //     'url(https://api.map.baidu.com/images/openhand.cur) 8 8,default'
                // )
                // this.$emit('activeIndex', this.activeIndex)
            }
        }
    }
</script>

<style scoped>
.active {
  background: #409eff;
  border-color: #409eff;
  color: #fff;
}
</style>
