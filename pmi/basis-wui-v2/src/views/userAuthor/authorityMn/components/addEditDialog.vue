<!--
* @description 权限操作
* @fileName addEditDialog.vue
* @author 叶金龙
* @date 2019/06/19 13:20:34
* @version V1.0.0
!-->
<template>
  <div class="dialog-container">
    <el-dialog
      :title="str+'权限'"
      :visible.sync="authVisible"
      width="600px"
      :before-close="beforeClose"
    >
      <el-form
        ref="form"
        :rules="formRules"
        :model="formData"
        label-width="80px"
        class="form-container"
        size="mini"
      >
        <el-row type="flex" justify="center">
          <el-col :xs="24" :lg="24">
            <el-row>
              <el-col :xs="24" :span="24">
                <el-form-item label="标识ID" prop="privilegeId">
                  <el-input disabled v-model="formData.privilegeId" clearable/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :xs="24" :span="24">
                <el-form-item label="权限名称" prop="name">
                  <el-input v-model="formData.name" clearable @blur="getCode"/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :xs="24" :span="24">
                <el-form-item label="权限编码" prop="code">
                  <el-input v-model="formData.code" disabled clearable/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :xs="24" :span="24">
                <el-form-item label="父权限" prop="privilegePid">
                  <el-cascader v-model="formData.privilegePid" :options="treeData"
                               :props="{checkStrictly: true,emitPath:false,expandTrigger:'hover'}"
                               clearable filterable style="width: 100%"/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :xs="24" :span="24">
                <el-form-item label="枚举名称" prop="enumName">
                  <el-input v-model="formData.enumName" clearable placeholder="格式：程序_模块_名称"
                            :disabled="enumNameDisabled"/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :xs="24" :span="24">
                <el-form-item label="备注" prop="remark">
                  <el-input
                    type="textarea"
                    v-model="formData.remark"
                    rows="3"
                    clearable
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :xs="24" :span="24">
                <el-form-item label="排序" prop="orderNum">
                  <el-input v-model="formData.orderNum" clearable/>
                </el-form-item>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer">
                <el-button @click="simpleClose" v-waves size="mini">取 消</el-button>
                <el-button type="primary" @click="submitAuth" v-waves v-prereclick size="mini">确 定</el-button>
            </span>
    </el-dialog>
  </div>
</template>

<script>
  import waves from "@/directive/waves"; // Waves directive;
  import prereclick from "@/directive/prereclick"; // prereclick directive;
  import {handlerAuth, getAuthInfo} from "@/api/userAuthor/authorityMn/index";
  import {getCode} from "@/api/resource";

  export default {
    name: "handlerAuth",
    directives: {waves, prereclick},
    mounted() {
      console.info(this.editInfoObj)
    },
    data() {
      return {
        pagination: {
          records: 0,
          pageIndex: 0,

          ageTotal: 0
        },
        formData: {
          privilegeId: '',
          privilegePid: '',
          name: '',
          code: '',
          enumName: null,
          remark: '',
          appId: '',
          orderNum: 0
        },
        formRules: {
          name: [
            {
              required: true,
              trigger: "change",
              message: "请填写权限名称"
            }
          ],
          privilegePid: [
            {
              //required: true,
              trigger: "change",
              message: "请选择父权限"
            }
          ]
        },
        enumNameDisabled: false
      };
    },
    props: {
      authVisible: {
        type: Boolean,
        default: false
      },
      str: {
        type: String
      },
      editInfoObj: {
        type: Object
      },
      treeData: {
        type: Array
      },
    },
    watch: {
      editInfoObj: {
        immediate: true,
        handler(val) {
          if (val != null) {
            if (val.uuid) {
              getAuthInfo(val.uuid).then(res => {
                if (res.data.success) {
                  this.formData = Object.assign(
                    this.formData,
                    res.data.data
                  );
                  if (this.formData.enumName) {
                    this.enumNameDisabled = true;
                  } else {
                    this.formData.enumName = this.editInfoObj.appCode + '_'
                  }
                }
              });
            } else {
              this.formData.appId = val.appId;
              this.formData.enumName = this.editInfoObj.appCode + '_'
            }
          } else {
            return false;
          }
        }
      },
    },
    components: {},
    methods: {
      getCode() {
        if (this.formData.name != undefined) {
          let val = encodeURI(this.formData.name, 'utf-8');
          getCode({name: val}).then(res => {
            if (res.data.success) {
              this.formData.code = res.data.data
            }
          });
        }
      },
      // 确认关闭
      beforeClose() {
        this.$confirm("确认放弃本次操作？")
          .then(_ => {
            this.$nextTick(() => {
              this.$emit("closeAuth", false);
            });
          })
          .catch(_ => {
            return false;
          });
      },
      // 直接关闭
      simpleClose() {
        this.$emit("closeAuth", false);
      },

      // 提交权限
      submitAuth() {
        this.$refs["form"].validate(valid => {
          if (valid) {
            handlerAuth(this.formData).then(res => {
              if (res.data.success) {
                this.$notify({
                  title: "成功",
                  message: this.str + "成功",
                  type: "success",
                  duration: 2000
                });
                this.$emit("closeAuth", true);
              } else {
                this.$message.error(res.data.msg)
              }
            });
          } else {

            return false;
          }
        });
      }
    }
  };
</script>

<style lang='scss'>
</style>
