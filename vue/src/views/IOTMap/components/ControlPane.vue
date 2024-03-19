<template>
    <div v-if="visible" :class="themeType?'control-pane-dark':'control-pane'">
        <div class="close-btn el-icon-close" @click="$emit('update:visible', false)"/>
        <div class="control-pane-item">
            <div class="label">地图显示</div>
            <div class="content">
                <div
                    v-for="item in enums.mapTypeOptions"
                    :key="item.id"
                    :class="{ active: mapConfig.mapTypeId === item.id }"
                    class="map-type-button-check"
                    @click="handleMapTypeChange(item)"
                >
                    <div :class="item.icon" class="icon"/>
                    <div class="text">{{ item.label }}</div>
                </div>
            </div>
        </div>
        <div class="control-pane-item">
            <div class="label">图层显示方式</div>
            <div class="content">
                <div
                    v-for="item in enums.mapTileOptions"
                    :key="item.value"
                    class="map-tile-radio"
                    @click="handleMapTileChange(item.value)">
                    <div class="icon">
                        <div :class="mapConfig.mapTile === item.value ? 'isChecked':'isNoChecked'"/>
                    </div>
                    <div class="text">{{ item.label }}</div>
                </div>
            </div>
        </div>
        <div v-if="!showDetailDisabled" class="control-pane-item" style="flex-direction: row;justify-content: space-between">
            <div class="label">显示概要信息</div>
            <div class="content">
                <div :class="mapConfig.showDetail?'isChecked':'isNoChecked'" class="map-switch" @click="mapConfig.showDetail = !mapConfig.showDetail">
                    <div class="slide"/>
                </div>
            </div>
        </div>
        <div class="control-pane-item">
            <div class="label">销售模式</div>
            <div class="content-start" >
                <div
                    v-for="item in enums.salesType"
                    :key="item.value"
                    :class="{ active: mapSearchForm.sectionSalesType === item.value }"
                    class="map-button-check"
                    @click="handleSalesTypeChange(item.value)"
                >{{ item.label }}</div>
            </div>
        </div>
        <div class="control-pane-item">
            <div class="select-item">
                <div class="select-item-label">产品类型</div>
                <el-select
                    v-model="mapSearchForm.productType"
                    :remote-method="remoteProductType"
                    :popper-class="themeType?'select-item-popper':''"
                    class="select-item-select"
                    multiple
                    collapse-tags
                    remote
                    placeholder=""
                    filterable
                    @change="emitChange(mapSearchForm)">
                    <el-option
                        v-for="item in productTypeList"
                        :key="item.dictId"
                        :label="item.dictName"
                        :value="item.dictId"/>
                </el-select>
                <div
                    v-if="mapSearchForm.productTypeList && mapSearchForm.productTypeList.length > 0"
                    class="select-item-clear el-icon-close"
                    @click="clearInput('productTypeList')"
                />
                <div class="select-item-arrow el-icon-arrow-right"/>
            </div>
            <div v-if="showRegionSelect" class="select-item">
                <div class="select-item-label">城市</div>
                <el-select
                    v-model="mapSearchForm.sonMapIds"
                    :popper-class="themeType?'select-item-popper':''"
                    class="select-item-select"
                    multiple
                    collapse-tags
                    placeholder=""
                    @change="emitChange(mapSearchForm)">
                    <el-option
                        v-for="item in regionList"
                        :key="item.mapId"
                        :label="item.name"
                        :value="item.mapId">
                        <span>{{ item.name }}</span>
                        <span style="float: right;margin-right: 20px">{{ item.count }}台</span>
                    </el-option>
                </el-select>
                <div
                    v-if="mapSearchForm.regionList && mapSearchForm.regionList.length > 0"
                    class="select-item-clear el-icon-close"
                    @click="clearInput('regionList')"
                />
                <div class="select-item-arrow el-icon-arrow-right"/>
            </div>
            <div class="select-item">
                <div class="select-item-label">客户</div>
                <el-select
                    v-model="mapSearchForm.customerIds"
                    :remote-method="remoteCustomer"
                    :popper-class="themeType?'select-item-popper':''"
                    class="select-item-select"
                    multiple
                    collapse-tags
                    remote
                    placeholder=""
                    filterable
                    @change="emitChange(mapSearchForm)">
                    <el-option
                        v-for="item in customerList"
                        :key="item.guidId"
                        :label="item.name"
                        :value="item.guidId"/>
                </el-select>
                <div
                    v-if="mapSearchForm.customerList && mapSearchForm.customerList.length > 0"
                    class="select-item-clear el-icon-close"
                    @click="clearInput('customerList')"
                />
                <div class="select-item-arrow el-icon-arrow-right"/>
            </div>
            <div class="select-item">
                <div class="select-item-label">项目</div>
                <el-select
                    v-model="mapSearchForm.projectIds"
                    :remote-method="remoteProject"
                    :popper-class="themeType?'select-item-popper':''"
                    class="select-item-select"
                    multiple
                    collapse-tags
                    remote
                    placeholder=""
                    filterable
                    @change="emitChange(mapSearchForm)">
                    <el-option
                        v-for="item in projectList"
                        :key="item.guidId"
                        :label="item.projectName"
                        :value="item.guidId"/>
                </el-select>
                <div
                    v-if="mapSearchForm.projectList && mapSearchForm.projectList.length > 0"
                    class="select-item-clear el-icon-close"
                    @click="clearInput('projectList')"
                />
                <div class="select-item-arrow el-icon-arrow-right"/>
            </div>
        </div>
        <div class="footer">
            <div class="normal-btn" @click="$emit('reset')">重置</div>
            <div class="primary-btn" @click="$emit('save', { mapSearchForm, mapConfig })">保存</div>
        </div>
    </div>
