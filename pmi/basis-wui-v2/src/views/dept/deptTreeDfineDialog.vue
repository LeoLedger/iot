<template>
  <div class="dialog-container">
    <el-dialog :visible.sync="visible" :title="dialogTitle+'部门树'" :deptTreeDefineObj="deptTreeDefineObj"
               :before-close="closeDialog" width="40%">
      <el-form :model="dataForm" :rules="rules" ref="dataForm" label-width="70px" size="mini" style="height: 500px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="dataForm.name"/>
        </el-form-item>
        <el-form-item label="排序号" prop="orderNum">
          <el-input-number v-model="dataForm.orderNum" style="width: 100%"/>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="dataForm.remark"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer">
        <el-button @click="closeDialog" size="mini">取 消</el-button>
        <el-button @click="submitForm" size="mini" type="primary">提 交</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import {saveDeptTreeDefine} from '@/api/dept/deptTreeDefine/index';

  export default {
    name: "add",
    data() {
      return {
        dataForm: {
          name: null,
          orderNum: 0,
          remark: null
        },
        rules: {
          name: [{required: true, message: '请输入名称', trigger: 'blur'}],
          remark: [{required: true, message: '请输入备注', trigger: 'blur'}]
        }
      }
    },
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      dialogTitle: {
        type: String
      },
      deptTreeDefineObj: {
        type: Object
      }
    },
    mounted() {
      if (this.deptTreeDefineObj) {
        Object.assign(this.dataForm, this.deptTreeDefineObj);
      }
    },
    methods: {
      closeDialog(isFlush) {
        this.$emit("closeDialog", isFlush);
      },
      submitForm() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            saveDeptTreeDefine(this.dataForm).then(res => {
              if (res.data.success) {
                this.$message({
                  showClose: true,
                  message: '提交成功',
                  type: 'success'
                });
                this.closeDialog(true);
              } else {
                this.$message({
                  showClose: true,
                  message: '错误：' + res.data.msg,
                  type: 'error'
                });
              }
            });
          }
        });
      }
    }
  }
</script>

<style scoped>

</style>
