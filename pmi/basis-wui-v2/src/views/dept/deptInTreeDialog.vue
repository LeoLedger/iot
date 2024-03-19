<template>
  <div class="dialog-container">
    <el-dialog :visible.sync="visible" title="调入部门树" :before-close="closeDialog" width="40%">
      <el-form :model="dataForm" :rules="rules" ref="dataForm" label-width="70px" size="mini"
               style="height: 500px" v-loading="loading">
        <el-form-item label="部门" prop="deptId">
          <el-cascader v-model="dataForm.deptId" :options="deptTree" ref="deptIdSelect"
                       :props="{checkStrictly: true,emitPath:false}"
                       clearable filterable style="width: 100%" @change="getCheckedNodes"></el-cascader>
          <el-checkbox v-model="dataForm.incloudChild">包括子部门</el-checkbox>
        </el-form-item>
        <el-form-item label="父节点" prop="deptPid">
          <el-cascader v-model="dataForm.deptPid" :options="inTreeList" :props="{checkStrictly: true,emitPath:false}"
                       clearable filterable style="width: 100%"></el-cascader>
        </el-form-item>
        <el-form-item label="排序值" prop="orderNum">
          <el-input-number v-model="dataForm.orderNum" style="width: 100%"/>
        </el-form-item>
      </el-form>

      <span slot="footer">
        <el-button @click="closeDialog" size="mini">取 消</el-button>
        <el-button size="mini" type="primary" @click="submitForm">提 交</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import {getDeptTree} from '@/api/dept/index';
  import {saveDeptInTree} from '@/api/dept/deptInTree/index';

  export default {
    name: "deptInTreeDialog",
    data() {
      return {
        loading: false,
        dataForm: {
          deptId: null,
          deptName: null,
          deptPid: null,
          orderNum: 0,
          level: 0,
          code: null,
          deptTreeId: null,
          isVirtual: 0,
          incloudChild: false,
        },
        rules: {
          deptId: [{required: true, message: '请选择部门', trigger: 'blur'}]
        },
        deptTree: []
      }
    },
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      deptTreeId:{
        type: String
      },
      inTreeList:{
        type: Array
      }
    },
    mounted() {
      this.dataForm.deptTreeId = this.deptTreeId;
      this.getDeptTree();
    },
    methods: {
      // closeDialog(isFlush,type) {
      //   this.$emit("closeDialog", isFlush, type);
      // },
      closeDialog() {
        this.$emit("closeDialog", true, 'intree');
      },
      //获取部门数据
      getDeptTree() {
        getDeptTree().then(res => {
          if (res && res.data.success) {
            this.deptTree = res.data.data;
          } else {
            this.$message({
              showClose: true,
              message: '获取部门数据失败',
              type: 'error'
            });
          }
        });
      },
      getCheckedNodes() {
        this.dataForm.code = this.$refs['deptIdSelect'].getCheckedNodes(true)[0].data.level;
        this.dataForm.level = this.$refs['deptIdSelect'].getCheckedNodes(true)[0].level;
        this.dataForm.deptName = this.$refs['deptIdSelect'].getCheckedNodes(true)[0].label;
      },
      //调入
      submitForm() {
        this.loading = true;
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            saveDeptInTree(this.dataForm).then(res => {
              if (res.data.success) {
                this.loading = false;
                this.$message({
                  showClose: true,
                  message: '提交成功',
                  type: 'success'
                });
                this.closeDialog(true, 'intree');
              } else {
                this.$message({
                  showClose: true,
                  message: '错误：' + res.data.msg,
                  type: 'error'
                });
              }
              this.loading = false
            });
          }
        });
      }
    }
  }
</script>

<style scoped>

</style>
