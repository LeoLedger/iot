<template>
  <div class="app-container menuMaintance">
    <div class="leftSide">
      <div class="box">
        <el-tabs v-model="activeName" stretch @tab-click="handleClick">
          <el-tab-pane label="所有" name="first">
            <el-button
              class="filter-item"
              icon="el-icon-plus"
              size="mini"
              type="success"
              @click="addNSItem()"
            >新增
            </el-button>
            <div class="linebox" style="border: none;" />
            <ul>
              <li v-for="item in nsList" class="liItem">
                <a @click="nsClick(item.nsId)">{{ item.nsName }}</a>
              </li>
            </ul>
          </el-tab-pane>
          <el-tab-pane label="树形索引" name="second">
            <div class="treeSection">
              <side-bar-tree
                ref="dictTree"
                :tree-data="dictTreeData"
                @getNodeObj="getNodeObj"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <div class="rigthSide">
      <div class="filter-container">
        <el-input
          v-model="searchParam.dictName"
          class="filter-item"
          clearable
          placeholder="名称"
          size="mini"
          style="width:200px"
        />
        <!-- 搜索 -->
        <el-button
          class="filter-item"
          icon="el-icon-search"
          size="mini"
          type="primary"
          @click="getList()"
        >搜索
        </el-button>
        <!-- 新增 -->
        <el-button
          class="filter-item"
          icon="el-icon-plus"
          size="mini"
          type="success"
          @click="addItem()"
        >新增
        </el-button>
      </div>
      <el-table
        ref="singleTable"
        :data="list"
        border
        fit
        height="70vh"
        highlight-current-row
        style="display:inline-block;"
      >
        <el-table-column align="center" label="序号" width="50">
          <template slot-scope="scope">
            <span>{{ scope.$index+(searchParam.pageIndex-1) *searchParam.pageSize + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="排序" prop="orderNum" width="70" />
        <el-table-column align="center" label="ID" prop="id" width="150" />
        <el-table-column align="center" label="编码" prop="dictCode" width="200" />
        <el-table-column align="center" label="名称" prop="dictName" width="220" />
        <el-table-column align="center" label="描述" prop="remark" width="230" />
        <el-table-column
          align="center"
          fixed="right"
          label="操作"
          prop="createDate"
          width="154"
        >
          <template slot-scope="scope">
            <el-button
              icon="el-icon-edit"
              title="编辑"
              type="primary"
              @click="editItem(scope.row.id)"
            />
            <el-button
              size="mini"
              title="删除"
              type="danger"
              icon="el-icon-delete"
              @click="deleteItem(scope.row.dictId)"
            />
          </template>

        </el-table-column>
      </el-table>
      <pagination
        v-show="pagination.records>0"
        :limit.sync="searchParam.pageSize"
        :page.sync="searchParam.pageIndex"
        :total="pagination.records"
        @pagination="getList"
      />
    </div>
    <add
      v-if="addDictShow"
      :add-dict-visible="addDictVisible"
      :ns-id="searchParam.nsId"
      @closeAddDict="closeAddDict"
    />
    <edit
      v-if="editDictShow"
      :edit-dict-visible="editDictVisible"
      :dict-id="searchParam.dictId"
      :edit-id="editId"
      @closeEditDict="closeEditDict"
    />

    <addNS
      v-if="addNSShow"
      :add-n-s-visible="addNSVisible"
      @closeAddNS="closeAddNS"
    />
  </div>
</template>
<script>
import Pagination from '@/components/Pagination'
import sideBarTree from '@/components/sideBarTree/sideBarTree'
import addNS from './addNS'
import add from './add'
import edit from './edit'
import {
  getDictList,
  deleteDict,
  getDictTree,
  getNSList
} from '@/api/systemSet/dict/index'
import { deleteNullCity } from '@/utils'

export default {
  name: 'DictList',
  components: {
    sideBarTree,
    Pagination,
    add,
    edit,
    addNS
  },
  props: {},
  data() {
    return {
      activeName: 'first',
      nsList: [],
      pagination: {
        records: 0,
        pageIndex: 0,
        ageTotal: 0
      },
      list: [],
      searchParam: {
        dictName: '',
        nsId: '',
        pageSize: 15,
        pageIndex: 1
      },
      dictTreeData: [],
      editId: null,
      addDictShow: false,
      addDictVisible: false,
      editDictShow: false,
      editDictVisible: false,
      addNSShow: false,
      addNSVisible: false,
      title: ''
    }
  },
  watch: {
    xxxxx: {
      immediate: true,
      handler(val) {
      }
    }
  },
  created() {
    this.getList()
    this.getNSList()
  },
  methods: {
    nsClick(nsId) {
      this.searchParam.nsId = nsId
      this.getList()
    },
    handleClick(obj) {
      if (obj.paneName == 'second') {
        this.getTree()
      } else {
        this.getNSList()
      }
    },
    // 获取所有类型
    getNSList() {
      getNSList().then(res => {
        this.nsList = res.data.data
      })
    },
    // 获取级联树形数据
    getTree() {
      getDictTree().then(res => {
        this.dictTreeData = res.data.data
      })
    },
    // 获取点击的节点
    getNodeObj(obj) {
      if (obj.parentId != '00000000-0000-0000-0000-000000000000') {
        this.searchParam.nsId = obj.id
        this.getList()
      }
    },
    // 树查询
    treeSearch() {
      this.$refs.dictTree.$refs.attrList.filter()
    },
    // 列表
    getList() {
      getDictList(this.searchParam).then(res => {
        if (res.data.success) {
          this.list = res.data.data.records
          this.pagination.records = res.data.data.total
        }
      })
    },
    // 新增类型
    addItem() {
      this.addDictShow = true
      this.addDictVisible = true
    },
    // 关闭新增
    closeAddDict(isRefresh) {
      this.addDictVisible = false
      this.addDictShow = false
      if (isRefresh) {
        this.getList()
      }
    },
    // 新增命名空间类型
    addNSItem() {
      this.addNSShow = true
      this.addNSVisible = true
    },
    // 关闭命名空间新增
    closeAddNS(isRefresh) {
      this.addNSVisible = false
      this.addNSShow = false
      if (isRefresh) {
        this.getNSList()
      }
    },
    // 编辑类型
    editItem(id) {
      this.editId = id
      this.editDictShow = true
      this.editDictVisible = true
    },
    // 关闭编辑类型
    closeEditDict(isRefresh) {
      this.editDictVisible = false
      this.editDictShow = false
      if (isRefresh) {
        this.getList()
      }
    },
    deleteItem(dictId) {
      this.$confirm('此操作将删除此记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        deleteDict({ dictId }).then(res => {
          const { success, message } = res.data
          if (success) {
            this.$notify({
              title: '成功',
              message: '操作成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          } else {
            this.$notify({
              title: '失败',
              message: '数据验证失败',
              type: 'warning',
              duration: 2000
            })
          }
        })
      }).catch(() => {
      })
    },
    // 删除类型
    deleItem(Cid) {
      this.$confirm('此操作将删除此菜单, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      })
        .then(() => {
          deleMenu({ id: Cid }).then(res => {
            if (res.data.success) {
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
              this.searchParam.parentId = null
              this.getList()
              this.getTree()
            } else {
              this.$message.error(res.data.message)
            }
          })
        })
        .catch(() => {
        })
    }
  }
}
</script>

<style lang='scss'>
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
                    height: auto;
                    overflow: hidden !important;
                }
            }
        }
        .rigthSide {
            width: 80%;
            float: left;
            overflow: auto;
            margin-left: 1.5%;
        }
    }
    .liItem
    {
        border-top: 1px solid #dedede;
        border-bottom: 1px solid #e8f1fb;
        background: #EBEEF5;
        display: block;
        height: 30px;
        line-height: 30px;
    }
    .liItem a
    {
        height: 30px;
        line-height: 30px;
        padding: 0 0 0 20px;
        font-size: 12px;
        color: #0C7ACC;
    }
</style>
