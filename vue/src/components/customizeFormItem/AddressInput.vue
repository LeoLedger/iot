<template>
    <div class="addressInputWrap">
        <el-input
            v-model="params[_form.addressKey]"
            :size="size"
            :maxlength="form.maxlength"
            :readonly="_form.readonly"
            :disabled="!_form.isEditInput"
            :placeholder="placeholder"
        >
            <!-- :disabled="!_form.isEdit" -->
            <el-button
                slot="append"
                :size="size"
                title="定位"
                type="primary"
                icon="el-icon-location-outline"
                @click="selectAddress"
            />
        </el-input>
        <!-- 该组件：editAddAddress: visible 表示 弹窗是否展示
                 point: 点位置(经纬度 {lat, lan} )
                 detailAddress: location // 所在位置描述address
                 center: 地图中心点( 省市区/ {lat, lan}[经纬度] )
                 @closeEditMap1="cancel" // 取消按钮弹窗操作
                 @closeEditMap2="submit" // 选取点后弹窗操作
        -->
        <DrawMap
            v-if="visible"
            :is-detail="!_form.isEdit || disabled"
            v-bind="drawMapData"
            :edit-add-address="visible"
            :point="params[_form.pointKey] || point"
            :show-map-types="showMapTypes"
            :detail-address="params[_form.addressKey]"
            :center="params['center']"
            @closeEditMap1="onCancel"
            @closeEditMap2="onSubmit"
        />
    </div>
</template>

<script>
    import DrawMap from '@/components/map/drawMap'

    const defaultProvince = '深圳市'

    export default {
        name: 'AddressInput',
        components: {
            DrawMap
        },
        model: {
            prop: 'params',
            event: 'update:params'
        },
        props: {
            size: {
                type: String,
                default: 'mini'
            },
            placeholder: {
                type: String,
                default: ''
            },
            disabled: {
                type: Boolean,
                default: false
            },
            params: {
                type: Object,
                required: true,
                default: () => {
                    // 至少有 point, address 字符
                    return {
                        point: {
                            lng: null,
                            lat: null
                        },
                        address: ''
                    }
                }
            },
            form: {
                type: Object,
                required: true
            },
            // 区块信息
            polygons: {
                type: Array,
                default: () => []
            },
            showMapTypes: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                visible: false,
                address: '',
                centerAddress: defaultProvince,
                point: null,
                drawMapData: {
                    // 区域块数据
                    polygonData: {
                        polygons: []
                    }
                }
            }
        },
        computed: {
            _form() {
                const _form = {
                    size: 'mini', // 尺寸大小
                    isEdit: true, // 是否可编辑
                    isLimitProject: false, // 选地址时 是否根据选中项目判断
                    projectIdKey: 'projectId', // 若根据选中项目判断 获取项目id 的Key 值
                    maxlength: 200, // 最大输入长度
                    // eg: params: {point:{lat, lng}, address: '北京'}
                    isEditInput: true,
                    readonly: true,
                    pointKey: 'point', // 点数据的Key 值
                    addressKey: 'address' // 地址数据的Key 值
                // centerAddress: ''
                // centerAddressKey: 'centerAddress' // 若有更新再做添加
                }
                return Object.assign({}, _form, this.form)
            }
        },
        watch: {
            params: {
                // immediate: true,
                handler: function(val) {
                    // console.log('---监听v-model绑定数据----', val)
                }
            },
            polygons: {
                handler(val) {
                    this.drawMapData.polygonData.polygons = val || []
                },
                immediate: true
            }
        },
        methods: {
            selectAddress() {
                const {
                    regionName,
                    cityName,
                    provinceName,
                    center,
                    address
                } = this.params
                this.params.center = center || address || regionName || cityName || provinceName || this.form.center || defaultProvince
                // 若存在地图中心点
                this.visible = true
            },
            onCancel() {
                this.visible = false
            },
            async onSubmit(data) {
                var [point = {}, address = ''] = data || []
                // var resData = await getAreaData(point)
                var { pointKey, addressKey } = this._form
                var formData = {
                    [pointKey]: point,
                    [addressKey]: address,
                    center: point
                }
                // if (this._form.areaCode !== false) {
                //     formData.areaName = resData.data || []
                //     if (this._form.deep) {
                //         formData.areaName = formData.areaName.slice(0, this._form.deep)
                //     }
                // }
                this.updateFormData(formData)
                this.visible = false
            },
            updateFormData(obj) {
                const params = Object.assign({}, this.params, obj)
                this.$emit('update:params', params)
            }
        }
    }

/**
 * eg:
 */
</script>

<style scoped lang="scss">
.addressInputWrap {
    /deep/ {
        .el-input-group__append {
            color: #fff;
            background-color: #409eff;
            border-color: #409eff;
            border-left: 1px solid #fff;
            border-radius: 0;
        }
    }
}
</style>
