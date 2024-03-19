<template>
  <div class="box-container">
    <editCtdDialog
      :visible="editCtdVisible"
      :title="title"
      :edit-ctd-id="editCtdId"
      @closeCtd="closeAdd"
    />
  </div>
</template>

<script>
import editCtdDialog from './components/ctdAddEditDialog'
export default {
  name: 'CtdDialog',
  components: {
    editCtdDialog
  },
  props: {
    editCtdVisible: {
      type: Boolean,
      default: false
    },
    editCtdId: {
      type: String
    }
  },
  data() {
    const { formData } = this.$props
    const params = {}
    const forms = []
    return {
      params,
      // 配置弹窗
      title: '修改自定义树',
      forms,
      formOptions: {
        submitBtnText: '提交',
        showCancelBtn: true
      }
    }
  },
  watch: {
    editCtdVisible: {
      handler(value) {
        console.log(value, 'xxxxxxxssnsnseditCtdVisible editCtdVisible')
      }
    },
    formData: {
      handler: function(newData, oldData) {
        // this.changeFormData(newData)
      }
    }
  },
  created() {
  },
  methods: {
    closeAdd(isRefresh) {
      this.$emit('closeEditCtd', isRefresh)
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
