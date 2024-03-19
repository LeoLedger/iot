<template>
  <div class="box-container">
    <AddDeptItem
      :visible="addDialogVisible"
      :dialog-title="dialogTitle"
      :dept-id="deptId"
      @closeDialog="closeDialog"
    />
  </div>
</template>

<script>
import AddDeptItem from './components/addEditDeptItem'

export default {
  name: 'Add',
  components: {
    AddDeptItem
  },
  props: {
    addDialogVisible: {
      type: Boolean,
      default: false
    },
    dialogTitle: {
      type: String,
      default: ''
    },
    deptId: {
      type: String
    }
  },
  data() {
    return {
      searchParam: {}
    }
  },
  methods: {
    closeDialog(isFlush) {
      this.$emit('closeAddDialog', isFlush)
    }
  }
}
</script>

<style scoped>

</style>
