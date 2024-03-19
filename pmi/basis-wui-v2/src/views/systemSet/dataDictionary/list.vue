<!--
* @description
* @fileName list.vue
* @author 姜庆博
* @date 2019/06/11 19:39:44
* @version V1.0.0
!-->
<template>
  <div class="dataDictionary app-container">
    <div class="mainLayoutBox">
      <!-- 左边列表 -->
      <div class="layoutLeft">
        <div class="filter-wrap">
          <el-input
                  v-model="formData.id"
                  placeholder="字典选项ID"
                  clearable
                  class="filter-item"
                  size="mini"
          ></el-input>
          <el-input
                  v-model="formData.name"
                  placeholder="类型名称"
                  clearable
                  class="filter-item"
                  size="mini"
          ></el-input>
          <!-- 搜索 -->
          <el-button
                  v-waves
                  type="primary"
                  icon="el-icon-search"
                  @click="filterHandler"
                  size="mini"
                  v-prereclick
          >搜索
          </el-button>
        </div>
        <TableComponent :list="list"
                        :total="total"
                        v-bind:pageSize.sync="pageSize"
                        v-bind:pageIndex.sync="pageIndex"
                        :options="options"
                        :columns="columns"
                        @handleCurrentChange="handleCurrentChange"
        />
      </div>
      <!-- 右边列表 -->
      <div class="layoutRight">
        <div class="filter-wrap">
          <!-- 新增 -->
          <el-button
                  v-waves
                  type="success"
                  icon="el-icon-plus"
                  @click="addDictionaryInfo"
                  size="mini"
          >新增</el-button>
        </div>
        <el-table
                ref="singleTable"
                :data="dictList"
                element-loading-text="加载中..."
                element-loading-background="rgba(0, 0, 0, 0.1)"
                empty-text="暂无数据：请选择字典列表"
                border
        >
          <el-table-column label="序号" type="index" width="50" align="center" fixed="left"/>
          <el-table-column prop="name" label="选项" align="center" width="160"/>
          <el-table-column prop="isEnable" label="启用" align="center" width="100">
              <el-checkbox slot-scope="scope"
                           :value="scope.row.isEnable"
                           @change="checkBoxChange(scope.row, $event)">启用</el-checkbox>
          </el-table-column>
          <el-table-column prop="sort" label="排序" align="center" width="100">
            <template slot-scope="scope">
              <el-button v-waves v-prereclick
                         type="primary" size="mini"
                         icon="el-icon-caret-top"
                         @click="changeSort(scope.$index, 'up')"
              ></el-button>
              <el-button v-waves v-prereclick
                         type="primary" size="mini"
                         icon="el-icon-caret-bottom"
                         @click="changeSort(scope.$index, 'down')"
              ></el-button>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" align="center" :min-width="280">
            <span slot-scope="scope" :title="scope.row['remark']">{{ scope.row['remark'] || '- -' }}</span>
          </el-table-column>
          <el-table-column
                  width="120"
                  fixed="right"
                  label="操作"
                  align="center">
            <div class="item" slot-scope="scope">
              <el-button size="mini" title="编辑" type="primary" icon="el-icon-edit"
                      :disabled="!scope.row.isHandle"
                      @click="editRowInfo(scope.row, scope.$index)"
              />
              <el-button size="mini" title="删除" type="danger" icon="el-icon-delete"
                         :disabled="!scope.row.isHandle"
                         @click="deleteRowInfo(scope.row, scope.$index)"
              />
            </div>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <EditDictionaryDialog
          v-if="editDictionaryVisible"
          v-bind:visible.sync="editDictionaryVisible"
          :isEdit="isEdit"
          :formData="dictionaryData"
          :namespaceOptions="namespaceOptions"
          @editSubmitCallBack="queryDictionaryList"
  />
  </div>
</template>

