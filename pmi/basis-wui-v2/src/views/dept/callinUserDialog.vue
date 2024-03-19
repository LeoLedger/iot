<template>
  <div class="dialog-container">
    <el-dialog title="调入人员" :visible.sync="callinUserVisible" v-if="callinUserVisible" :before-close="simpleClose"
               append-to-body width="900px">
      <div>
        <!--搜索栏-->
        <div class="filter-container">
          <el-input placeholder="姓名" clearable style="width:180px" size="mini"
                    v-model="searchParam.userName"/>
          <el-input placeholder="登录名" clearable style="width:180px" size="mini"
                    v-model="searchParam.loginName"/>
          <el-cascader v-model="searchParam.deptId" :options="deptTree" size="mini" placeholder="请选择部门"
                       :props="{checkStrictly: true,emitPath:false}"
                       clearable filterable/>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="searchData">搜索</el-button>
        </div>

        <!--数据表格-->
        <el-table ref="dataTable" :data="dataList" border fit resizable
                  highlight-current-row height="370px" style="display:inline-block;">
          <el-table-column align="center" type="selection" width="55" prop="multiSelect">
          </el-table-column>
          <el-table-column align="center" label="姓名" width="100" prop="userName"/>
          <el-table-column align="center" label="登录名" prop="loginName"/>
          <el-table-column align="center" label="部门" prop="deptName"/>
          <el-table-column align="center" label="描述" prop="remark"/>
        </el-table>

        <!--分页控件-->
        <Pagination v-show="pagination.total > 0" :total="pagination.total" :page.sync="searchParam.pageIndex"
                    :limit.sync="searchParam.pageSize" @pagination="getList"/>
      </div>

      <span slot="footer">
        <el-button @click="simpleClose" size="mini">取 消</el-button>
        <el-button size="mini" type="primary" @click="submitCallin">调 入</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import {getNotInDeptUsers} from '@/api/dept/index';
  import Pagination from '@/components/Pagination';
  import {getDeptTree} from '@/api/dept/index';
  import {callInUser} from '@/api/dept/index';

  export default {
    name: "callinUserDialog",
    components: {
      Pagination
    },
    props: {
      callinUserVisible: {
        type: Boolean,
        default: false
      },
      targetDeptId: {
        type: String
      }
    },
    data() {
      return {
        dataList: [],
        searchParam: {
          userName: null,
          loginName: null,
          deptId: null,
          targetDeptId: null,
          pageSize: 15,
          pageIndex: 1,
          sortField: "",
          sortDirection: ""
        },
        pagination: {
          total: 0,
          pageIndex: 1,
        },
        deptTree: [],
      }
    },
    mounted() {
      this.searchParam.targetDeptId = this.targetDeptId;
      this.getList();
      this.getDeptTree();
    },
    methods: {
      // 关闭弹窗
      simpleClose(isFlush) {
        this.$emit("closeCallinUser", isFlush);
      },// 获取数据列表
      getList() {
        getNotInDeptUsers(this.searchParam).then(res => {
          if (res && res.data.success) {
            this.dataList = res.data.data.records;
            this.pagination.total = res.data.data.total;
          } else {
            this.$message({
              showClose: true,
              message: '获取数据失败：' + res.data.msg,
              type: 'error'
            });
          }
        });
      },
      //获取部门数据
      getDeptTree() {
        getDeptTree().then(res => {
          if (res && res.data.success) {
            this.deptTree = res.data.data;
          }
        });
      },
      searchData() {
        this.searchParam.pageIndex = 1;
        this.getList();
      },
      submitCallin() {
        let arr = this.$refs['dataTable'].selection;
        if (!arr.length) {
          this.$message({
            showClose: true,
            message: '请选择要调入的人员',
            type: 'warning'
          });
          return;
        }
        callInUser({users: arr, targetDeptId: this.targetDeptId}).then(res => {
          if (res && res.data.success) {
            this.$message({
              showClose: true,
              message: '调入成功',
              type: 'success'
            });
            this.simpleClose(true);
          } else {
            this.$message({
              showClose: true,
              message: '错误：' + res.data.msg,
              type: 'error'
            });
          }
        });
      }
    }
  }
</script>

<style scoped>

</style>
