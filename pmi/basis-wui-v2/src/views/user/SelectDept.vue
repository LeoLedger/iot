<template>
  <div class="dialog-container">
    <el-dialog
      :title="title"
      :visible.sync="deptVisible"
      width="1200px"
      :before-close="beforeClose"
    >
      <div class="authcontentBox">
        <div class="leftBox">
          <div class="box">
            <SideBarTree
              ref="tree"
              :id="deptId"
              @updateDeptId="updateDeptId"/>
          </div>

        </div>
        <div class="rightBox">
          <!-- 列表 -->
          <div class="Mentitle" style="margin-bottom: 2px;">
            <el-input
              v-model="searchParam.deptName"
              placeholder="部门名称"
              clearable
              class="filter-item"
              style="width:200px"
              size="mini"
            ></el-input>
            <el-input
              v-model="searchParam.deptCode"
              placeholder="部门编码"
              clearable
              class="filter-item"
              style="width:200px"
              size="mini"
            ></el-input>
            <el-select
              v-model="searchParam.deptType"
              placeholder="请选择部门类型"
              clearable
              class="filter-item"
              style="width:200px"
              size="mini"
            >
              <el-option
                v-for="item in deptTypeEnum"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>

            <el-checkbox v-model="searchParam.checkedSubDept">包含子部门</el-checkbox>

            <!-- 搜索 -->
            <el-button
              v-waves
              class="filter-item"
              type="primary"
              icon="el-icon-search"
              @click="filterHandler"
              size="mini"
              v-prereclick
            >搜索
            </el-button>

          </div>
          <!-- 列表 -->
          <TableComponent :list="list"
                          :total="total"
                          v-bind:pageSize.sync="pageSize"
                          v-bind:pageIndex.sync="pageIndex"
                          :options="options"
                          :columns="columns"
                          :operates="operates"
                          :selectedList="selectList"
                          @handleSelectionChange="handleSelectionChange"
          />

        </div>

      </div>

      <span slot="footer">
                <el-button @click="beforeClose" size="mini" v-waves>取 消</el-button>
        <!--                <el-button @click="reset" size="mini" type="warning" v-waves>重 置</el-button>-->
                <el-button type="primary" @click="submitSeletRole" size="mini" v-waves v-prereclick>确 定</el-button>
            </span>
    </el-dialog>
  </div>
</template>

