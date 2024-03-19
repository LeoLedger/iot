<template>
  <div class="dialog-container classSfix">
    <el-dialog
      :visible.sync="visible"
      :title="title"
      :before-close="simpleClose"
      width="400px"
    >
      <el-tabs style="margin-right: 70px;">
        <el-form
          ref="form"
          :rules="formRules"
          :model="formData"
          label-width="100px"
          class="form-container"
          size="mini"
        >
          <el-row
            type="flex"
            justify="center"
          >
            <el-col
              :xs="24"
              :lg="24"
            >
              <el-row>
                <el-form-item label="ID" prop="id">
                  <el-input v-model="formData.id" :disabled="true" clearable />
                </el-form-item>
              </el-row>
              <el-row>
                <el-form-item label="名称" prop="name">
                  <el-input v-model="formData.name" style="width:100%" />
                </el-form-item>
              </el-row>
              <el-row>
                <el-form-item label="描述" prop="desc">
                  <el-input v-model="formData.desc" type="textarea" clearable />
                </el-form-item>
              </el-row>
            </el-col>
          </el-row>
        </el-form>
      </el-tabs>
      <span slot="footer">
        <el-button size="mini" @click="simpleClose">取 消</el-button>
        <el-button type="primary" size="mini" @click="submitClass">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import {
  getCtdInfo,
  addOrEditCtd
} from '@/api/systemSet/class/index'

export default {
  name: 'Xxxx',
  components: {},
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    editCtdId: {
      type: String,
      default: null
    },
    title: {
      type: String
    }
  },
  data() {
    return {
      formData: {
        id: '',
        classTreeId: '',
        name: '',
        desc: ''
      },
      formRules: {
        name: [
          {
            required: true,
            trigger: 'change',
            message: '请填写名称'
          }
        ]
      }
    }
  },
  watch: {
    editCtdId: {
      immediate: true,
      handler(val) {
        if (val != null) {
          getCtdInfo({ ctdId: val }).then(res => {
            if (res && res.data.success) {
              this.formData = Object.assign(
                this.formData,
                res.data.data
              )
            }
          })
        } else {
          return false
        }
      }
    }
  },
  created() {
  },
  methods: {
    // 直接关闭
    simpleClose() {
      this.$emit('closeCtd', false)
    },
    submitClass() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          addOrEditCtd(this.formData).then(res => {
            if (res.data.success) {
              this.$notify({
                title: '成功',
                message: '操作成功',
                type: 'success',
                duration: 2000
              })
              this.$emit('closeCtd', true)
            } else {
              this.$notify({
                title: '失败',
                message: '数据验证失败',
                type: 'warning',
                duration: 2000
              })
            }
          })
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style lang='scss'>
    .classSfix {
        .el-tabs__header {
            margin-bottom: 8px;
        }
        .el-tabs__content {
            height: 400px;
        }
    }
</style>
