<template>
    <div class="collapse-layout-skn2cpa">
        <!-- 如果有tab标签页  -->
        <el-tabs v-if="showTab" v-model="activeTab">
            <el-tab-pane v-for="(tab, tabIndex) in tabList" :key="tabIndex" :name="String(tabIndex)" :label="tab.label" style="height: 60vh">
                <el-collapse v-if="tab.collapseList && tab.collapseList.length" v-model="activeCollapse[tab.name]">
                    <el-collapse-item
                        v-for="(collapse, collapseIndex) in tab.collapseList"
                        v-show="collapse.visible !== false"
                        :key="collapseIndex"
                        :name="String(collapseIndex)"
                        :disabled="collapse.disabled || false"
                        :class="collapse.disabled?'disabled':'enabled'"
                    >
                        <template slot="title">
                            <div class="container__label">
                                <div class="container__title">{{ collapse.title }}</div>
                                <div v-if="collapse.button">
                                    <el-button
                                        :type="collapse.button.type || 'text'"
                                        :icon="collapse.button.icon"
                                        :style="collapse.button.style"
                                        size="mini"
                                        @click.stop.prevent="collapse.button.click()"
                                    >
                                        {{ collapse.button.text || '' }}
                                    </el-button>
                                </div>
                                <slot v-else :name="collapse.buttonSlotName" />
                            </div>
                        </template>
                        <slot :name="collapse.slotName"/>
                    </el-collapse-item>
                </el-collapse>
                <slot v-else :name="tab.slotName" />
            </el-tab-pane>
        </el-tabs>
        <!-- 如果没有tab标签页  -->
        <el-collapse v-else v-model="activeCollapse_" class="maxHeight" :style="{ 'max-height': maxHeight }">
            <el-collapse-item
                v-for="(collapse, collapseIndex) in collapseList"
                v-show="collapse.visible !== false"
                :key="collapseIndex"
                :name="String(collapseIndex)"
                :disabled="collapse.disabled || false"
                :class="collapse.disabled?'disabled':'enabled'"
            >
                <template slot="title">
                    <div class="container__label">
                        <div class="container__title">{{ collapse.title }}</div>
                        <div v-if="collapse.button">
                            <el-button
                                :type="collapse.button.type || 'text'"
                                :icon="collapse.button.icon"
                                :style="collapse.button.style"
                                size="mini"
                                @click.stop.prevent="collapse.button.click()"
                            >
                                {{ collapse.button.text || '' }}
                            </el-button>
                        </div>
                        <slot v-else :name="collapse.buttonSlotName" />
                    </div>
                </template>
                <slot :name="collapse.slotName"/>
            </el-collapse-item>
        </el-collapse>
    </div>
</template>

<script>
    export default {
        name: 'CollapseTabLayout',
        props: {
            /**
             * 是否显示标签页,如果不显示则必须传入 collapseList
             * */
            showTab: {
                type: Boolean,
                default: false
            },
            maxHeight: {
              type: String,
              default: '600px'
            },
            /**
             * 标签页数据列表
             * tabList: [
             *    {
             *      label: 标签标题,
             *      slotName: 无折叠面板时本标签页内的组件插槽名称,
             *      // 本标签页内的折叠面板数组
             *      collapseList: [
             *        title: 折叠面板标题,
             *        disabled: 不允许折叠, 永远展开
             *        // 标题旁的额外点击按钮, 为false时不显示
             *        button: {
             *          type: 按钮类型,
             *          text: 按钮文字,
             *          icon: 图标,
             *          style: 样式,
             *          click: () => {}
             *        },
             *        buttonSlotName: 不适用固定按钮时, 按钮区域的组件插槽名称,
             *        slotName: 本折叠面板内的组件插槽名称
             *      ]
             *    }
             *    ...
             *    ...
             * ]
             * */
            tabList: {
                type: Array,
                default: () => []
            },
            /** */
            collapseList: {
                type: Array,
                default: () => []
            }
        },
        data: function() {
            return {
                activeTab: '0',
                activeCollapse: {},
                activeCollapse_: []
            }
        },
        watch: {
            activeTab: {
                immediate: true,
                deep: true,
                handler(index) {
                    index = Number(index)
                    if (this.showTab) {
                        if (this.tabList[index] && this.tabList[index].collapseList) {
                            this.allExpand(this.tabList[index].name, this.tabList[index].collapseList)
                        }
                    }
                }
            }
        },
        mounted() {
            if (this.showTab) {
                if (this.tabList[0] && this.tabList[0].collapseList) {
                    this.allExpand(this.tabList[0].name, this.tabList[0].collapseList)
                }
            } else {
                if (this.collapseList && this.collapseList.length) {
                    this.activeCollapse_ = []
                    this.collapseList.map((item, index) => {
                        this.activeCollapse_.push(String(index))
                    })
                }
            }
        },
        methods: {
            allExpand(onlyKey, list) {
                this.activeCollapse[onlyKey] = []
                list.map((item, index) => {
                    this.activeCollapse[onlyKey].push(String(index))
                })
            },
            stop(event) {
                event.stopPropagation()
            }
        }
    }
</script>

<style lang="scss">
/* 弹窗 -> 标题折叠 样式*/
.collapse-layout-skn2cpa {
  .el-tabs__content {
    max-height: 600px;
    overflow: auto;
  }
  .maxHeight {
    max-height: 600px;
    overflow: auto;
  }
  .container__label {
    padding: 0 10px;
    height: 35px;
    display: flex;
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    .container__title {
      font-size: 13px;
      &:before {
        height: 10px;
        content: '';
        width:0;
        border-left: 3px solid #2abeff;
        margin-right: 10px;
      }
    }
  }
  .el-collapse {
    border-top: 0 solid #EBEEF5;
    border-bottom: 0 solid #EBEEF5;
     .el-collapse-item {
      margin-bottom: 10px;
       .el-collapse-item__header {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        height: 36px;
        line-height: 36px;
        background-color: #f5f7fa;
        color: #303133;
        cursor: pointer;
        border-bottom: 0 solid #EBEEF5;
        font-size: 13px;
        font-weight: 500;
        -webkit-transition: border-bottom-color .3s;
        transition: border-bottom-color .3s;
        outline: 0;
      }
      .el-collapse-item__wrap {
        will-change: height;
        overflow: hidden;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        border-bottom: 0 solid #EBEEF5;
        padding: 10px 5px;
      }
      .el-collapse-item__content {
        padding-bottom: 0;
      }
    }
    .enabled .el-collapse-item__arrow {
      margin: 0 8px 0 auto;
      transition: -webkit-transform .3s;
      transition: transform .3s;
      transition: transform .3s,-webkit-transform .3s;
      font-weight: 300;
      color: #006bfe !important;
    }
    .disabled .el-collapse-item__arrow {
      margin: 0 8px 0 auto;
      transition: -webkit-transform .3s;
      transition: transform .3s;
      transition: transform .3s,-webkit-transform .3s;
      font-weight: 300;
      color: #7f7f7f !important;
    }
  }
}
</style>
