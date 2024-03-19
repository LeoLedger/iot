<template>
  <div class="no-data-page" :style="{height: height}">
    <div class="icon el-icon-warning-outline" />
    <div class="text">{{text}}</div>
  </div>
</template>

<script>
  export default {
    name: 'NoData',
    props: {
      text: {
        type: String,
        default: '暂无数据'
      },
      height: {
        type: String,
        default: '100px'
      }
    }
  }
</script>

<style scoped lang="scss">
.no-data-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  .icon {
    margin-bottom: 5px;
    font-size: 36px;
    color: #ccc;
  }
  .text {
    font-size: 14px;
    color: #909399;
  }
}
</style>
