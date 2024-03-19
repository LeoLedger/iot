<!--
* @description 工作履历组件 
* @fileName trackrecord.vue
* @author 叶金龙
* @date 2019/06/25 08:50:02
* @version V1.0.0
!-->
<template>
    <div class="trackrecord-container">
        <el-timeline>
            <el-timeline-item
                v-for="(item, index) in peopleInfo.peopleResumeLis"
                :key="index"
                :color="item.color"
                :size="item.size"
            >
                <span v-if="item.joinTime">{{item.joinTime==null?null:(item.joinTime.substring(0, 10))}}</span>
                <span v-if="item.joinTime">--{{item.laidOffTime==null?'至今':(item.laidOffTime.substring(0, 10))}}</span>
                <span
                    style="color:#409eff; cursor: pointer;"
                    @click="gettrachinfo(item)"
                    v-if="item.joinTime"
                >{{item.companyName}}</span>
                <span
                    :style="{'color':item.peopleStatus==2?'#ff4343':'#0bbd87'}"
                    v-if="item.peopleStatus"
                >【{{peopleStatusList[item.peopleStatus].text}}】</span>
            </el-timeline-item>
        </el-timeline>
    </div>
</template>

<script>
import enums from "@/utils/enum";
import { parseTime } from "@/utils";
export default {
    name: "trackrecord",

    data() {
        return {
            searchParam: {},
            peopleStatusList: enums.UserpeopleStatus
        };
    },
    props: {
        peopleInfo: {
            type: Object
        }
    },
    created() {},
    watch: {
        peopleInfo: {
            // immediate: true,
            deep: true,
            handler(val) {
                if (val != null) {
                    val.peopleResumeLis[0] = Object.assign(
                        val.peopleResumeLis[0],
                        {
                            size: "large",
                            color: "#0bbd87"
                        }
                    );
                }
            }
        }
    },
    components: {},
    methods: {
        gettrachinfo(item) {
            this.$emit("traceObj", item);
        }
    }
};
</script>

<style lang='scss'>
.el-timeline {
    .el-timeline-item {
        .el-timeline-item__node--large {
            top: 2px;
            left: -1px;
        }
        .el-timeline-item__content {
            height: 25px;
            line-height: 25px;
        }
    }
}
</style>
