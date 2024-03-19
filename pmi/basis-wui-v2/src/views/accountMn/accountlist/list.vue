<!--
* @description 用户管理列表
* @fileName list.vue
* @author 叶金龙
* @date 2019/06/20 17:06:17
* @version V1.0.0
!-->
<template>
  <div class="app-container">
    <div class="accoutMn">
      <div class="leftSide">
        <div class="filter-container">
          <el-input v-model="searchParam.peopleName"
            placeholder="姓名"
            clearable
            class="filter-item"
            style="width:200px"
            size="mini"></el-input>
          <el-input v-model="searchParam.loginName"
            placeholder="账号"
            clearable
            class="filter-item"
            style="width:200px"
            size="mini"></el-input>
          <el-input v-model="searchParam.idCard"
            placeholder="身份证号"
            clearable
            class="filter-item"
            style="width:200px"
            size="mini"></el-input>
          <el-date-picker v-model="searchParam.beginEndDate"
            size="mini"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            class="filter-item"
            value-format="yyyy-MM-dd"
            style="width: 325px"
            clearable></el-date-picker>
          <el-input v-model="searchParam.mobileNum"
            placeholder="手机号"
            clearable
            class="filter-item"
            style="width:200px"
            size="mini"></el-input>

          <!-- 搜索 -->
          <el-button v-waves
            class="filter-item"
            type="primary"
            icon="el-icon-search"
            @click="resetgetList()"
            size="mini"
            v-prereclick>搜索</el-button>
          <!-- 导出 -->
          <el-button v-waves
            class="filter-item"
            type="warning"
            icon="el-icon-download"
            @click="exportList()"
            size="mini">导出</el-button>
        </div>
        <el-table :data="list"
          border
          fit
          resizable
          highlight-current-row
          height="65vh"
          ref="singleTable"
          style="display:inline-block;"
          @row-click="handleCurrentChange">
          <el-table-column fixed
            align="center"
            width="50"
            label="序号">
            <template slot-scope="scope">
              <span>{{scope.$index+(searchParam.pageIndex-1) *searchParam.pageSize + 1}}</span>
            </template>
          </el-table-column>
          <!-- sortable="custom" -->
          <el-table-column align="center"
            fixed
            label="姓名"
            width="100"
            prop="peopleName"></el-table-column>
          <el-table-column align="center"
            label="账号"
            prop="loginName"></el-table-column>
          <el-table-column align="center"
            label="手机号"
            prop="mobileNum"></el-table-column>
          <el-table-column align="center"
            label="身份证号"
            prop="idCard"></el-table-column>
          <el-table-column align="center"
            label="注册时间"
            prop="createDate"></el-table-column>
        </el-table>
        <pagination v-show="pagination.records>0"
          :total="pagination.records"
          :page.sync="searchParam.pageIndex"
          :limit.sync="searchParam.pageSize"
          @pagination="getList" />
      </div>
      <div class="rightSide">
        <div class="notice"
          v-show="!infoSection">暂无用户信息</div>
        <div v-if="infoSection">
          <div class="topTitle">基础信息</div>
          <basic-info :peopleInfo="peopleInfo"></basic-info>
          <div class="topTitle">档案信息</div>
          <div class="archivalInfo">
            <archival-info :peopleInfo="peopleInfo"
              v-if="havearchivalInfo"></archival-info>
            <div v-else
              class="noarchivalInfo">暂无档案信息</div>
          </div>
          <div class="topTitle">工作履历</div>
          <div class="traceRecords">
            <div class="recordContainer"
              v-if="haveResumeLis">
              <track-record :peopleInfo="peopleInfo"
                @traceObj="traceObj"></track-record>
            </div>
            <div class="notraceInfo"
              v-else>暂无履历信息</div>
          </div>
        </div>
      </div>
    </div>
    <track-dialog v-if="trackInfoShow"
      :trackInfo="trackInfo"
      :trackInfoVisible="trackInfoVisible"
      @closeTraceInfo="closeTraceInfo"></track-dialog>
  </div>
</template>

