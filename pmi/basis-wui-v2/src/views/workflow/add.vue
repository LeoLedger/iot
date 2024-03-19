<template>
  <div class="box-container">
    <add-dialog
      :visible="addVisible"
      :title="title"
      @closeApp="closeAdd"
    />
  </div>
</template>

<script>
import addDialog from './components/addEditDialog'

export default {
  name: 'Add',
  components: {
    addDialog
  },
  props: {
    addVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const params = {}
    return {
      params,
      // 配置弹窗
      title: '新增流程'
    }
  },
  methods: {
    closeAdd(bool) {
      this.$emit('closeAddApp', bool)
    }
  }
}
</script>

<style scoped>

</style>
