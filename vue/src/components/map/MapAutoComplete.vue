<template>
    <bm-control v-if="isShow" :offset="offset" @ready="mapReady">
        <el-input
            ref="map-auto-complete-input"
            v-model="keyWord"
            type="text"
            class="search-input"
            clearable
            placeholder="请输入关键字进行搜索"
            @input="inputChange"
            @clear="inputClear"
            @blur="inputBlur"
            @focus="inputFocus"
        />
        <el-button v-if="showCancel" size="mini" type="" @click="inputCancel">取消</el-button>
        <div class="search-container">
            <div
                v-for="(item, index) in suggestionData"
                :key="index"
                :title="item.name"
                class="res-item"
                @click="jumpTo(item)"
            >
                <i :class="item.isLocal === '1' ? 'el-icon-location-outline' : 'el-icon-position'" />
                <span>{{ item.name }}</span>
                <em>{{ item.city + item.area + item.address }}</em>
            </div>
        </div>
        <bm-marker v-if="markerPoint != null" :position="markerPoint" />
        <map-label-overlay
            v-if="selectItem != null"
            ref="labelOverlay"
            :poi="selectItem"
            :conv-to-edit-str="convToEditStr"
            :is-capture-boundary="isCaptureBoundary"
        />
    </bm-control>
</template>

<script>
    // API
    import resourceApi from '@/api/resource'
    // 组件
    import MapLabelOverlay from './MapLabelOverlay'

    export default {
        name: 'MapAutoComplete',
        components: {
            MapLabelOverlay
        },
        props: {
            offset: {
                type: Object,
                default() {
                    return { width: '10', height: '10' }
                }
            },
            isShow: {
                type: Boolean,
                default: true
            },
            convToEditStr: {
                type: String
            },
            isCaptureBoundary: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                map: null,
                keyWord: '',
                suggestionData: [],
                markerPoint: null,
                selectItem: null,
                showCancel: false
            }
        },
        methods: {
            mapReady(e) {
                this.map = e.map
            },
            inputClear() {
                this.showCancel = false
                this.suggestionData = []
                this.selectItem = null
                this.markerPoint = null
                // this.$refs.labelOverlay.clear()
            },
            inputChange(v) {
                this.showCancel = true
                if (v) {
                    resourceApi.getMaps({
                        query: v
                    }).then(res => {
                        if (res.success) {
                            this.suggestionData = res.data.results
                        } else {
                            this.$message({
                                message: res.message,
                                type: 'warning'
                            })
                        }
                    })
                } else {
                    this.suggestionData = []
                }
            },
            inputCancel() {
                this.showCancel = false
                this.$refs['map-auto-complete-input'].blur()
            },
            inputFocus() {
                // 获取焦点
                this.showCancel = true
                this.$emit('focus')
            },
            inputBlur() {
                // 失去焦点
                setTimeout(() => {
                    this.showCancel = false
                    this.$emit('blur')
                }, 1000)
            },
            jumpTo(item) {
                this.showCancel = false
                this.suggestionData = []
                this.map.panTo(
                    new BMap.Point(item.location.lng, item.location.lat)
                )
                this.markerPoint = item.location
                this.selectItem = item
            }
        }
    }
</script>

<style lang="scss" scoped>
.search-input {
    width: 260px;
}
.search-container {
    width: 300px;
    max-height: 540px;
    overflow-y: auto;
    background-color: white;
    color: #666;
    a {
        display: block;
    }
    .res-item {
        padding: 10px 5px;
        line-height: 20px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        &:hover {
            background-color: #eee;
        }

        em {
            margin-left: 10px;
            margin-right: 20px;
            font-style: normal;
            color: #999;
        }
    }
}
</style>