<script>
  import TableComponent from "@/components/TableComponent";
  import DialogForm from "@/components/DialogForm"
  import waves from "@/directive/waves"; // Waves directive;
  import prereclick from "@/directive/prereclick"; // prereclick directive;

  import {
    dictionary, // 获取字典项
    getDictionaryItemDetail, // 获取字典详情
    getDictionaryList, // 搜索列表
    getDictionaryNameSpaceList, // 数据字典命名空间列表
    editDictionaryItem, // 编辑/新建
    deleteDictionaryItem, // 删除字典项
    editDictionarySortAndEnable, // 排序启用
  } from "@/api/resource"; // 数据字典接口
  import EditDictionaryDialog from "./EditDictionaryDialog"

  export default {
    name: 'clientInfoList',
    components: {
      TableComponent,
      DialogForm,
      EditDictionaryDialog,
    },
    directives: {waves, prereclick},
    data() {
      const _this = this;
      return {
        formData: {
          id: '',
          name: ''
        },
        // table 参数
        total: 0, // table数据总条数
        list: [],
        dictList: [],
        dictLoading: false,
        pageIndex: 1, // 当前页码
        pageSize: 15, // 每页数量
        // table 的参数
        options: {
          // stripe: true, // 是否为斑马纹 table
          loading: false, // 是否添加表格loading加载动画
        },
        // 需要展示的列
        columns: [
          {
            prop: 'id',
            label: '字典选项ID',
            width: 260,
          }, {
            prop: 'name',
            label: '类型名称',
            width: 110
          }, {
            prop: 'remark',
            label: '备注',
            minWidth: 100,
          },
        ],
        editDictionaryVisible: false,
        dictionaryData: {
          c_namespace_id: '', // 命名空间ID 类型
          c_desc: '', // 描述
          c_id: '', // 字典ID 选项
          c_name: '', // 名称
        },
        isEdit: false,
        namespaceOptions: []
      }
    },
    created() {
      this.queryList();
    },
    watch: {
      pageIndex(newData, oldDate) {
        this.queryList();
      },
      pageSize(newData, oldDate) {
        this.queryList();
      },
    },
    methods: {
      deleteDetailInfo(id) {
        this.$confirm("此操作将删除此记录, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          center: true
        }).then(() => {
          deleteDictionaryItem(id).then(res => {
            const {success, message} = res.data;
            if (success) {
              this.$message({
                type: "success",
                message: "删除成功!"
              });
              this.queryList()
            } else {
              this.$message.error(message);
            }
          });
        })
                .catch(() => {});
      },
      // 请求数据列表
      queryList() {
        const _this = this,
                {
                  pageSize,
                  pageIndex,
                  options,
                  formData
                } = this;
        // console.error(formData, 'formData')
        options.loading = true;
        const params = {
          pageIndex, // 当前页码
          pageSize, // 每页数量
          ...formData
        };
        getDictionaryNameSpaceList(params).then(res => {
          const {data} = res.data;
          // console.log(data);
          _this.options.loading = false; // 更改加载中的 loading值
          _this.list = data.rows || [];
          _this.total = data.records;
        });
      },
      // 查找
      filterHandler() {
        this.pageIndex = 1; // 初始为1
        this.queryList();
      },
      handleCurrentChange(row) {
        // console.log(JSON.stringify(row), 'row');
        const namespaceId = row.id;
        if(namespaceId) {
          this.activeNamespaceId = namespaceId;
          this.namespaceOptions = [{value: namespaceId, label: row.name}]
          this.queryDictionaryList()
        }
      },
      queryDictionaryList() {
        this.dictLoading = true; // 更改加载中的 loading值
        getDictionaryList({namespaceId: this.activeNamespaceId}).then((res) => {
          const {data} = res.data;
          this.dictLoading = false; // 更改加载中的 loading值
          const list = (data.rows || []).sort((a, b) => a.sort - b.sort);
          // console.error(JSON.stringify(list), 'list')
          this.dictList = list;
        })
      },
      editDictionarySortAndEnableChange(submitParams) {
        editDictionarySortAndEnable(submitParams).then((res) => {
          const {success, data, message} = res.data;
          if (success) {
            this.$message.success('请求处理成功');
            this.queryDictionaryList()
          } else {
            this.$message.error(message);
          }
        })
      },
      checkBoxChange(row, bool) {
        const submitParams = [{
          c_id: row.id, // 字典ID
          c_sort: row.sort, // 排序
          isEnable:bool // 是否启用
        }]
        this.editDictionarySortAndEnableChange(submitParams)
      },
      changeSort(listIndex, type) {
        // console.log(listIndex, type, ' changeSort');
        const dictList = this.dictList;
        let curSort = 0,
                nextSort = listIndex,
                curItem = dictList[listIndex],
                nextItem = {};
        /*console.log(JSON.stringify(curItem), 'curItem')
        console.warn(JSON.stringify(dictList[listIndex - 1]), '上级item')
        console.error(JSON.stringify(dictList))*/
        if(type === 'up') { // sort --
          if(listIndex === 0) {
            return this.$message.error('排序已经在最前了！');
          }
          curSort = listIndex - 1; // 向上排序
          nextItem = dictList[listIndex - 1] // 上条数据
        } else { // down   sort ++
          if(listIndex === dictList.length - 1) {
            return this.$message.error('排序已经在最后了！');
          }
          curSort = listIndex + 1; // 向下排序
          nextItem = dictList[listIndex + 1] // 下条数据
        }
       /* curItem = {...curItem, c_id: curItem.id, c_sort: curSort}
        nextItem = {...nextItem, c_id: nextItem.id, c_sort: nextSort}*/
        curItem = {c_id: curItem.id, c_sort: curSort, isEnable:curItem.isEnable}
        nextItem = {c_id: nextItem.id, c_sort: nextSort, isEnable:nextItem.isEnable}
        const submitParams = [curItem, nextItem]
        this.editDictionarySortAndEnableChange(submitParams)
      },
      deleteRowInfo(row, index) {
        // console.log('删除', row, index)
        const id = row.id;
        if(typeof id === 'undefined') {
          return this.$message.error('没有id');
        }
        this.$confirm("此操作将删除此记录, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          center: true
        }).then(() => {deleteDictionaryItem(id).then(res => {
            const {success, message} = res.data;
            if (success) {
              this.$message({
                type: "success",
                message: "删除成功!"
              });

              this.queryDictionaryList()
            } else {
              this.$message.error(message);
            }
          });
        }).catch(() => {});
      },
      editRowInfo(row, index) {
        // console.log('编辑', row, index)
        this.editDictionaryVisible = true;
        this.dictionaryData = {
          c_namespace_id: this.activeNamespaceId,
          c_desc: row.remark, // 描述
          c_id: row.id, // 字典ID 选项
          c_name: row.name, // 名称
        };
        this.isEdit = true;
      },
      addDictionaryInfo() {
        this.editDictionaryVisible = true;
        this.isEdit = false;
        this.dictionaryData = {
          c_namespace_id: this.activeNamespaceId,
        }
      }
    }
  }
</script>

<style lang='scss' scoped>
  %text_hide {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  /deep/ {
    * {
      font-size: 12px;
    }
    .cell {
      @extend %text_hide;
    }
  }
  .mainLayoutBox {
/*    display: flex;
    justify-content: space-between;
    width: 100%;*/

    > div {
      float: left;
      padding: 0 10px;
      margin: 8px 4px;
      flex: 1;
      position: relative;
      box-sizing: border-box;
      border: 1px solid #ebeef5;
      width: 48%;
    }
    .layoutRight {
      float: right;
    }
    .filter-wrap {
      margin: 10px 0;
      .filter-item {
        width: 200px;
      }
    }
    .item {
      margin-top: 4px;
      display: block;
      /*flex: 0 0 50%;*/
      flex: 0 0 auto;
    }
  }
</style>
