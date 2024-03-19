<!--
* @description 人员的岗位信息
* @fileName postMag.vue
* @author 叶金龙
* @date 2019/06/22 10:41:48
* @version V1.0.0
!-->
<template>
    <div class="postMsg-container">
        <div class="container">
            <el-row type="flex" justify="center">
                <el-col :xs="24" :lg="24">
                    <el-row>
                        <el-col :xs="24" :span="23">
                            <el-form :model="peopleInfo" ref="form" label-width="100px">
                                <el-row>
                                    <el-col :xs="24" :span="12">
                                        <div class="imgBox">
                                            <img
                                                :src="uploadFileUrl + '/thumbImage/'+peopleInfo.idCardFrontFile.fileId"
                                                alt="暂无图片"
                                            >
                                            <p>身份证正面</p>
                                        </div>
                                    </el-col>
                                    <el-col :xs="24" :span="12">
                                        <div class="imgBox">
                                            <img
                                                :src="uploadFileUrl + '/thumbImage/'+peopleInfo.idCardBackFile.fileId"
                                                alt="暂无图片"
                                            >
                                            <p>身份证背面</p>
                                        </div>
                                    </el-col>
                                </el-row>
                                <el-row>
                                    <el-col :xs="24" :span="12">
                                        <el-form-item label="性别" prop="gender">
                                            <el-select
                                                v-model="peopleInfo.gender"
                                                :disabled="true"
                                                size="mini"
                                                placeholder
                                                style="width:100%"
                                            >
                                                <el-option
                                                    v-for="item in genderTypeList"
                                                    :key="item.value"
                                                    :label="item.label"
                                                    :value="item.value"
                                                ></el-option>
                                            </el-select>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :xs="24" :span="12">
                                        <el-form-item label="出生日期" prop="birthday">
                                            <el-input
                                                size="mini"
                                                :disabled="true"
                                                v-model="peopleInfo.birthday"
                                            ></el-input>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                <el-row>
                                    <el-col :xs="24" :span="12">
                                        <el-form-item label="年龄" prop="age">
                                            <el-input
                                                size="mini"
                                                :disabled="true"
                                                v-model="peopleInfo.age"
                                            ></el-input>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :xs="24" :span="12">
                                        <el-form-item label="籍贯" prop="region">
                                            <el-cascader
                                                :options="provinceS"
                                                v-model="peopleInfo.region"
                                                :disabled="true"
                                                style="width:100%"
                                                size="mini"
                                            ></el-cascader>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                <el-row>
                                    <el-col :xs="24" :span="12">
                                        <el-form-item label="户籍地址" prop="residenceAddress ">
                                            <el-input
                                                size="mini"
                                                :disabled="true"
                                                v-model="peopleInfo.residenceAddress "
                                            ></el-input>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :xs="24" :span="12">
                                        <el-form-item label="现居住地址" prop="address">
                                            <el-input
                                                size="mini"
                                                :disabled="true"
                                                v-model="peopleInfo.address"
                                            ></el-input>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                <el-row>
                                    <el-col :xs="24" :span="12">
                                        <el-form-item label="紧急联系人" prop="emergencyContact">
                                            <el-input
                                                size="mini"
                                                :disabled="true"
                                                v-model="peopleInfo.emergencyContact"
                                            ></el-input>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :xs="24" :span="12">
                                        <el-form-item label="联系人电话" prop="emergencyContactPhone">
                                            <el-input
                                                size="mini"
                                                :disabled="true"
                                                v-model="peopleInfo.emergencyContactPhone"
                                            ></el-input>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                            </el-form>
                        </el-col>
                    </el-row>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
import enums from "@/utils/enum";
import { SysArea } from "@/api/resource";
import { deleteNullCity } from "@/utils";
export default {
    name: "peoplePostMsg",
    data() {
        return {
            genderTypeList: enums.sexEnum,
            provinceS: [],
            uploadFileUrl: process.env.VUE_APP_uploadFileUrl
        };
    },
    props: {
        peopleInfo: {
            type: Object
        }
    },
    created() {
        this.getSysArea();
    },
    watch: {
        xxxxx: {
            immediate: true,
            handler(val) {}
        }
    },
    components: {},
    methods: {
        // 获取所有区域
        getSysArea() {
            SysArea().then(response => {
                deleteNullCity(response.data);
                this.provinceS = response.data;
            });
        }
    }
};
</script>

<style lang='scss'>
.postMsg-container {
    .container {
        .el-form-item {
            margin-bottom: 5px;
            margin-top: 5px;
        }
        .imgBox {
            text-align: center;
            img {
                display: inline-block;
                width: 150px;
                height: auto;
            }
        }
    }
}
</style>
