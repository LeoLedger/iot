<template>
  <div class="app-container menuMaintance">
    <div class="rigthSide">
      <div class="filter-container">
        <el-date-picker
          v-model="searchParam.beginDate"
          type="date"
          size="small"
          value-format="yyyy-MM-dd"
          placeholder="开始日期"
        >
        </el-date-picker>
        <el-date-picker
          v-model="searchParam.endDate"
          type="date"
          size="small"
          value-format="yyyy-MM-dd"
          placeholder="结束日期"
        >
        </el-date-picker>
        <!-- 搜索 -->
        <el-button
          @click="getList()"
          class="filter-item"
          icon="el-icon-search"
          size="mini"
          type="primary"
        >搜索
        </el-button>
        <!-- 新增 -->
        <el-button
          @click="generate()"
          class="filter-item"
          icon="el-icon-s-tools"
          size="mini"
          type="success"
        >生成
        </el-button>
      </div>
      <el-table
        :data="list"
        border
        fit
        height="75vh"
        highlight-current-row
        ref="singleTable"
        style="display:inline-block;"
      >
        <el-table-column align="center" fixed label="序号" width="50">
          <template slot-scope="scope">
            <span>{{scope.$index+ 1}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="日期" prop="date" width="270"></el-table-column>
        <el-table-column align="center" label="星期" prop="week" width="270"></el-table-column>
        <el-table-column align="center" label="类型" prop="typeName" width="70"></el-table-column>
        <el-table-column align="center" label="备注" prop="remark"></el-table-column>
        <el-table-column align="center" label="" width="1"></el-table-column>
        <el-table-column
          align="center"
          fixed="right"
          label="操作"
          width="60"
        >
          <template slot-scope="scope">
            <el-button
              @click="editItem(scope.row.id)"
              icon="el-icon-edit"
              title="编辑"
              type="primary"
              v v-waves
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        :limit.sync="searchParam.pageSize"
        :page.sync="searchParam.pageIndex"
        :total="pagination.records"
        @pagination="getList"
        v-show="pagination.records>0"
      />
    </div>
    <edit
      :editId="editId"
      :editAppVisible="editAppVisible"
      @closeEdit="closeEdit"
      v-if="editAppShow"
      :title="title"
    ></edit>
  </div>
</template>
<script>
  import Pagination from "@/components/Pagination";
  import edit from "./edit";
  import {
    getVacationList,
    generateVacations
  } from "@/api/systemSet/vacationConfig/index";

  import dayjs from 'dayjs'

  const today = dayjs().add(-1, 'day').format('YYYY-MM-DD')
  export default {
    name: "vacationConfigList",
    data() {
      return {
        pagination: {
          records: 0,
          pageIndex: 0,
          ageTotal: 0
        },
        list: [],
        searchParam: {
          beginDate: today,
          endDate: today,
          name: "",
          pageSize: 15,
          pageIndex: 1
        },
        editId: null,
        addShow: false,
        addAppVisible: false,
        editAppShow: false,
        editAppVisible: false,
        title: ""
      };
    },
    props: {},
    created() {
      setTimeout(() => {
        this.getList();
      }, 200);

    },
    watch: {
      xxxxx: {
        immediate: true,
        handler(val) {
        }
      }
    },
    components: {
      Pagination,
      edit
    },
    methods: {
      // 列表
      getList() {
        getVacationList(this.searchParam).then(res => {
          if (res.data.success) {
            this.list = res.data.data.records;
            res.data.data.records.forEach(item => {
              item.typeName = item.type == 1 ? "节假日" : "工作日";
            });
            this.pagination.records = res.data.data.total;
          }
        });
      },
      generate() {
        generateVacations(this.searchParam).then(res => {
          if (res.data.success) {
            this.$message({
              type: "success",
              message: "生成成功!"
            });
            this.getList();
          } else {
            this.$message({
              type: "warning",
              message: res.data.msg
            });
          }
        });
      },
      // 关闭新增
      closeAddApp(bool) {
        this.addAppVisible = false;
        this.addShow = false;
      },
      // 编辑类型
      editItem(id) {
        this.editId = id;
        this.editAppShow = true;
        this.editAppVisible = true;
      },
      closeEdit(bool) {
        this.editAppVisible = false;
        this.editAppShow = false;
        if (bool) {
          this.getList();
        }
      },

    }
  };
</script>

<style lang='scss' scoped>
  .menuMaintance {
    display: flex;
    height: calc(100vh - 50px);

    .leftSide {
      width: 18%;
      float: left;
      overflow: hidden;
      position: relative;

      .box {
        border: 1px solid #ccc;
        width: 100%;
        padding: 10px;
        border-radius: 5px;
        position: absolute;
        // height: calc(100vh - 170px);
        top: 0px;
        bottom: 0px;

        .linebox {
          height: 0;
          width: 100%;
          border: 1px solid #ececec;
          margin-top: 10px;
        }

        .treeSection {
          height: calc(100vh - 145px);
          overflow-y: scroll;
        }
      }
    }

    .rigthSide {
      width: 100%;
      float: left;
      overflow: auto;
      margin-left: 1.5%;
    }
  }
</style>
