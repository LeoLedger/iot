<template>
    <bm-overlay ref="customOverlay" class="label" pane="labelPane" @ready="mapReady" @draw="draw">
        <div v-if="showName" :title="poi.name" class="content">{{ poi.name }}</div>
        <!-- <a v-if="isCaptureBoundary" class="icon" title="尝试获取边界" @click="getPoiDetailFn">
            <i v-if="!loading" class="el-icon-place" />
            <i v-else class="el-icon-loading" />
        </a> -->
        <div class="arrow" />
        <bm-polygon
            v-for="(path, index) in polygonPaht"
            :key="index"
            :path="path"
            :fill-opacity="0.2"
            :stroke-weight="1"
            stroke-color="#11a6e8"
            fill-color="#11a6e8"
        />
        <bm-label
            v-for="(path, index) in polygonPaht"
            :key="index"
            :position="path[0]"
            content="转成可编辑"
            @click="convToEdit(index)"
        />
    </bm-overlay>
</template>

<script>
    import eventBus from '@/utils/bus'

    export default {
        name: 'MapLabelOverlay',
        props: {
            poi: {
                type: Object,
                default() {}
            },
            convToEditStr: {
                type: String,
                default: 'convToEditStr'
            },
            isCaptureBoundary: {
                type: Boolean,
                default: true
            },
            showName: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                loading: false,
                polygonPaht: [],
                map: null
            }
        },
        watch: {
            'poi.location': {
                handler() {
                    this.$refs.customOverlay.reload()
                    this.loading = false
                    this.polygonPaht.length = 0
                },
                deep: true
            }
        },
        methods: {
            mapReady(e) {
                this.map = e.map
            },
            draw({ el, BMap, map }) {
                const { lng, lat } = this.poi.location
                const pixel = map.pointToOverlayPixel(new BMap.Point(lng, lat))
                el.style.left = pixel.x - 80 + 'px'
                el.style.top = pixel.y - 80 + 'px'
            },
            getPoiDetailFn() {
                if (!this.loading) {
                    this.loading = true
                    // getPoiDetail(this.poi)
                    //     .then(res => {
                    //         this.loading = false
                    //         if (res.data.success) {
                    //             if (
                    //                 res.data.data.profilePoints != null &&
                    //                 res.data.data.profilePoints.length > 0
                    //             ) {
                    //                 console.log(res.data.data.profilePoints)
                    //                 this.polygonPaht = res.data.data.profilePoints
                    //                 this.setViewport(this.polygonPaht)
                    //             } else {
                    //                 this.$message('获取不到边界范围')
                    //             }
                    //         }
                    //     })
                    //     .catch(e => {
                    //         this.loading = false
                    //     })
                }
            },
            setViewport(paths) {
                const points = []
                paths.map(v => {
                    v.map(p => {
                        points.push(new BMap.Point(p.lng, p.lat))
                    })
                })
                this.map.setViewport(points, {
                    enableAnimation: true,
                    delay: 400
                })
            },
            clear() {
                this.loading = false
                this.polygonPaht.length = 0
            },
            convToEdit(index) {
                console.log(this.convToEditStr)
                eventBus.$emit(this.convToEditStr, this.polygonPaht[index])
                this.$nextTick(() => {
                    this.polygonPaht.splice(index, 1)
                })
            }
        }
    }
</script>

<style lang="scss" scoped>
.label {
    width: 160px;
    height: 40px;
    line-height: 20px;
    padding: 10px;
    color: #666;
    background-color: white;
    text-align: center;
    position: absolute;
    box-sizing: border-box;
    box-shadow: 1px 2px 1px rgba(0, 0, 0, 0.15);

    .content {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 15px;
    }
    .icon {
        float: right;
        position: relative;
        top: -20px;

        &:hover {
            color: #409eff;
        }
    }
    .arrow {
        position: absolute;
        display: block;
        width: 0;
        height: 0;
        border-color: transparent;
        border-style: solid;
        border-width: 10px;
        filter: drop-shadow(0 2px 12px rgba(0, 0, 0, 0.03));
        bottom: -10px;
        left: 50%;
        margin-right: 3px;
        border-bottom-width: 0;

        &::after {
            position: absolute;
            display: block;
            width: 0;
            height: 0;
            border-color: transparent;
            border-style: solid;
            content: " ";
            border-width: 10px;
            bottom: 1px;
            margin-left: -20px;
            border-top-color: #fff;
            border-bottom-width: 0;
        }
    }
}
</style>