<script>
  import SideBarTree from "@/views/role/components/SideBarTree";
  import TableComponent from "@/components/TableComponent";
  import waves from "@/directive/waves"; // Waves directive;
  import prereclick from "@/directive/prereclick"; // prereclick directive;
  import {getUserNotCallInDeptList, callInDept} from "@/api/user/index";

  import {deptTypeEnum} from '@/utils/enum';

  export default {
    name: "SelectDept",
    directives: {waves, prereclick},
    props: {
      deptVisible: {
        type: Boolean,
        default: false
      },
      deptId: {
        type: String,
        default: ''
      },
      user: {
        type: Object,
        default: {}
      }
    },
    components: {
      SideBarTree,
      TableComponent
    },
    data() {
      const _this = this;
      return {
        list: [],
        total: 0, // table数据总条数
        pageIndex: 1, // 当前页码
        pageSize: 15, // 每页数量
        options: {
          // stripe: true, // 是否为斑马纹 table
          loading: false, // 是否添加表格loading加载动画
          height: 500,
          mutiSelect: true, // 开启选择
          mutiSelectedKey: 'deptId', // 根据 对应key 找出应被选中的状态
          curRowKey: 'deptId'
        },
        columns: [
          {
            prop: 'deptName',
            label: '部门名称',
            width: 200
          },
          {
            prop: 'deptCode',
            label: '部门编码',
            width: 200,
          },
          {
            prop: 'deptType',
            label: '类型',
            width: 100,
            formatter: function (row, column) {
              let text = '';
              let res = _this.deptTypeEnum.find(({value}) => {
                return value === row.deptType;
              }) || {};
              text = res.label;
              return text || '';
            }
          },
          // {
          //     prop: 'mapName',
          //     label: '所属区域',
          //     width: 100,
          // },

          {
            prop: 'remark',
            label: '备注',
            minWidth: 200,
          },
        ],
        // 列操作按钮
        operates: {},
        selectList: [],
        title: '部门调入',
        searchParam: {
          checkedSubDept: true
        },
        deptTypeEnum
      }
    },
    created() {
      this.searchParam.userId = this.user.userId;
      this.title = this.user.deptName + '(' + this.user.userName + ')' + "部门调入";
      // this.forceUpdateTree();
      this.nextTickWrap()
      this.queryList();
    },
    watch: {
      pageIndex(newData, oldDate) {
        this.queryList();
      },
      pageSize(newData, oldDate) {
        this.queryList();
      }
    },
    methods: {
      nextTickWrap() {
        this.$nextTick(() => {
          this.forceUpdateTree()
        })
      },
      async forceUpdateTree() {
        let treeData = await this.$refs.tree.getTree();
        this.treeData = treeData;
        if (typeof this.deptId !== 'undefined') {
          // 若存在 deptId 等  tree更新完成  高亮当前行
          this.$refs.tree &&
          this.$refs.tree.setCurrentKey &&
          this.$refs.tree.setCurrentKey(this.deptId)
        }
      },
      // 选择事件
      handleSelectionChange(val) {
        this.selectList = val;
      },
      // 更新部门ID
      updateDeptId(value) {
        this.deptId = value;
        this.queryList();
      },
      // 请求数据列表
      queryList() {
        const _this = this,
          {
            pageSize,
            pageIndex,
            options,
            searchParam,
            deptId,
            userId
          } = this;
        if (typeof deptId === 'undefined') return;
        options.loading = true;
        const params = {
          pageIndex, // 当前页码
          pageSize, // 每页数量
          deptId, // 部门节点
          ...searchParam
        };

        getUserNotCallInDeptList(params).then(res => {
          let data = null;
          if (res.data.success) {
            data = res.data.data.records;
          } else {
            return this.$message.error('获取角色信息失败！');
          }
          _this.options.loading = false; // 更改加载中的 loading值
          _this.list = data || [];
          _this.total = res.data.data.total;// data.records;
        });
      },
      // 搜索
      filterHandler() {
        this.pageIndex = 1;
        this.queryList();
      },
      // 确认关闭
      beforeClose() {
        this.$confirm("确认放弃本次操作？")
          .then(_ => {
            //done();  不能使用done 否则会直接操作模态框
            this.$nextTick(() => {
              this.$emit("closeDept", {arr: null, flag: false});
            });
          })
          .catch(_ => {
            return false;
          });
      },
      // 提交所选角色
      submitSeletRole() {
        let _this = this;
        if (this.selectList.length == 0) {
          this.$message.error("请选择需要调入的部门!")
        } else {
          this.$confirm("此操作将调入所选部门, 是否继续?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
            center: true
          }).then(() => {
            _this.selectList.forEach((value, index, array) => {
              value.userId = _this.user.userId;
            });
            callInDept(_this.selectList).then(res => {
              const {success, msg} = res.data;
              if (success) {
                this.$message({
                  type: "success",
                  message: "调入成功!"
                });
                this.$emit("queryDeptList", {arr: null, flag: false});

                this.$emit("closeDept", {arr: null, flag: false});
              } else {
                this.$message.error(msg);
              }
            });

          }).catch(() => {
          });
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .authcontentBox {
    height: 650px;
    width: 100%;

    .leftBox {
      float: left;
      width: 20%;
      height: 100%;
      box-sizing: border-box;
      overflow: hidden;
      position: relative;

      .box {
        border: 1px solid #ccc;
        width: 100%;
        padding: 10px;
        border-radius: 5px;
        position: absolute;
        height: calc(100vh- 170px);
        top: 0px;
        bottom: 0px;
        overflow-y: scroll;
      }
    }

    .rightBox {
      float: left;
      overflow: hidden;
      width: 79%;
      margin-left: 1%;

      .haveSelect {
        height: 30px;
        line-height: 30px;
        border-bottom: 1px dashed #ccc;
      }

      .filter-container {
        margin-top: 10px;
      }
    }
  }
</style>
