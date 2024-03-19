<template>
    <div :class="getClass()" class="count-label-rect">
        <div :class="'count-label-' + getClass()">
            <div class="count-number">{{ number }}</div>
            <div class="count-text">在运营物联网设备</div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'DeviceCount',
        props: {
            number: {
                type: Number,
                default: 0
            },
            // 主题类型: 0:简白 1:深色
            themeType: {
                type: Number,
                default: 0
            },
            mapConfig: {
                type: Object,
                default: () => {}
            }
        },
        methods: {
            getClass() {
                if (this.mapConfig.mapTypeId === 3) {
                    return 'hybrid'
                } else {
                    return this.themeType === 1 ? 'dark' : 'normal'
                }
            }
        }
    }
</script>

<style scoped lang="scss">
.count-label-rect {
  width: 176px;
  height: 74px;
  right: 0;
  left: 0;
  top: 0;
  bottom: 0;
  margin: 10px auto auto;
  position: absolute;
  padding: 6px;
  &.normal {
    background: linear-gradient(to left, #293041,#293041) left top no-repeat,
    linear-gradient(to bottom,#293041,#293041) left top no-repeat,
    linear-gradient(to left,#293041,#293041) right top no-repeat,
    linear-gradient(to bottom,#293041,#293041) right top no-repeat,
    linear-gradient(to left,#293041,#293041) left bottom no-repeat,
    linear-gradient(to bottom,#293041,#293041) left bottom no-repeat,
    linear-gradient(to left,#293041,#293041) right bottom no-repeat,
    linear-gradient(to left,#293041,#293041) right bottom no-repeat;
    background-size: 2px 15px, 15px 2px, 2px 15px, 15px 2px;
  }
  &.dark {
    background: linear-gradient(to left, #89F7F8,#89F7F8) left top no-repeat,
    linear-gradient(to bottom,#89F7F8,#89F7F8) left top no-repeat,
    linear-gradient(to left,#89F7F8,#89F7F8) right top no-repeat,
    linear-gradient(to bottom,#89F7F8,#89F7F8) right top no-repeat,
    linear-gradient(to left,#89F7F8,#89F7F8) left bottom no-repeat,
    linear-gradient(to bottom,#89F7F8,#89F7F8) left bottom no-repeat,
    linear-gradient(to left,#89F7F8,#89F7F8) right bottom no-repeat,
    linear-gradient(to left,#89F7F8,#89F7F8) right bottom no-repeat;
    background-size: 2px 15px, 15px 2px, 2px 15px, 15px 2px;
  }
  &.hybrid {
    background: linear-gradient(to left, white,white) left top no-repeat,
    linear-gradient(to bottom,white,white) left top no-repeat,
    linear-gradient(to left,#FFF,#FFF) right top no-repeat,
    linear-gradient(to bottom,#FFF,#FFF) right top no-repeat,
    linear-gradient(to left,#FFF,#FFF) left bottom no-repeat,
    linear-gradient(to bottom,#FFF,#FFF) left bottom no-repeat,
    linear-gradient(to left,#FFF,#FFF) right bottom no-repeat,
    linear-gradient(to left,#FFF,#FFF) right bottom no-repeat;
    background-size: 2px 15px, 15px 2px, 2px 15px, 15px 2px;
  }
}
.count-label-normal {
  width: 164px;
  height: 62px;
  background: radial-gradient(circle, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%);
  box-shadow: 0px 2px 4px 0px #DDDDDD;
  overflow: hidden;
  color: #2a2a2a;
  text-align: center;
  .count-number {
    font-size: 30px;
    font-family: DINAlternate-Bold;
    font-weight: bold;
  }
  .count-text {
    font-size: 14px;
  }
}
.count-label-dark {
  width: 164px;
  height: 62px;
  background: radial-gradient(circle, rgba(0, 147, 255, 0.5) 0%, rgba(44, 255, 223, 0) 100%);
  border: 1px solid;
  border-image: radial-gradient(circle, rgba(120, 231, 255, 1), rgba(67, 202, 255, 0.11)) 1 1;
  overflow: hidden;
  color: #00FFFE;
  text-align: center;
  .count-number {
    font-size: 30px;
    font-family: DINAlternate-Bold;
    font-weight: bold;
  }
  .count-text {
    color: #9FD7FC;
    font-size: 14px;
  }
}
.count-label-hybrid {
  width: 164px;
  height: 62px;
  background: rgba(255,255,255,0.8);
  //border: 1px solid white;
  overflow: hidden;
  color: #2a2a2a;
  text-align: center;
  .count-number {
    font-size: 30px;
    font-family: DINAlternate-Bold;
    font-weight: bold;
  }
  .count-text {
    color: #2a2a2a;
    font-size: 14px;
  }
}
</style>