</template>

<script>
    import enums from '@/views/IOTMap/components/enums'
    import enums2 from '@/utils/enum'
    import deviceApi from '@/api/inventory/device'
    import customerApi from '@/api/PM/customer'
    import projectApi from '@/api/PM/project'
    import IOTMapApi from '@/api/IOTMap/index'
    export default {
        name: 'ControlPane',
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            // 地图配置
            mapConfig: {
                type: Object,
                default: () => {}
            },
            // 主题样式
            themeType: {
                type: Number,
                default: 0
            },
            // 过滤对象
            mapSearchForm: {
                type: Object,
                default: () => {}
            },
            // regionList
            regionList: {
                type: Array,
                default: () => []
            }
        },
        data() {
            return {
                enums,
                enums2,
                productTypeList: [],
                customerList: [],
                projectList: [],
                showRegionSelect: false
            }
        },
        computed: {
            // 是否禁止显示详情
            showDetailDisabled() {
                return this.mapConfig.mapTile > 1
            }
        },
        watch: {
            mapConfig: {
                deep: true,
                immediate: true,
                handler() {
                    this.getRegion()
                }
            }
        },
        mounted() {
            this.remoteProductType(' ')
            this.remoteCustomer(' ')
            this.remoteProject(' ')
            this.getRegion()
        },
        methods: {
            clearInput(prop) {
                this.mapSearchForm[prop] = null
            },
            handleMapTypeChange(item) {
                this.mapConfig.mapTypeId = item.id
                this.mapConfig.mapType = item.mapType
                this.$emit('mapStyleChange', item)
                this.$emit('update', this.mapConfig)
                // this.mapConfig.mapStyle = item.mapStyle
            },
            handleSalesTypeChange(value) {
                // 判断是否已选中
                if (value === this.mapSearchForm.sectionSalesType) {
                    this.mapSearchForm.sectionSalesType = null
                } else {
                    this.mapSearchForm.sectionSalesType = value
                }
                this.emitChange(this.mapSearchForm)
            },
            handleMapTileChange(value) {
                // 图层显示方式为 2 3 时,禁止显示概要信息
                if (value > 1) {
                    this.mapConfig.showDetail = false
                }
                this.mapConfig.mapTile = value
                this.$emit('mapTileChange', value)
            },
            emitChange(form) {
                this.$emit('change', form)
            },
            remoteProductType(value) {
                const params = {
                    dictName: value.trim(),
                    categoryId: 'B16C3151-11D2-4364-8F45-63EFFFFCF424'
                }
                deviceApi.getDictList(params).then(res => {
                    if (res.success) {
                        this.productTypeList = res.data
                    }
                })
            },
            remoteCustomer(value) {
                const params = {
                    name: value.trim()
                }
                customerApi.getList(params).then(res => {
                    if (res.success) {
                        this.customerList = res.data.records
                    }
                })
            },
            remoteProject(value) {
                const params = {
                    projectName: value.trim()
                }
                projectApi.getList(params).then(res => {
                    if (res.success) {
                        this.projectList = res.data.records
                    }
                })
            },
            getRegion() {
                this.showRegionSelect = this.mapConfig.zoom <= 10
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
.control-pane {
  width: 300px;
  height: 570px;
  background-color: white;
  border-radius: 2px;
  box-shadow: 0px 2px 4px 0px #DDDDDD;
  display: flex;
  flex-direction: column;
  padding: 15px;
  position: absolute;
  right: 0;
  left: 0;
  top: 0;
  bottom: 0;
  margin: 60px auto auto;
  margin-left: 10px;
  .control-pane-item {
    display: flex;
    flex-direction: column;
    border-bottom: 1px solid $borderColor;
    margin-bottom: 15px;
    user-select:none;
    .label {
      font-size: 14px;
      margin-bottom: 10px;
    }
    .content {
      margin-bottom: 15px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
    .content-start {
      margin-bottom: 15px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
    }
  }
  // 地图显示
  .map-type-button-check {
    cursor: pointer;
    width: 80px;
    height: 56px;
    background: $noCheckedColor;
    color: $checkedColor;
    border-radius: 2px;
    transition: all .3s ease-in-out;
    opacity: .89;
    .icon {
      font-size: 22px;
    }
    .text {
      font-size: 12px;
    }
    text-align: center;
    display: flex;
    flex-direction: column;
    align-content: center;
    justify-content: center;
    &.active, &:hover {
      opacity: 1;
      background: $checkedColor;
      color: $backgroundColor;
    }
  }
  // 图层显示方式
  .map-tile-radio {
    display: flex;
    flex-direction: row;
    align-items: center;
    cursor: pointer;
    .icon {
      height: 16px;
      width: 16px;
      background: $backgroundColor;
      border-radius: 1px;
      font-size: 16px;
      margin-right: 8px;
      color: $checkedColor;
      padding: 2px;
      border: 1px solid $checkedColor;
      justify-content: center;
      align-items: center;
      line-height: 16px;
      text-align: center;
      display: flex;
      transition: all .3s ease-in-out;
      &:hover {
        background: $backgroundColor;
        .isNoChecked {
          background: $checkedColor;
          height: 8px;
          width: 8px;
        }
      }
      .isChecked {
        background: $checkedColor;
        height: 8px;
        width: 8px;
      }
      .isNoChecked {
        background: $backgroundColor;
        height: 8px;
        width: 8px;
      }
    }
    .text {
      font-size: 12px;
      color: $checkedColor;
    }
  }
  // 显示概要信息
  .map-switch {
    width: 36px;
    height: 18px;
    padding: 2px;
    border-radius: 2px;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all .3s ease-in-out;
    .slide {
      width: 16px;
      height: 16px;
      background-color: $backgroundColor;
      border-radius: 2px;
    }
    &.isChecked {
      background-color: $noCheckedColor;
      justify-content: flex-end;
      .slide {
        background-color: $checkedColor;
        box-shadow: 0px 0px 2px 0px rgba(159, 159, 159, 0.5);
      }
    }
    &.isNoChecked {
      background-color: $noCheckedColor;
      justify-content: flex-start;
      .slide {
        background-color: $backgroundColor;
        box-shadow: 0px 0px 2px 0px rgba(159, 159, 159, 0.5);
      }
    }
  }
  // 销售模式
  .map-button-check {
    cursor: pointer;
    width: 80px;
    height: 24px;
    background: $noCheckedColor;
    color: $checkedColor;
    border-radius: 2px;
    text-align: center;
    line-height: 24px;
    font-size: 12px;
    margin-right: 10px;
    transition: all .3s ease-in-out;
    opacity: .89;
    &.active, &:hover {
      opacity: 1;
      background: $checkedColor;
      color: $backgroundColor;
    }
  }
  // 下拉选择器
  .select-item {
    margin-bottom: 15px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background: $noCheckedColor;
    border-radius: 2px;
    padding-left: 10px;
    position: relative;
    .select-item-label {
      user-select:none;
      width: 50px;
      font-size: 12px;
      color: $checkedColor;
    }
    .select-item-clear {
      position: absolute;
      right: 25px;
      font-size: 14px;
      color: $checkedColor;
      cursor: pointer;
      width: 14px;
      height: 18px;
      line-height: 18px;
      margin: auto;
      z-index: 99;
    }
    .select-item-arrow {
      position: absolute;
      right: 10px;
      font-size: 14px;
      line-height: 16px;
      color: $checkedColor;
      pointer-events: none;
    }
  }
  .select-item-select {
    width: 80%;
    /deep/ .el-select__tags {
      //padding-left: 60px;
    }
    /deep/ .el-input__inner {
      border: 0 solid #DCDFE6;
      background-color: $noCheckedColor;
      //padding-left: 60px !important;
    }
    /deep/ .el-tag--info {
      background-color: #293041;
      max-width: 60px;
      width: auto;
      overflow: hidden;
      border: none;
      color: #ffffff;
      text-overflow:ellipsis;
      white-space: nowrap;
    }
    /deep/ .el-tag__close {
      display: none;
    }
    /deep/ .el-icon-close {
      display: none;
    }
    /deep/ .el-input__suffix {
      display: none;
    }
  }
  .footer {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 60px;
    padding: 15px;
    right: 0;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    .primary-btn {
      cursor: pointer;
      width: 72px;
      height: 30px;
      line-height: 30px;
      background-color: $checkedColor;
      color: $backgroundColor;
      font-size: 14px;
      text-align: center;
      border-radius: 2px;
    }
    .normal-btn {
      cursor: pointer;
      width: 72px;
      height: 30px;
      line-height: 30px;
      background-color: $noCheckedColor;
      color: $checkedColor;
      font-size: 14px;
      margin-right: 10px;
      text-align: center;
      border-radius: 2px;
    }
  }
  .close-btn {
    position: absolute;
    width: 30px;
    height: 30px;
    background: $checkedColor;
    font-size: 16px;
    line-height: 30px;
    text-align: center;
    top: -15px;
    right: -15px;
    border-radius: 50%;
    color: #FFFFFF;
    cursor: pointer;
  }
}

.control-pane-dark {
  width: 300px;
  height: 570px;
  background: #051D2E;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  padding: 15px;
  position: absolute;
  right: 0;
  left: 0;
  top: 0;
  bottom: 0;
  margin: 60px auto auto;
  margin-left: 10px;
  .control-pane-item {
    display: flex;
    flex-direction: column;
    border-bottom: 1px solid;
    border-image: linear-gradient(to right, rgba(0,147,255,0), rgba(0,150,255,0.14), rgba(64,158,255,0)) 30 30;
    margin-bottom: 15px;
    user-select:none;
    color: #FFFFFF;
    .label {
      font-size: 14px;
      margin-bottom: 10px;
    }
    .content {
      margin-bottom: 15px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
    .content-start {
      margin-bottom: 15px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
    }
  }
  // 地图显示
  .map-type-button-check {
    cursor: pointer;
    width: 80px;
    height: 56px;
    background: radial-gradient(circle, rgba(0, 147, 255, 0.5) 0%, rgba(44, 255, 223, 0) 100%);
    border-radius: 4px;
    border: 1px solid;
    border-image: radial-gradient(circle, rgba(120, 231, 255, 1), rgba(67, 202, 255, 0.11)) 1 1;
    transition: all .3s ease-in-out;
    opacity: .89;
    .icon {
      color: #2CE2FF;
      font-size: 22px;
    }
    .text {
      color: #9FD7FC;
      font-size: 12px;
    }
    text-align: center;
    display: flex;
    flex-direction: column;
    align-content: center;
    justify-content: center;
    &.active, &:hover {
      opacity: 1;
      background: rgba(44, 255, 223, 0.4);
      border-radius: 2px;
      border: 1px solid;
      border-image: radial-gradient(circle, rgba(44, 255, 223, 1), rgba(44, 255, 223, 0.24)) 1 1;
    }
  }
  // 图层显示方式
  .map-tile-radio {
    display: flex;
    flex-direction: row;
    align-items: center;
    cursor: pointer;
    .icon {
      height: 16px;
      width: 16px;
      background: radial-gradient(circle, rgba(0, 147, 255, 0.5) 0%, rgba(44, 255, 223, 0) 100%);
      border-radius: 2px;
      border: 1px solid rgba(120, 231, 255, 0.2);
      font-size: 16px;
      margin-right: 8px;
      color: $checkedColor;
      padding: 2px;
      justify-content: center;
      align-items: center;
      line-height: 16px;
      text-align: center;
      display: flex;
      transition: all .3s ease-in-out;
      &:hover {
        background: radial-gradient(circle, rgba(0, 147, 255, 0.5) 0%, rgba(44, 255, 223, 0) 100%);
        .isNoChecked {
          background: #2CFFDF;
          height: 8px;
          width: 8px;
        }
      }
      .isChecked {
        background: #2CFFDF;
        height: 8px;
        width: 8px;
      }
      .isNoChecked {
        background: radial-gradient(circle, rgba(0, 147, 255, 0.5) 0%, rgba(44, 255, 223, 0) 100%);
        height: 8px;
        width: 8px;
      }
    }
    .text {
      font-size: 12px;
      color: #FFFFFF;
    }
  }
  // 显示概要信息
  .map-switch {
    width: 36px;
    height: 18px;
    padding: 2px;
    border-radius: 2px;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all .3s ease-in-out;
    .slide {
      width: 16px;
      height: 16px;
      border-radius: 2px;
      box-shadow: 0px 0px 2px 0px rgba(159, 159, 159, 0.5);
    }
    &.isChecked {
      background: radial-gradient(circle, rgba(0, 147, 255, 0.5) 0%, rgba(44, 255, 223, 0) 100%);
      justify-content: flex-end;
      .slide {
        background-color: rgba(44, 255, 223, 1);
      }
    }
    &.isNoChecked {
      background: radial-gradient(circle, rgba(0, 147, 255, 0.5) 3%, rgba(44, 255, 223, 0) 100%);
      justify-content: flex-start;
      .slide {
        background-color: $backgroundColor;
      }
    }
  }
  // 销售模式
  .map-button-check {
    cursor: pointer;
    width: 80px;
    height: 24px;
    background: radial-gradient(circle, rgba(0, 147, 255, 0.5) 0%, rgba(44, 255, 223, 0) 100%);
    color: #9FD7FC;
    border-radius: 4px;
    border: 1px solid;
    border-image: radial-gradient(circle, rgba(120, 231, 255, 1), rgba(67, 202, 255, 0.11)) 1 1;
    text-align: center;
    line-height: 24px;
    font-size: 12px;
    margin-right: 10px;
    transition: all .3s ease-in-out;
    opacity: .89;
    &.active, &:hover {
      opacity: 1;
      background: rgba(44, 255, 223, 0.4);
      border-image: radial-gradient(circle, rgba(44, 255, 223, 1), rgba(44, 255, 223, 0.24)) 1 1;
    }
  }
  // 下拉选择器
  .select-item {
    margin-bottom: 15px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background: radial-gradient(circle, rgba(0, 147, 255, 0.5) 0%, rgba(44, 255, 223, 0) 100%);
    padding-left: 10px;
    position: relative;
    border-radius: 4px;
    border: 1px solid;
    border-image: radial-gradient(circle, rgba(120, 231, 255, 1), rgba(67, 202, 255, 0.11)) 1 1;
    .select-item-label {
      color: #9FD7FC;
      user-select:none;
      width: 50px;
      font-size: 12px;
    }
    .select-item-clear {
      position: absolute;
      right: 25px;
      font-size: 14px;
      color: #FFFFFF;
      cursor: pointer;
      width: 14px;
      height: 18px;
      line-height: 18px;
      margin: auto;
      z-index: 99;
    }
    .select-item-arrow {
      position: absolute;
      right: 10px;
      font-size: 14px;
      line-height: 16px;
      color: #FFFFFF;
      pointer-events: none;
    }
  }
  .select-item-select {
    width: 80%;
    /deep/ .el-select__tags {
      //padding-left: 60px;
    }
    /deep/ .el-input__inner {
      border: 0 solid #DCDFE6;
      background-color: rgba(0, 147, 255, 0);
      //padding-left: 60px !important;
    }
    /deep/ .el-tag--info {
      background-color: #293041;
      max-width: 60px;
      width: auto;
      overflow: hidden;
      border: none;
      color: #ffffff;
      text-overflow:ellipsis;
      white-space: nowrap;
    }
    /deep/ .el-tag__close {
      display: none;
    }
    /deep/ .el-icon-close {
      display: none;
    }
    /deep/ .el-input__suffix {
      display: none;
    }
  }
  .footer {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 60px;
    padding: 15px;
    right: 0;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    .primary-btn {
      cursor: pointer;
      width: 72px;
      height: 30px;
      line-height: 30px;
      background: radial-gradient(circle, #0093FF 30%, rgba(44, 255, 223, 0) 100%);
      border-radius: 4px;
      border: 1px solid rgba(43, 159, 255, 0.42);
      color: #FFFFFF;
      font-size: 14px;
      text-align: center;
    }
    .normal-btn {
      cursor: pointer;
      width: 72px;
      height: 30px;
      line-height: 30px;
      color: #9FD7FC;
      font-size: 14px;
      margin-right: 10px;
      text-align: center;
      border-radius: 4px;
      border: 1px solid rgba(43, 159, 255, 0.42);
    }
  }
  .close-btn {
    position: absolute;
    width: 30px;
    height: 30px;
    font-size: 16px;
    line-height: 30px;
    text-align: center;
    top: -15px;
    right: -15px;
    border: 1px solid rgba(120, 231, 255, 0.2);
    border-radius: 50%;
    color: #FFFFFF;
    cursor: pointer;
    background: radial-gradient(circle, #0093FF 0%, rgba(44, 255, 223, 0) 100%);
  }
}
</style>
<style lang="scss">
.select-item-popper {
  border: 1px solid;
  border-image: radial-gradient(circle, rgba(120, 231, 255, 1), rgba(67, 202, 255, 0.11)) 1 1 !important;
  border-radius: 4px;
  background: #051D2E !important;
  .el-select-dropdown__item {
    font-size: 14px;
    padding: 0 20px;
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #fff;
    height: 34px;
    line-height: 34px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    cursor: pointer;
    &.hover, &:hover {
      background-color: rgba(67, 202, 255, 0.11);
      color: rgba(120, 231, 255, 1);
    }
    &.selected {
      color: #409EFF!important;
      background-color: rgba(67, 202, 255, 0.11)!important;
      &.hover {
        color: rgba(120, 231, 255, 1)!important;
        background-color: rgba(67, 202, 255, 0.2)!important;
      }
    }
    .popper__arrow {
      border-bottom-color: rgba(67, 202, 255, 0.5) !important;
      &:after {
        border-bottom-color: rgba(67, 202, 255, 0.5) !important;
      }
    }
  }
}
</style>
