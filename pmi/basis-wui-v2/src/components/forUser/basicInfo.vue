<!--
* @description 人员的基础信息
* @fileName basicInfo.vue
* @author 叶金龙
* @date 2019/06/22 10:39:43
* @version V1.0.0
!-->
<template>
  <div class="basicInfo-container">
    <div class="container">
      <el-row type="flex"
        justify="center">
        <el-col :xs="24"
          :lg="24">
          <el-row>
            <el-col :xs="24"
              :span="20">
              <el-form :model="peopleInfo"
                ref="form"
                label-width="100px">
                <el-row>
                  <el-col :xs="24"
                    :span="12">
                    <el-form-item label="姓名"
                      prop="name">
                      <el-input size="mini"
                        :disabled="true"
                        v-model="peopleInfo.name"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24"
                    :span="12">
                    <el-form-item label="账号"
                      prop="userName">
                      <el-input size="mini"
                        :disabled="true"
                        v-model="peopleInfo.loginName"></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :xs="24"
                    :span="12">
                    <el-form-item label="手机号码"
                      prop="phone">
                      <el-input size="mini"
                        :disabled="true"
                        v-model="peopleInfo.phone"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24"
                    :span="12">
                    <el-form-item label="微信ID"
                      prop="weChatId">
                      <el-input size="mini"
                        :disabled="true"
                        v-model="peopleInfo.weChatId"></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :xs="24"
                    :span="12">
                    <el-form-item label="身份证号"
                      prop="idCard">
                      <el-input size="mini"
                        :disabled="true"
                        v-model="peopleInfo.idCard"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24"
                    :span="12">
                    <el-form-item label="密码"
                      prop="idCard">
                      <span class="passWordBox">{{passwordType === 'password'?'******':peopleInfo.passWord}}</span>
                      <span class="eyeBox"
                        @click="toggleEye">
                        <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
                      </span>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </el-col>
            <el-col :xs="24"
              :span="4">
              <div class="block">
                <div class="imgBox">
                  <img class="avatarImg"
                    :src="uploadFileUrl + '/thumbImage/'+peopleInfo.avatarFileId"
                    alt="暂无图片" />
                </div>
              </div>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import resourceApi from "@/api/resource";
export default {
  name: "peopleBasicInfo",
  data() {
    return {
      uploadFileUrl: process.env.VUE_APP_uploadFileUrl,
      passwordType: "password"
    };
  },
  props: {
    peopleInfo: {
      type: Object
    }
  },
  created() { },
  watch: {
    xxxxx: {
      immediate: true,
      handler(val) { }
    }
  },
  components: {},
  methods: {
    getList() { },
    // 切换显示
    toggleEye() {
      this.passwordType =
        this.passwordType === "password" ? "" : "password";
    }
  }
};
</script>

<style lang='scss'>
.basicInfo-container {
  .container {
    .el-form-item {
      margin-bottom: 3px;
      margin-top: 3px;
    }
    .imgBox {
      width: 100px;
      height: 140px;
      display: block;
      margin: 0 auto;
      border: 1px solid #e4e7ed;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .fileName {
      text-align: center;
    }
    .passWordBox {
      display: inline-block;
      width: 100px;
    }
    .eyeBox {
      color: #409eff;
    }
  }
}
</style>
