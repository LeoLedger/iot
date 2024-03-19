<template>
    <bm-overlay
        ref="customOverlay"
        class="province-item"
        pane="labelPane"
        @draw="draw">
        <div
            :class="getDotClassByCount(count)"
            @click="handleClick"
        />
        <div v-if="showDetail" :class="getLabelClassByTheme()">
            <span class="name">{{ text }}</span>
            <span class="count">{{ count }}</span>
        </div>
    </bm-overlay>
</template>

<script>
    export default { // 用来接受传入的值，用来定制样式
        components: {},
        props: ['text', 'count', 'position', 'showDetail', 'themeType'],
        data() {
            return {
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
            handleClick() {
                console.log('被点击')
                // 省被点击, 将省的坐标点传出去, 并放大到省的zoom
                this.$emit('provinceClick', { position: this.position })
            },
            reload() {
                this.$refs.customOverlay.reload()
            },
            getDotClassByCount(num) {
                if (num <= 25000) {
                    return 'dot dot-green'
                }
                if (num <= 59999) {
                    return 'dot dot-blue'
                }
                if (num <= 99999) {
                    return 'dot dot-pink'
                }
                if (num >= 100000) {
                    return 'dot dot-orange'
                }
            },
            getLabelClassByTheme() {
                if (this.themeType === 1) {
                    return 'dark-label'
                } else return 'normal-label'
            }
        }
    }
</script>

<style scoped lang="scss">
.province-item {
  position: absolute;
  width:48px;
  height:48px;
  //background-color: #1379f7;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  .dot {
    overflow: hidden;
    text-align: center;
    z-index: 333;
    width: 24px;
    height: 24px;
    cursor: pointer;
    transition: all 0.15s ease-out 0s;
    border-radius: 50%;
    &:hover {
      z-index: 555;
      width: 32px;
      height: 32px;
      &:after {
        animation: none;
      }
    }
    &:after {
      content:' ';
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      margin: auto;
      z-index:1;
      width:24px;
      height:24px;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(0,0,0,.3) inset;
      animation: wave 2s ease 0s infinite normal;
    }
  }
  .dot-green {
    box-shadow: 0 0 4px #33FF33;
    background-color: #33FF33;
    background-image: radial-gradient(circle, #33FF33, #00DD00 60%, #66FF66);
    &:after {
      background-color: #33FF33;
    }
  }
  .dot-blue {
    box-shadow: 0 0 4px #5599FF;
    border-radius: 50%;
    background-color: #5599FF;
    background-image: radial-gradient(circle, #5599FF,#0066FF 60%, #99BBFF);
    &:after {
      background-color: #5599FF;
    }
  }
  .dot-pink {
    box-shadow: 0 0 4px #B94FFF;
    border-radius: 50%;
    background-color: #B94FFF;
    background-image: radial-gradient(circle, #B94FFF, #9900FF 60%, #D28EFF);
    &:after {
      background-color: #B94FFF;
    }
  }
  .dot-orange {
    box-shadow: 0 0 4px #FFAA33;
    border-radius: 50%;
    background-color: #FFAA33;
    background-image: radial-gradient(circle, #FFAA33, #FF8800 60%, #FFBB66);
    &:after {
      background-color: #FFAA33;
    }
  }
  .normal-label {
    position: absolute;
    top: 40px;
    left: 40px;
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
  .dark-label {
    position: absolute;
    top: 40px;
    left: 40px;
    background: rgba(7, 52, 45, 0.8);
    border-radius: 4px;
    border: 1px solid #2CFFDF;
    width: 70px;
    height: 43px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    z-index: 10;
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
</style>
