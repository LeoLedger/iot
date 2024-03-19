<!--
* @description  履历信息 --弹窗
* @fileName trackRecordsDialog.vue
* @author 叶金龙
* @date 2019/06/25 20:08:40
* @version V1.0.0
!-->
<template>
    <div class="dialog-container">
        <el-dialog
            title="履历信息"
            :visible.sync="trackInfoVisible"
            width="600px"
            :before-close="beforeClose"
        >
            <div class="infobox">
                <el-row>
                    <el-col :xs="24" :span="12">
                        <label>公司</label>
                        <span>{{trackInfo.companyName}}</span>
                    </el-col>
                    <el-col :xs="24" :span="12">
                        <label>岗位信息</label>
                        <span>{{trackInfo.peopleTypeName}}</span>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :xs="24" :span="12">
                        <label>状态</label>
                        <el-tag
                            size="mini"
                            :type="trackInfo.peopleStatus==2?'danger':'success'"
                        >{{peopeStatusEnum[trackInfo.peopleStatus].text}}</el-tag>
                    </el-col>
                    <el-col :xs="24" :span="12">
                        <label>入职时间</label>
                        <span>{{trackInfo.joinTime |parseTime('{y}-{m}-{d}')}}</span>
                    </el-col>
                </el-row>
                <el-row v-if="trackInfo.peopleStatus==2">
                    <el-col :xs="24" :span="12">
                        <label>离职时间</label>
                        <span>{{trackInfo.laidOffTime|parseTime('{y}-{m}-{d}')}}</span>
                    </el-col>
                    <el-col :xs="24" :span="12">
                        <label>离职类型</label>
                        <span>{{trackInfo.laidOffTypeName}}</span>
                    </el-col>
                </el-row>
                <el-row v-if="trackInfo.peopleStatus==2">
                    <el-col :xs="24" :span="12">
                        <label>离职原因</label>
                        <span>{{trackInfo.content}}</span>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :xs="24" :span="24">
                        <label>项目信息</label>
                        <el-tag size="mini" type="pramary">{{trackInfo.projectName}}</el-tag>
                    </el-col>
                </el-row>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import enums from "@/utils/enum";
import { parseTime } from "@/utils";
export default {
    name: "trackRecordsDialog",
    data() {
        return {
            peopeStatusEnum: enums.UserpeopleStatus,
            searchParam: {}
        };
    },
    props: {
        trackInfo: {
            type: Object
        },
        trackInfoVisible: {
            type: Boolean
        }
    },
    created() {},
    watch: {
        trackInfo: {
            immediate: true,
            deep: true,
            handler(val) {}
        }
    },
    components: {},
    methods: {
        beforeClose() {
            this.$emit("closeTraceInfo");
        }
    }
};
</script>

<style lang='scss'>
.infobox {
    .el-col {
        height: 30px;
        line-height: 30px;
        label {
            display: inline-block;
            width: 80px;
            text-align: right;
            margin-right: 5px;
        }
    }
}
</style>
