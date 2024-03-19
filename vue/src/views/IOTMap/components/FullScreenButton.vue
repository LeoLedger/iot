<template>
    <bm-control :offset="{ height: 10, width: 10}" anchor="BMAP_ANCHOR_TOP_RIGHT">
        <div :class="themeType?'dark':'normal'" class="control-button" @click="handleClick()">
            <div :class="isInDialog?'el-icon-close':'el-icon-full-screen'"/>
        </div>
        <el-dialog
            v-if="dialogVisible"
            :visible.sync="dialogVisible"
            :show-close="false"
            append-to-body
            custom-class="fullscreen-map"
            fullscreen
            title=""
        >
            <IOTMapComp v-if="dialogVisible" :is-in-dialog="true" @close="dialogVisible = false"/>
        </el-dialog>
    </bm-control>
</template>

<script>
    export default {
        name: 'FullScreenButton',
        components: { IOTMapComp: () => import('../index') },
        props: {
            // 主题类型: 0:简白 1:深色
            themeType: {
                type: Number,
                default: 0
            },
            isInDialog: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                dialogVisible: false
            }
        },
        methods: {
            handleClick() {
                if (this.isInDialog) {
                    this.dialogVisible = false
                    this.$emit('update:visible', false)
                } else this.dialogVisible = true
            }
        }
    }
</script>

<style scoped lang="scss">
.control-button {
  height: 40px;
  width: 40px;
  line-height: 40px;
  font-size: 24px;
  padding: 0 10px;
  border-radius: 2px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
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
<style lang="scss">
.fullscreen-map {
  .el-dialog__header {
    padding: 0!important;
  }
  .el-dialog__body {
    padding: 0;
  }
}
</style>
