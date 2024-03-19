<template>
    <div v-loading="loading" class="map-container">
        <baidu-map
            v-bind="mapConfig"
            :map-click="true"
            :scroll-wheel-zoom="true"
            style="height: 100%;width: 100%"
            @ready="mapInit"
        >
            <div class="search-wrap">
                <!-- <el-input
                    v-model="searchParam.keyword"
                    placeholder="输入关键词搜索"
                    size="small"
                    clearable
                    style="width: 100%"
                    @change="handleSearch"
                /> -->
                <el-select
                    v-model="searchParam.provinceId"
                    size="small"
                    placeholder="选择省份获取边界"
                    style="width: 100%"
                    @change="handleSearch"
                >
                    <el-option
                        v-for="(option, index) in option"
                        :key="index"
                        :value="option.value"
                        :label="option.label"
                    />
                </el-select>
                <el-button
                    v-waves
                    size="mini"
                    type="warning"
                    @click="handleAuto"
                >获取所有边界</el-button>
            </div>
        </baidu-map>
    </div>
</template>

<script>
    import resourceApi from '@/api/resource'
    import { mapStyle_normal } from '@/components/map/mapStyleConfig'
    import cityData from '@/views/mapTest/cityData'
    export default {
        name: 'Index',
        components: {},
        data() {
            return {
                cityData,
                loading: false,
                mapConfig: {
                    // 全国视图 5-7 / 省级 8-12 / 市级 13
                    zoom: 5,
                    maxZoom: 18,
                    minZoom: 4,
                    // 中心
                    center: '北京',
                    // 中心点地址
                    centerAddress: '',
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
                },
                option: cityData,
                // option: [
                //     { label: '北京', value: '263a314d-0976-4843-bdcb-38fa7a350abd' },
                //     { label: '天津', value: '13c8b5b2-b855-4be7-b548-78be2855dee5' },
                //     { label: '河北省', value: '7b6c1127-0c9d-4d6d-aa11-acff9a526120' },
                //     { label: '山西省', value: '9ad9c74c-775b-4809-ba57-7e0441bc7fb0' },
                //     { label: '内蒙古自治区', value: '11c7d67c-26e2-4dad-a40d-180d9172c1eb' },
                //     { label: '辽宁省', value: 'bb84d56d-8933-4012-a629-a3f433030eda' },
                //     { label: '吉林省', value: '0410bd17-1430-45a4-8927-81f6dfa5cab0' },
                //     { label: '黑龙江省', value: 'c5ead6d6-39f9-41b6-b2cb-626eccb9f310' },
                //     { label: '上海', value: 'c5cff129-e8fc-4b45-a967-4979e5392a96' },
                //     { label: '江苏省', value: 'dea7fb2f-ff45-4480-b293-b8b8b48cdbeb' },
                //     { label: '浙江省', value: 'f1686c31-4756-4837-8c15-1c2ce03e0737' },
                //     { label: '安徽省', value: '7094f6a0-4702-4f4f-8c86-ccdf720547be' },
                //     { label: '福建省', value: '5022b5a3-0d15-4735-bbf1-d9a862a7dbb8' },
                //     { label: '江西省', value: 'f44b4f0f-fedf-4f0c-98e0-7aa32bd27a53' },
                //     { label: '山东省', value: 'd4246b6c-2a0d-4afd-9b0c-5d2f35a2b7dc' },
                //     { label: '河南省', value: '29747096-d9e5-42eb-a15a-9ca72afc8623' },
                //     { label: '湖北省', value: 'ab72dc67-75a0-4c54-8eb8-37f6c5d789d2' },
                //     { label: '湖南省', value: '56d4a837-9e08-4517-83c5-57cb5dd991bc' },
                //     { label: '广东省', value: '4273c1c8-8361-4fd2-acf3-84e67d1cb5e0' },
                //     { label: '广西壮族自治区', value: '9373ad51-9f0d-4cb0-bf6f-177d0d685768' },
                //     { label: '海南省', value: 'a98188a7-90c2-4c3c-8eba-514c3ac70f54' },
                //     { label: '重庆', value: '1e6d1267-593d-4f46-8a40-0c52775b4f16' },
                //     { label: '四川省', value: '0193775f-ba6d-429a-9bfc-99421355d57e' },
                //     { label: '贵州省', value: '229c1854-1538-43c0-a9e9-d31e9d04c377' },
                //     { label: '云南省', value: '8e6f6005-eee9-4bf1-95ca-a58f7ac3e8f6' },
                //     { label: '西藏自治区', value: '1754fa50-66c9-4353-8bb8-8dafb11eab5a' },
                //     { label: '陕西省', value: '3638f0d5-6b55-4f97-80a0-b49c0c14851f' },
                //     { label: '甘肃省', value: '65514530-e045-47fd-8587-bc9c572b3b46' },
                //     { label: '青海省', value: 'dc6267fb-f7a3-4640-b11d-d73023822efd' },
                //     { label: '宁夏回族自治区', value: '4d3a417d-b041-41d5-9f3b-20b98f0c9fbe' },
                //     { label: '新疆维吾尔自治区', value: '2ffac419-791c-4d78-9620-c91df8ae99a1' },
                //     { label: '台湾', value: 'b49f87f2-605e-4a5b-9e66-4f332854d1bf' },
                //     { label: '香港', value: '71f948ca-06d4-49af-b32c-0e826776917d' },
                //     { label: '澳门', value: '9cf1b9e2-a7a5-465a-9b8c-4e74496c4a96' },
                //     { label: '钓鱼岛', value: 'cf745138-1c57-4953-9c62-f99f38c7feb9' }
                // ],
                searchParam: {
                    provinceId: '',
                    keyword: '广东省'
                },
                BMap: null,
                map: null,
                start: false,
                startValue: '704a032a-3a38-4a02-a3fc-a643bb25c783'
            }
        },
        computed: {
        },
        watch: {},
        mounted() {},
        methods: {
            mapInit({ BMap, map }) {
                this.map = map
                this.BMap = BMap
            },
            getBoundary(provinceId, index) {
                return new Promise((resolve, reject) => {
                    // this.loading = true
                    const item = this.option.find(v => v.value === provinceId)
                    // 完整label
                    const label = item.label
                    // 分割
                    const label_ = label.split('/')
                    // 市名
                    const cityName = label_[1]
                    if (this.startValue === item.value) {
                        this.start = true
                    }
                    if (this.start) {
                        console.log((index + 1) + '/' + this.option.length + ' ' + cityName)
                        var bdary = new BMap.Boundary()
                        bdary.get(cityName, (rs) => { // 获取行政区域
                            this.map.clearOverlays() // 清除地图覆盖物
                            var count = rs.boundaries.length // 行政区域的点有多少个
                            if (count === 0) {
                                console.log(label + '的区域边界获取失败')
                                this.$message.error(label + '的区域边界获取失败')
                                reject()
                            }
                            var pointArray = []
                            for (var i = 0; i < count; i++) {
                                var ply = new BMap.Polygon(rs.boundaries[i], { strokeWeight: 2, strokeColor: '#ff0000' }) // 建立多边形覆盖物
                                this.map.addOverlay(ply) // 添加覆盖物
                                pointArray.push(ply.getPath())
                            }
                            // console.log(pointArray)
                            var recursion = (list) => {
                                return list.map(item => {
                                    if (Array.isArray(item)) {
                                        return recursion(item)
                                    }
                                    return {
                                        x: item.lat,
                                        y: item.lng
                                    }
                                })
                            }
                            resourceApi.setMapBoundary(provinceId, recursion(pointArray)).then(() => {
                                // console.log(label, '成功')
                                this.$message(label + ' 获取并保存成功!')
                                resolve()
                            }).catch(() => {
                                reject()
                            })
                        })
                    } else {
                        resolve()
                    }
                    // this.loading = false
                })
            },
            handleSearch() {
                this.getBoundary(this.searchParam.provinceId, 1)
            },
            handleAuto() {
                this.start = false
                Promise.prototype.queue(this.option.map((item, index) => {
                    return () => this.getBoundary(item.value, index)
                })).then(() => {
                    this.$message.success('处理完成！')
                })
            }
        }
    }
</script>

<style scoped lang="scss">
.map-container {
    height:100%;
    margin:0px;
    padding:0px;
    .search-wrap {
        position: absolute;
        left: 20px;
        top: 20px;
        background: #fff;
        width: 300px;
    }
}
</style>
