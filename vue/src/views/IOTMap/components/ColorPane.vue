<template>
    <bm-control :offset="{ height: 19, width: 10}" anchor="BMAP_ANCHOR_BOTTOM_RIGHT">
        <div :class="themeType?'dark':'normal'" class="color-pane-box">
            <div v-show="visible" :class="themeType?'dark':'normal'" class="color-pane">
                <div class="title" :class="themeType?'dark':'normal'">各省设备数量图例</div>
                <div v-for="(item, index) in colorList" :key="index" :class="themeType?'dark':'normal'" class="color-row">
                    <div class="text" :class="themeType?'dark':'normal'">{{ item.text }}</div>
                    <div :style="{background: item.color}" class="color"/>
                </div>
            </div>
            <div :class="themeType?'dark':'normal'" class="color-pane-switch" @click="visible=!visible">
                <i v-if="visible" class="el-icon-arrow-right"/>
                <i v-else class="el-icon-arrow-left"/>
            </div>
        </div>
    </bm-control>
</template>

<script>
    export default {
        name: 'ColorPane',
        props: {
            // 主题类型: 0:简白 1:深色
            themeType: {
                type: Number,
                default: 0
            }
        },
        data() {
            return {
                colorList: [
                    { color: '#FF7B00', text: '≥100000' },
                    { color: '#B630FF', text: '60000-99999' },
                    { color: '#0068FF', text: '25001-59999' },
                    { color: '#00C36C', text: '≤25000' }
                ],
                visible: true
            }
        }
    }
</script>

<style scoped lang="scss">
$borderColor: #F8F8F8;
$fontColor: #333333;
$checkedColor: #293041;
$noCheckedColor: #F2F2F2;
$backgroundColor: #FFFFFF;
.color-pane-box {
  position: relative;
  margin-right: 10px;
  margin-bottom: 19px;
  width: 168px;
  height: 182px;
  transition: all 0.3s ease-in-out;
}
.color-pane {
  width: 168px;
  height: 168px;
  padding: 10px 16px;
  display: flex;
  flex-direction: column;
  &.normal {
    background: #FFFFFF;
  }
  &.dark {
    background: radial-gradient(circle, rgba(0, 147, 255, 0.5) 0%, rgba(44, 255, 223, 0) 100%);
    border: 1px solid;
    border-image: radial-gradient(circle, rgba(120, 231, 255, 1), rgba(67, 202, 255, 0.11)) 1 1;
  }
  .title {
    font-size: 14px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 600;
    &.normal {
      color: #293041;
    }
    &.dark {
      color: #fff;
    }
  }
  .color-row {
    margin-top: 10px;
    padding-left: 20px;
    width: 136px;
    height: 22px;
    border-radius: 2px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    &.normal {
      background: #F8F8F8;
    }
    &.dark {
      background: rgba(21, 234, 253, 0.1);
      border-radius: 2px;
    }
    .text {
      line-height: 22px;
      font-size: 12px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 600;
      &.normal {
        color: #293041;
      }
      &.dark {
        color: #fff;
      }
    }
    .color {
      width: 22px;
      height: 22px;
      border-radius: 2px;
    }
  }
}
.color-pane-switch {
  position: absolute;
  width: 28px;
  height: 28px;
  font-size: 16px;
  line-height: 28px;
  text-align: center;
  top: -15px;
  right: -15px;
  border-radius: 50%;
  cursor: pointer;
  margin-bottom: 168px;
  transition: all 0.3s ease-in-out;
  &.normal {
    background: #FFFFFF;
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.5);
    color: #293041;
  }
  &.dark {
    background: #11556B;
    color: #FFFFFF;
  }
}
</style>
