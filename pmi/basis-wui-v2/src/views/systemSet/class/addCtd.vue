<template>
  <div class="box-container">
    <ctdDialog
      :visible="addCtdVisible"
      :title="title"
      @closeCtd="closeAdd"
    />
  </div>
</template>

<script>
import ctdDialog from './components/ctdAddEditDialog'
export default {
  name: 'CtdAddEditDialog',
  components: {
    ctdDialog
  },
  props: {
    addCtdVisible: {
      type: Boolean,
      default: false
    },
    formData: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    const { formData } = this.$props
    const params = {}
    const forms = []
    return {
      params,
      // 配置弹窗
      title: '添加自定义树',
      forms,
      formOptions: {
        submitBtnText: '提交',
        showCancelBtn: true
      }
    }
  },
  watch: {
    formData: {
      handler: function(newData, oldData) {
        this.changeFormData(newData)
      }
    }
  },
  created() {
  },
  methods: {
    closeAdd(isRefresh) {
      this.$emit('closeAddCtd', isRefresh)
    }
  }
}
</script>

<style lang='scss' scoped>
    .FormConfig {
        .el-input-number {
            width: 100%;
        }
        .footer {
            padding-top: 10px;
            border-top: 1px solid #dcdfe6;
            text-align: right;
        }
        .el-col {
            border-bottom: 0;
        }
    }
    .tip {
        padding-left: 80px;
        color: #aaa;
    }
</style>
