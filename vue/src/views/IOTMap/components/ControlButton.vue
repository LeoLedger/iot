<template>
    <bm-control :offset="{ height: 10, width: 10}" anchor="BMAP_ANCHOR_TOP_LEFT">
        <div class="control-button" :class="themeType?'dark':'normal'" @click="$emit('change', !value)">
            <div class="el-icon-setting"/>
            <div>控制面板</div>
            <div :class="value?'el-icon-arrow-down':'el-icon-arrow-up'"/>
        </div>
    </bm-control>
</template>

<script>
    export default {
        name: 'ControlButton',
        props: {
            // 主题类型: 0:简白 1:深色
            themeType: {
              type: Number,
              default: 0
            },
            value: {
                type: Boolean,
                default: false
            }
        },
        methods: {
        }
    }
</script>

<style scoped lang="scss">
.control-button {
  height: 40px;
  width: 126px;
  line-height: 40px;
  font-size: 14px;
  padding: 0 10px;
  border-radius: 2px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  font-weight: 500;
  user-select:none;
  float: left;
  &.normal {
    color: #333333;
    background: #FFFFFF;
    box-shadow: 0px 0px 4px #DDDDDD;
  }
  &.dark {
    color: #FFFFFF;
    background: radial-gradient(circle, rgba(0, 147, 255, 0.5) 0%, rgba(44, 255, 223, 0) 100%);
    border: 1px solid;
    border-image: radial-gradient(circle, rgba(120, 231, 255, 1), rgba(67, 202, 255, 0.11)) 1 1;
  }
}
</style>