<script>
import waves from "@/directive/waves"; // Waves directive;
import prereclick from "@/directive/prereclick"; // prereclick directive;
import Pagination from "@/components/Pagination";
import basicInfo from "@/components/forUser/basicInfo";
import archivalInfo from "@/components/forUser/archivalInfo";
import trackRecord from "@/components/forUser/trackrecord";
import trackDialog from "./components/trackRecordsDialog";
import { getUserMnList } from "@/api/userAuthor/userMn/index";
import {
  getAccoutInfoByidCard,
  exportUserCenterRecord,
  getUserInfoNoIdCard
} from "@/api/accountMn/accountList/index";
export default {
  name: "xx",
  directives: { waves, prereclick },
  data() {
    return {
      pagination: {
        records: 0,
        pageIndex: 0,
        ageTotal: 0
      },
      infoSection: false,
      list: [],
      searchParam: {
        peopleName: null,
        beginEndDate: [],
        loginName: null,
        idCard: null,
        mobileNum: null,
        isOps: true,
        pageIndex: 1,
        pageSize: 15,
        sortField: "",
        sortDirection: ""
      },
      trackInfo: {},
      trackInfoShow: false,
      trackInfoVisible: false,
      peopleInfo: {},
      haveResumeLis: true,
      havearchivalInfo: true
    };
  },
  props: {},
  created() {
    this.getList();
  },
  watch: {
    xxxxx: {
      immediate: true,
      handler(val) { }
    }
  },
  components: {
    Pagination,
    basicInfo,
    archivalInfo,
    trackRecord,
    trackDialog
  },
  methods: {
    // 搜索
    resetgetList() {
      this.searchParam.pageIndex = 1;
      this.getList();
    },
    // 获得履历的obj
    traceObj(obj) {
      this.trackInfoShow = true;
      this.trackInfoVisible = true;
      this.trackInfo = obj;
    },
    // 关闭履历详情
    closeTraceInfo() {
      this.trackInfoVisible = false;
      this.trackInfoShow = false;
    },
    // 列表
    getList() {
      getUserMnList(this.searchParam).then(res => {
        if (res && res.data.success) {
          this.list = res.data.data.rows;
          this.pagination.records = res.data.data.records;
          if (this.list.length == 0) {
            this.infoSection == false;
          } else {
            this.handleCurrentChange(this.list[0]);
          }
        }
      });
    },
    // 导出
    exportList() {
      exportUserCenterRecord(this.searchParam);
    },
    // 行点击
    handleCurrentChange(val) {
      this.$refs.singleTable.setCurrentRow(val);
      console.log(val)
      if (val.idCard == null || val.idCard == "") {
        // this.$message.error(
        //     "该用户没有录入身份证号，无法查询用户的信息"
        // );
        getUserInfoNoIdCard({ userId: val.id }).then(res => {
          if (res && res.data.success) {
            this.peopleInfo = res.data.data;
            this.infoSection = true;
            this.haveResumeLis = false;
            this.havearchivalInfo = false;
          }
        });
      } else {
        getAccoutInfoByidCard({
          idCard: val.idCard.toString().trim(),
          isAdmin: true,
          userId: val.id
        }).then(res => {
          if (res && res.data.success) {
            this.peopleInfo = res.data.data;
            this.infoSection = true;
            this.havearchivalInfo = true;
            this.haveResumeLis = true;
            if (this.peopleInfo.peopleResumeLis.length == 0) {
              this.haveResumeLis = false;
            }
          } else {
            this.infoSection = false;
            this.$message.error(res.data.message);
          }
        });
      }
    }
  }
};
</script>

<style lang='scss'>
.accoutMn {
  overflow: auto;
  height: calc(100vh - 90px);
  .leftSide {
    float: left;
    width: 58%;
  }
  .rightSide {
    overflow: auto;
    float: left;
    width: 40%;
    margin-left: 2%;
    border: 1px solid #ebeef5;
    border-radius: 5px;
    height: 100%;
    .notice {
      height: 100%;
      line-height: calc(100vh - 90px);
      text-align: center;
      font-size: 14px;
      color: #909399;
    }
    .topTitle {
      margin-top: 0;
    }
    .archivalInfo {
      .noarchivalInfo {
        height: calc(100vh - 600px);
        line-height: calc(100vh - 600px);
        text-align: center;
        color: #909399;
        font-size: 14px;
      }
    }
    .traceRecords {
      .recordContainer {
        height: calc(100vh - 790px);
        overflow-y: scroll;
        padding: 0 10px;
        box-sizing: border-box;
      }
      .notraceInfo {
        color: #909399;
        font-size: 14px;
        text-align: center;
        line-height: calc(100vh - 790px);
      }
    }
  }
}
</style>
