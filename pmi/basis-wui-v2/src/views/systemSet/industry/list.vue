<!--
* @description 行业管理-列表
* @fileName list.vue
* @author Herux
* @date 2020/09/11
* @version V1.0.0
!-->
<template>
  <div class="app-container authMn">
    <div class="leftSide">
      <div class="box">
        <AppSideBarTree
          :id="appId"
          ref="appTree"
          @updateAppId="updateAppId"
        />
      </div>
    </div>
    <div class="rigthSide">
      <div class="filter-container">
        <el-input
          v-model="searchParam.industryName"
          placeholder="名称"
          clearable
          class="filter-item"
          style="width:250px"
          size="mini"
        />
        <el-input
          v-model="searchParam.industryCode"
          placeholder="编码"
          clearable
          class="filter-item"
          style="width:250px"
          size="mini"
        />
        <!-- 搜索 -->
        <el-button
          v-waves
          v-prereclick
          class="filter-item"
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="resetgetList()"
        >搜索
        </el-button>
        <!-- 新增 -->
        <el-button
          v-waves
          class="filter-item"
          type="success"
          icon="el-icon-plus"
          size="mini"
          @click="addItem()"
        >新增
        </el-button>
      </div>
      <el-table
        ref="dataTable"
        :data="list"
        border
        fit
        highlight-current-row
        height="75vh"
        style="display:inline-block"
      >
        <el-table-column align="center" type="selection" width="55" prop="multiSelect" />
        <el-table-column fixed align="center" width="50" label="序号">
          <template slot-scope="scope">
            <span>{{ scope.$index+(searchParam.pageIndex-1) *searchParam.pageSize + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="行业编码" prop="industryCode" />
        <el-table-column align="center" label="行业名称" prop="industryName" />
        <el-table-column align="center" label="备注" prop="remark" />
        <el-table-column align="center" label="操作">
          <template slot-scope="scope">
            <el-button
              v-waves
              type="primary"
              title="编辑"
              icon="el-icon-edit"
              @click="editItem(scope.row)"
            />
            <el-button
              size="mini"
              title="删除"
              type="danger"
              icon="el-icon-delete"
              @click="deleteItem(scope.row.industryId)"
            />
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="pagination.records>0"
        :total="pagination.records"
        :page.sync="searchParam.pageIndex"
        :limit.sync="searchParam.pageSize"
        @pagination="getPage"
      />
    </div>
    <add
      v-if="addAuthShow"
      :str="str"
      :edit-info-obj="editInfoObj"
      :add-auth-visible="addAuthVisible"
      @closeAddAuth="closeAddAuth"
    />
    <edit
      v-if="editAuthShow"
      :str="str"
      :edit-info-obj="editInfoObj"
      :edit-auth-visible="editAuthVisible"
      @closeEditAuth="closeEditAuth"
    />
  </div>
</template>
<script>
import waves from '@/directive/waves' // Waves directive;
import prereclick from '@/directive/prereclick' // prereclick directive;
import Pagination from '@/components/Pagination'
import AppSideBarTree from '@/views/role/components/AppSideBarTree'
import add from './add'
import edit from './edit'
import { getPage, deleteIndustry } from '@/api/systemSet/industry/index'
import { getAppCodeByGuid } from '@/api/systemSet/application/index'

export default {
  name: 'IndustryList',
  directives: { waves, prereclick },
  components: {
    Pagination,
    add,
    edit,
    AppSideBarTree
  },
  props: {},
  data() {
    return {
      appId: '',
      pagination: {
        records: 0,
        pageIndex: 0,
        ageTotal: 0
      },
      searchParam: {
        appId: '',
        industryName: null,
        industryCode: null,
        pageSize: 15,
        pageIndex: 1,
        sortField: '',
        sortDirection: ''
      },
      list: [],
      treeData: [],
      str: '',
      editInfoObj: {},
      addAuthShow: false,
      addAuthVisible: false,
      editAuthShow: false,
      editAuthVisible: false,
      selectedAppCode: null
    }
  },
  created() {
    this.nextTickWrap()
  },
  methods: {
    nextTickWrap() {
      this.$nextTick(() => {
        this.forceUpdateTree()
      })
    },
    async forceUpdateTree() {
      this.treeData = await this.$refs.appTree.getTree()
      if (typeof this.appId !== 'undefined') {
        // 若存在 deptId 等  tree更新完成  高亮当前行
        this.$refs.appTree &&
          this.$refs.appTree.setCurrentKey &&
          this.$refs.appTree.setCurrentKey(this.appId)
      }
    },

    // 搜索
    resetgetList() {
      this.searchParam.pageIndex = 1
      this.getPage()
    },
    // 获取点击的节点
    getNodeObj(obj) {
      this.searchParam.appId = obj.id
      this.getPage()
    },
    // 数据绑定
    bindData(val) {
      this.refreshData(val)
    },
    // 刷新数据
    refreshData(val) {
      this.appId = this.searchParam.appId = val
      this.getPage()
    },
    // 权限列表
    getPage() {
      getPage(this.searchParam).then(res => {
        if (res.data.success) {
          this.list = res.data.data.records
          this.pagination.records = res.data.data.total
        }
      })
    },

    // 删除权限
    deleteItem(industryId) {
      this.$confirm('确认删除权限?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteIndustry({ guid: industryId }).then(res => {
          if (res && res.data.success) {
            this.$message({
              showClose: true,
              message: '删除成功',
              type: 'success'
            })
            this.getPage()
          } else {
            this.$message({
              showClose: true,
              message: '错误：' + res.data.msg,
              type: 'error'
            })
          }
        })
      })
    },
    // 新增权限
    addItem() {
      const appId = this.appId
      this.editInfoObj = { appId: appId, appCode: this.selectedAppCode }
      this.addAuthShow = true
      this.addAuthVisible = true
      this.str = '添加'
    },
    // 关闭新增权限
    closeAddAuth(bool) {
      this.addAuthVisible = false
      this.addAuthShow = false
      if (bool) {
        this.getPage()
      }
    },
    // 编辑权限
    editItem(row) {
      const appId = this.searchParam.appId
      this.editInfoObj = { uuid: row.industryId, appId: appId, appCode: this.selectedAppCode }
      this.editAuthShow = true
      this.editAuthVisible = true
      this.str = '编辑'
    },
    // 关闭编辑
    closeEditAuth(bool) {
      this.editAuthVisible = false
      this.editAuthShow = false
      if (bool) {
        this.getPage()
      }
    },
    // 更新AppID
    updateAppId(val) {
      this.appId = this.searchParam.appId = val.id
      getAppCodeByGuid({ id: this.appId }).then(res => {
        if (res && res.data.success) {
          this.selectedAppCode = res.data.data
        }
      })
      this.getPage()
    }
  }
}
</script>

<style lang='scss'>
  .authMn {
    display: flex;
    height: calc(100vh - 50px);

    .leftSide {
      width: 18%;
      float: left;
      overflow: hidden;
      position: relative;

      .box {
        border: 1px solid #ebeef5;
        width: 100%;
        padding: 10px;
        border-radius: 5px;
        position: absolute;
        top: 0;
        bottom: 0;

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
      width: 80%;
      float: left;
      overflow: auto;
      margin-left: 1.5%;
    }
  }
</style>
