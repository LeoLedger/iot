<template>
    <bm-overlay ref="labelPoint" :title="localData.text || ''" class="labelPoint" pane="labelPane" @draw="draw">
        <!-- html -->
        <div v-if="localData.html" :style="localColor + localData.textStyle" class="labelWrap" @click.stop="click">
            <div class="label" v-html="localData.html"/>
        </div>
        <!-- text -->
        <div v-else-if="localData.text" :style="localColor + localData.textStyle" class="labelWrap" @click.stop="click">
            <div class="label">{{ localData.text }}</div>
        </div>
        <!-- img -->
        <div :style="`background-image: url(${localData.imgUrl}); ${localData.iconStyle}`" class="labelImg" @click.stop="click"/>
    </bm-overlay>
</template>
<script>
    const reportPoint = require('@/assets/map/sy-icon-dingwei2.png')
    export default {
        name: 'MapLabelPoint',
        props: {  
            // 参考computed 的 localData 配置
            formData: {
                type: Object,
                default: () => ({})
            },
            active: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            localData() {
                return {
                    imgUrl: reportPoint,
                    text: '', // label
                    html: '', // label 可自定义html
                    color: '#02a7f0', // label 颜色样式
                    textStyle: '', // label 内联样式
                    iconStyle: '', // icon 内联样式
                    lat: 0, // 经纬度数据
                    lng: 0,
                    ...this.formData
                }
            },
            localColor() {
                const color = this.localData.color
                if (color) {
                    return `color: ${color}; border: 1px solid ${color};`
                }
                return ''
            }
        },
        watch: {
            formData: {
                handler() {
                    this.$refs.labelPoint.reload()
                },
                deep: true
            }
        },
        methods: {
            draw({ el, BMap, map }) {
                const { lng, lat } = this.formData
                const pixel = map.pointToOverlayPixel(new BMap.Point(lng, lat))
                el.style.left = pixel.x - 17 + 'px'
                el.style.top = pixel.y - 17 + 'px'
            },
            click() {
                if (typeof this.formData.click === 'function') {
                    return this.formData.click(this.formData)
                }
                return this.$emit('click', this.formData)
            }
        }
    }
</script>

<style lang="scss" scoped>
.labelPoint {
    cursor: pointer;
    position: absolute;
    &.active {
    }
    .labelImg {
        position: absolute;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: transparent no-repeat center center;
        background-size: 96% 96%;
    }
    .labelWrap {
        position: absolute;
        top: -18px;
        width: 90px;
        left: 17px;
        padding: 2px 0;
        text-align: center;
        font-size: 12px;
        line-height: 12px;
        color: #f00;
        border: 1px solid #f00;
        background: #fff;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        transform: translateX(-50%);
        .label {
            padding: 0 2px;
        }
        /*.txt {
            color: red;
        }*/
    }
}
</style>
