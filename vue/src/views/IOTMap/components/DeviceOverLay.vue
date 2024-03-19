<template>
    <bm-overlay
        ref="customOverlayDevice"
        class="device-item"
        pane="labelPane"
        @draw="draw">
        <div
            v-if="mapTile === 1"
            :style="{}"
            :class="getIconClass()"
            @click="handleClick"
        />
        <div
            v-if="mapTile === 3"
            class="icon-BmPointCollection"
        />
        <div v-if="showDetail" :class="getLabelClass()">
            <div class="name">{{ getText() }}</div>
            <div class="name">{{ pointData.imei }}</div>
        </div>
    </bm-overlay>
</template>

<script>
    import enums from './enums'
    export default { // 用来接受传入的值，用来定制样式
        components: {},
        props: ['text', 'pointData', 'position', 'showDetail', 'themeType', 'mapTile'],
        data() {
            return {
                enums,
                pointColor: ''
            }
        },
        computed: {},
        watch: {
            position: {
                handler() {
                    this.reload()
                },
                deep: true
            },
            showDetail() {
                // this.reload()
            }
        },
        mounted() {},
        methods: {
            // 这是百度地图的重绘函数,用于维持覆盖物的位置（这里的值貌似会影响拖拉时的偏移度）
            draw({ el, BMap, map }) {
                const { lng, lat } = this.position
                const pixel = map.pointToOverlayPixel(new BMap.Point(lng, lat))
                el.style.left = pixel.x - 24 + 'px'
                el.style.top = pixel.y - 24 + 'px'
                // console.log('绘制点: ', this.text)
            },
            reload() {
                this.$refs.customOverlayDevice.reload()
            },
            handleClick() {
                this.$emit('deviceClick', { position: this.position })
            },
            getIconClass() {
                if (this.pointData.productType === enums.productTypeList[0].value) {
                    return 'icon icon-car el-icon-truck'
                } else return 'icon icon-person el-icon-user'
            },
            getLabelClass() {
                if (this.themeType === 1) {
                    return 'dark-label'
                } else return 'normal-label'
            },
            getText() {
                if (this.pointData.productType === enums.productTypeList[0].value) {
                    return enums.productTypeList[0].label
                } else return enums.productTypeList[1].label
            }
        }
    }
</script>

<style scoped lang="scss">
.device-item {
  position: absolute;
  width:48px;
  height:48px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  .label {
    margin-top: 2px;
    margin-left: 4px;
    background: #293041;
    border-radius: 4px;
    border: 1px solid #FFFFFF;
    width: 70px;
    height: 43px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    z-index: 10;
    opacity: 0.88;
    &:hover {
      opacity: 1;
    }
    .name {
      font-size: 12px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #FFFFFF;
    }
    .count {
      font-size: 18px;
      font-family: DIN-Bold, DIN;
      font-weight: bold;
      color: #FFFFFF;
    }
  }
}
.icon {
  overflow: hidden;
  text-align: center;
  z-index: 333;
  cursor: pointer;
  transition: all 0.15s ease-out 0s;
  color: white;
  font-size: 24px;
  text-shadow: 0 0 2px #000;
  line-height: 36px;
  width: 36px;
  height: 36px;
  &:hover {
    width: 48px;
    height: 48px;
    line-height: 48px;
    font-size: 36px;
  }
}
.icon-car {
  transition: all 0.15s ease-out 0s;
  box-shadow: 0 0 4px #5599FF;
  border-radius: 50%;
  background-color: #5599FF;
  background-image: radial-gradient(circle, #5599FF,#0066FF 60%, #99BBFF)
  //&:after {
  //  content:' ';
  //  position: absolute;
  //  left: 0;
  //  right: 0;
  //  top: 0;
  //  bottom: 0;
  //  margin: auto;
  //  z-index:1;
  //  width:24px;
  //  height:24px;
  //  background-color: #5599FF;
  //  border-radius: 50%;
  //  box-shadow: 0 0 10px rgba(0,0,0,.3) inset;
  //  animation: wave 2s ease 0s infinite normal;
  //}
}
.icon-person {
  transition: all 0.15s ease-out 0s;
  box-shadow: 0 0 4px #33FF33;
  border-radius: 50%;
  background-color: #33FF33;
  background-image: radial-gradient(circle, #33FF33, #00DD00 60%, #66FF66);
  //&:after {
  //  content:' ';
  //  position: absolute;
  //  left: 0;
  //  right: 0;
  //  top: 0;
  //  bottom: 0;
  //  margin: auto;
  //  z-index:1;
  //  width:24px;
  //  height:24px;
  //  background-color: #33FF33;
  //  border-radius: 50%;
  //  box-shadow: 0 0 10px rgba(0,0,0,.3) inset;
  //  animation: wave 2s ease 0s infinite normal;
  //}
}

// 海量点
.icon-BmPointCollection {
  width: 10px;
  height: 10px;
  background: #FF5D00;
  border: 1px solid #FFFFFF;
  border-radius: 50%;
}
// 散点的最小点
.icon-BmlMarkerClusterer {
  width: 6px;
  height: 6px;
  background: #FF7B00;
  border-radius: 50%;
}
// 涟漪效果
@keyframes wave {
  0% {
    opcity:75;
    width:20px;
    height:20px;
  }
  100% {
    opacity: 0;
    width:50px;
    height:50px;
  }
}
.normal-label {
  position: absolute;
  top: 40px;
  left: 40px;
  background: #293041;
  border-radius: 4px;
  border: 1px solid #FFFFFF;
  height: 43px;
  min-width: 120px;
  padding: 0 5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  z-index: 10;
  color: #FFFFFF;
  &:hover {
    color: #13C2C2;
  }
  .name {
    font-size: 12px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
  }
}
.dark-label {
  position: absolute;
  top: 40px;
  left: 40px;
  background: rgba(7, 52, 45, 0.8);
  border-radius: 4px;
  border: 1px solid #2CFFDF;
  padding: 0 5px;
  height: 43px;
  min-width: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  z-index: 10;
  color: #FFFFFF;
  &:hover {
    background: rgba(7, 52, 45, 1);
    color: #2CFFDF;
  }
  .name {
    font-size: 12px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
  }
}
</style>
