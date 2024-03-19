<!--
* @description 行业管理
* @fileName addEditDialog.vue
* @author Herux
* @date 2020/09/11
* @version V1.0.0
!-->
<template>
  <div class="dialog-container">
    <el-dialog
      :title="str+'行业'"
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
                <el-form-item label="标识ID" prop="industryId">
                  <el-input disabled v-model="formData.industryId" clearable/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :xs="24" :span="24">
                <el-form-item label="行业编码" prop="industryCode">
                  <el-input v-model="formData.industryCode" clearable/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :xs="24" :span="24">
                <el-form-item label="行业名称" prop="industryName">
                  <el-input v-model="formData.industryName" clearable/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :xs="24" :span="24">
                <el-form-item label="类型树" prop="classTreeId">
                  <el-select
                    @change="ChangeClassTree"
                    filterable
                    placeholder="请选择关联类型树"
                    size="mini"
                    style="width:100%"
                    v-model="formData.classTreeId"
                  >
                    <el-option
                      :key="item.classTreeId"
                      :label="item.name"
                      :value="item.classTreeId"
                      v-for="item in classTreeData"
                    ></el-option>
                  </el-select>
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
                <el-form-item label="排序" prop="sort">
                  <el-input v-model="formData.sort" clearable/>
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
  import {addOrEdit, getInfo} from "@/api/systemSet/industry/index";
  import { getCtdList } from "@/api/systemSet/class/index";

  export default {
    name: "handlerIndustry",
    directives: {waves, prereclick},
    mounted() {

    },
    data() {
      return {
        pagination: {
          records: 0,
          pageIndex: 0,
          ageTotal: 0
        },
        formData: {
          industryId: '',
          industryName: '',
          industryCode: '',
          classTreeId: '',
          remark: '',
          appId: '',
          sort: 0
        },
        formRules: {
          industryCode: [
            {
              required: true,
              trigger: "change",
              message: "请填写行业编码"
            }
          ],
          industryName: [
            {
              required: true,
              trigger: "change",
              message: "请填写行业名称"
            }
          ],
          classTreeId: [
            {
              trigger: "change",
              message: "请关联类型树"
            }
          ]
        },
        enumNameDisabled: false,
        classTreeData: []
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
      }
    },
    watch: {
      editInfoObj: {
        immediate: true,
        handler(val) {
          if (val != null) {
            if (val.uuid) {
              getInfo({guid: val.uuid}).then(res => {
                if (res.data.success) {
                  this.formData = Object.assign(
                    this.formData,
                    res.data.data
                  );
                }
              });
            } else {
              this.formData.appId = val.appId;
            }
          } else {
            return false;
          }
        }
      },
    },
    components: {},
    created() {
      this.getCtdList()
    },
    methods: {
      ChangeClassTree(){

      },
      getCtdList() {
          getCtdList().then(res => {
            if (res.data.success) {
              this.classTreeData = res.data.data
            }
          });
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
        this.formData.appId = this.editInfoObj.appId;
        this.$refs["form"].validate(valid => {
          if (valid) {
            addOrEdit(this.formData).then(res => {
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
