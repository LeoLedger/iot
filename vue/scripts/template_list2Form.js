/**
 * @desc template.js    左侧列表 右侧表单 模板 todo
 */
const getUpperCaseName = (componentName) => componentName.replace(/^(\w)/, (match, s) => s.toUpperCase())

module.exports = {
    // 列表主模板
    vueTemplate: componentName => {
        const upperCaseName = getUpperCaseName(componentName)
        return `<!--
* @description 添加描述@todo
* @fileName list.vue
* @author 添加作者@todo
!--><template>
    <layout-template
        :table-columns.sync="tableData.columns"
        :filter-model.sync="searchParam"
        :filter-button="true && !!'@todo checkFeature([uuid])'"
        @search="getList(true)"
    >
        <template slot="button">
            <!-- 新增 -->
            <el-button
                v-waves
                v-if="true && !!'@todo checkFeature([uuid])'"
                type="success"
                icon="el-icon-plus"
                size="mini"
                @click="addItem"
            >添加</el-button>
        </template>
        <template slot="filter">
            <el-select
                v-model="searchParam.projectId"
                placeholder="所属项目"
                clearable
                filterable
                class="filter-item"
                size="mini"
                @change="getList(true)"
            >
                <el-option
                    v-for="item in projectList"
                    :key="item.id"
                    :label="item.projectName"
                    :value="item.id"
                />
            </el-select>
            <el-select
                v-model="searchParam.classesId"
                placeholder="事件类型"
                clearable
                filterable
                class="filter-item"
                size="mini"
                @change="getList(true)"
            >
                <el-option
                    v-for="item in eventTypeList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
            </el-select>
            <el-select
                v-model="searchParam.statusEnum"
                placeholder="审核状态"
                clearable
                filterable
                class="filter-item"
                size="mini"
                @change="getList(true)"
            >
                <el-option
                    v-for="item in eventStatusEnum"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
            </el-select>
            <el-date-picker
                v-model="searchParam.dateTimeRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                class="filter-item"
                size="mini"
                value-format="yyyy-MM-dd"
                @change="getList(true)"
            />
        </template>
        <template slot="filter-popup">
            <layout-filter-item label="所属项目">
                <el-select
                    v-model="searchParam.projectId"
                    placeholder="所属项目"
                    clearable
                    filterable
                    class="filter-item"
                    size="mini"
                >
                    <el-option
                        v-for="item in projectList"
                        :key="item.id"
                        :label="item.projectName"
                        :value="item.id"
                    />
                </el-select>
            </layout-filter-item>
            <layout-filter-item label="被考核人名称">
                <el-input
                    v-model="searchParam.checkPeople"
                    placeholder="被考核人名称"
                    clearable
                    class="filter-item"
                    size="mini"
                />
            </layout-filter-item>
            <layout-filter-item label="事件类型">
                <el-select
                    v-model="searchParam.classesId"
                    placeholder="事件类型"
                    clearable
                    filterable
                    class="filter-item"
                    size="mini"
                >
                    <el-option
                        v-for="item in eventTypeList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </layout-filter-item>
            <layout-filter-item label="审核状态">
                <el-select
                    v-model="searchParam.statusEnum"
                    placeholder="审核状态"
                    clearable
                    filterable
                    class="filter-item"
                    size="mini"
                >
                    <el-option
                        v-for="item in eventStatusEnum"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </layout-filter-item>
            <layout-filter-item label="上报时间">
                <el-date-picker
                    v-model="searchParam.dateTimeRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    class="filter-item"
                    size="mini"
                    value-format="yyyy-MM-dd"
                />
            </layout-filter-item>
            <layout-filter-item label="编号">
                <el-input
                    v-model="searchParam.code"
                    placeholder="编号"
                    clearable
                    class="filter-item"
                    size="mini"
                />
            </layout-filter-item>
        </template>
        <template slot="table">
            <TableComponent
                v-bind="tableData"
                :cur_row="cur_row"
                :page-size.sync="searchParam.pageSize"
                :page-index.sync="searchParam.pageIndex"
                height="100%"
                @refreshList="handleRefreshList"
                @handleCurrentChange="handleCurrentChange"
            />
        </template>
        <template slot="right">
            <layout-box width="40vw" min-width="400px" padding-top="0">
                <layout-col height="100%">
                    <el-tabs v-model="viewData.tabActiveName" class="layout-tabs">
                        <el-tab-pane name="1">
                            <span slot="label">
                                <i class="el-icon-document"/> 基础信息
                            </span>
                            <div class="body-wrap">
                                <div class="layout-filter">
                                    <el-button
                                        v-waves
                                        v-if="true && !!'@todo checkFeature([uuid])'"
                                        :disabled="handleDisabled"
                                        type="primary"
                                        size="mini"
                                        icon="el-icon-edit"
                                        class="button-item"
                                        title="编辑"
                                        @click="handleEdit"
                                    />
                                    <el-button
                                        v-waves
                                        v-if="true && !!'@todo checkFeature([uuid])'"
                                        :disabled="handleDisabled"
                                        type="danger"
                                        size="mini"
                                        icon="el-icon-delete"
                                        class="button-item"
                                        title="删除"
                                        @click="handleDel"
                                    />
                                </div>
                                <Form
                                    v-loading="baseFormLoading"
                                    ref="baseInfo"
                                    :formData="curFormData"
                                    :isEdit="false"
                                    :projectList="projectList"
                                    :eventTypeList="eventTypeList"
                                    class="base-info"
                                    element-loading-text="加载中..."
                                    element-loading-background="rgba(0, 0, 0, 0.1)"
                                />
                            </div>
                        </el-tab-pane>
                        <el-tab-pane name="2">
                            <span slot="label">
                                <i class="el-icon-document-checked"/> 预警信息（4）
                            </span>
                            <div>预警信息 todo..</div>
                        </el-tab-pane>
                    </el-tabs>
                </layout-col>
            </layout-box>
        </template>
        <!-- 编辑/创建 -->
        <EditDialog
            v-if="editVisible"
            :visible.sync="editVisible"
            :is-create="isCreate"
            :form-data="editData"
            :project-list="projectList"
            :event-type-list="eventTypeList"
            @editSubmitCallBack="editSubmitCallBack"
        />
    </layout-template>
</template>

<script>
    import { eventStatusEnum } from '@/utils/enum'
    import resourceApi from '@/api/resource'
    // todo 相关模块接口 新建及 修改
    import {
        getCaseList, // 搜索列表
        queryIncidentComplaint, // 申诉
        deleteCaseInfo, // 删除
        queryInvalidCase, // 作废
        getCaseInfo, // 详情
        getExamineTree // 事件扣分...
    } from '@/api/PI'
    import EditDialog from './components/EditDialog'
    import Form from './components/Form'
    import { clearNoChildren } from '@/utils'

    export default {
        name: '${upperCaseName}',
        components: {
            EditDialog,
            Form
        },
        data() {
            return {
                tableData: {
                    list: [],
                    total: 0,
                    options: {
                        stripe: true,
                        loading: false
                    },
                    // todo 使用新生成的 columns 替换
                    columns: [
                        {
                            prop: 'code',
                            label: '编号',
                            minWidth: 130,
                            disabled: true,
                            fixed: true
                        },
                        {
                            prop: 'classes',
                            label: '事件类型',
                            minWidth: 130,
                            disabled: true
                        },
                        {
                            prop: 'status',
                            label: '状态',
                            width: 130,
                            disabled: true
                        },
                        {
                            prop: 'reportDate',
                            label: '上报时间',
                            sortable: 'custom',
                            width: 84
                        },
                        {
                            prop: 'projectName',
                            label: '项目',
                            width: 140
                        },
                        {
                            prop: 'checkPeople',
                            label: '被考核人',
                            width: 80
                        },
                        {
                            prop: 'score',
                            label: '扣分（分）',
                            sortable: 'custom',
                            width: 108
                        },
                        {
                          prop: 'amount',
                          label: '扣款（元）',
                          sortable: 'custom',
                          minWidth: 108
                        }
                      ]
                },
                viewData: {
                  tabActiveName: '1'
                },
                processData: [],
                  projectList: [],
                  eventTypeList: [],
                  eventStatusEnum,
                  searchParam: {
                  pageIndex: 1, // 当前页码
                    pageSize: 15, // 每页数量
                    checkPeople: '',
                    projectId: '',
                    classes: [],
                    statusEnum: '',
                    code: '',
                    beginDate: '',
                    endDate: '',
                    dateTimeRange: []
                },
                baseFormLoading: false,
                  cur_row: null,
                  editVisible: false,
                  handleDisabled: true, // 操作按钮隐藏
                  curFormData: {},
                editData: {}, // 编辑 / 新增
                isCreate: false,
                  formOptions: {
                  loading: false,
                    submitBtnText: '提交',
                    showCancelBtn: true,
                    labelWidth: 80,
                    span: 12,
                    forms: []
                },
                reviewDialogVisible: false,
                  reviewData: {}
                }
        },
        watch: {
          'searchParam.pageSize'() {
            this.getList()
          },
          'searchParam.pageIndex'() {
            this.getList()
          },
          'searchParam.dateTimeRange'() {
            const [beginDate, endDate] = this.searchParam.dateTimeRange || []
            this.searchParam.beginDate = beginDate
            this.searchParam.endDate = endDate
          }
        },
        created() {
          this.queryInitData()
          this.getList()
        },
        methods: {
          checkFeature,
            // 请求初始化数据
            queryInitData() {
            // 在营项目
            resourceApi.getSimpleProjectList(1).then(res => {
              this.projectList = res.data.data.rows
            })
            // 事件类型
            getExamineTree().then(res => {
              const _data = res.data || []
              clearNoChildren(_data)
              this.eventTypeList = _data
            })
          },
          // 请求数据列表
          getList(isReset) {
            if (isReset) {
              this.searchParam.pageIndex = 1
            }
            this.tableData.options.loading = true
            // todo 修改获取列表的接口
            getCaseList(this.searchParam).then(res => {
              if (res.data.success) {
                const data = res.data.data
                this.tableData.list = data.rows
                this.tableData.total = data.records
                // 默认请求完成选中上一次选中的数据，如果没有或isReset=true时则选中第一行，
                if (this.tableData.total) {
                  let cur_row = this.tableData.list[0]
                  if (!isReset && this.tableData.cur_row) {
                    const index = this.tableData.list.findIndex(item => {
                      return item.id === this.tableData.cur_row.id
                    })
                    if (index > -1) {
                      cur_row = this.tableData.list[index]
                    }
                  }
                  this.handleCurrentChange(cur_row)
                } else {
                  this.tableData.cur_row = null
                }
              }
              this.tableData.options.loading = false
            })
          },
          handleCurrentChange(row) {
            const { id, canHandle, caseStatus } = row || {}
            if (id === this.ACTIVE_ID) {
              return
            }
            if (this.handleDisabled) {
              this.handleDisabled = false
            }
            this.ACTIVE_ID = id
            this.cur_row = row
            this.queryCurRowData(id)
          },
          queryCurRowData(id) {
            this.baseFormLoading = true
            getCaseInfo(id)
              .then(res => {
                const { data } = res.data
                this.curFormData = data
              })
              .finally(() => {
                this.baseFormLoading = false
              })
            // tab 2 todo fetch
          },
          addItem() {
            this.editVisible = true
            this.isCreate = true // 创建
            this.editData = {}
          },
          handleEdit() {
            this.editVisible = true
            this.isCreate = false // 编辑
            const editData = JSON.parse(JSON.stringify(this.curFormData))
            // 新添自定义字段...
            editData.classes = (editData.classList || []).map(
              item => item.value
            )
            this.editData = editData
          },
          editSubmitCallBack(isCreate) {
            // 创建 / 编辑 弹窗 回调成功  更新数据...
            this.getList()
            if (!isCreate) {
              // 编辑成功 需要更新当前详情
              this.queryCurRowData(this.ACTIVE_ID) // 编辑成功 更新当前的详情数据
            }
          },
          handleDel() {
            this.$confirm('此操作将删除此记录, 是否继续?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
              center: true
            }).then(() => {
              deleteCaseInfo(this.ACTIVE_ID).then(res => {
                const { success, message } = res.data
                if (success) {
                  this.$message({
                    type: 'success',
                    message: '删除成功!'
                  })
                  this.cur_row = {}
                  this.handleDisabled = true // 按钮置灰
                  this.curFormData = {}
                  this.getList(true)
                }
              })
            })
          },
          handleReview() {
            this.reviewDialogVisible = true
            const reviewData = JSON.parse(JSON.stringify(this.curFormData))
            // 自定义字段 展示...
            const { classList = [] } = reviewData
            reviewData.classes = classList.length ? [classList[0].value] : []
            this.reviewData = reviewData
          },
          handleCancel() {
            // 作废
            const { id } = this.curFormData
        
            this.$confirm('此操作将作废此记录, 是否继续?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
              center: true
            }).then(() => {
              queryInvalidCase(id).then(res => {
                const { success, message } = res.data
                if (success) {
                  this.$message({
                    type: 'success',
                    message: '请求成功，已作废!'
                  })
                  this.handleDisabled = true // 按钮置灰
                  this.curFormData = {}
                  this.getList(true)
                }
              })
            })
          },
          // 表单弹窗 提交
          formDialogSubmit(params) {
            this.$set(this.formOptions, 'loading', true)
            // 表单提交 @todo
            params.caseId = this.ACTIVE_ID // 绑定事件id
            queryIncidentComplaint(params).then(res => {
              this.$set(this.formOptions, 'loading', false)
              const { success, message } = res.data
              if (success) {
                this.$message.success('请求处理成功')
                this.editSubmitCallBack(false) // 详情 列表刷新
              }
            })
          },
          // 点击排序时触发
          handleRefreshList(obj) {
            this.searchParam = Object.assign({}, this.searchParam, obj)
            this.getList()
          }
        }
    }
</script>

<style lang="scss" scoped>
.body-wrap {
  height: 100%;
  display: flex;
  flex-direction: column;
.base-info {
    flex: 1;
    overflow: auto;
  }
}
</style>`
    },

    // form 表单模板
    vueFormTemplate: test => {
        return `<!--
* @description 表单
* @author todo 修改author
!-->
<template>
    <div>
        <FormConfig
            ref="baseForm"
            v-bind="$data"
            :form-data="computedFormData"
            :is-edit="isEdit"
            :has-default-form-class="!isEdit"
            :submit-loading="formLoading"
            :cancel="closeDialog"
            :submit="submit"
            :show-footer="false"
        />
        <!-- 表单涉及到的扩展弹窗相关 todo... -->
    </div>
</template>

<script>
    import { eventStatusEnum } from '@/utils/enum'
    import FormConfig from '@/components/FormConfig.vue'
    // 编辑 新建 / 获取个人信息
    import { editCaseInfo, getPeopleInfoByUserIdAsync } from '@/api/PI'
    import { getFlowForCaseProcess } from '@/api/flow'
    export default {
        name: 'Form',
        components: {
            FormConfig
        },
        props: {
            formData: {
                type: Object,
                default: () => {
                    return {}
                }
            },
            getFlowData: {
                type: Array,
                default: () => {
                    return []
                }
            },
            isEdit: { // 大小类 类型 是否可编辑
                type: Boolean,
                default: false
            },
            isCreate: {
                type: Boolean,
                default: false
            },
            // 判断是否 审核弹窗引用
            isReview: {
                type: Boolean,
                default: false
            },
            projectList: {
                type: Array,
                default: () => []
            },
            eventTypeList: {
                type: Array,
                default: () => []
            }
        },
        data() {
            const _this = this
            return {
                curParams: {},
                labelWidth: 80,
                span: 12,
                showCancelBtn: true,
                formLoading: false, // 提交按钮loading
                infoRowId: 0, // 人员id
                infoDialogVisible: false, // 人员详情弹窗
                // @todo
                forms: [
                    {
                        prop: 'code',
                        label: '编号',
                        itemType: 'input',
                        disabled: true
                    },
                    {
                        prop: 'status',
                        label: '状态',
                        itemType: 'select',
                        disabled: true,
                        options: eventStatusEnum
                    },
                    {
                        prop: 'reporter',
                        label: '上报人',
                        disabled: true,
                        style: 'color: #02a7f0; cursor: pointer;',
                        click: (prop, formData) => {
                            console.log(prop, formData)
                            const name = formData.reporter
                            const row = _this.localFlowData.find(v => v.inUserName === name)
                            if (row) {
                                getPeopleInfoByUserIdAsync({ id: row.inUserId }).then(res => {
                                    // console.log(res)
                                    const result = res.data
                                    if (result.success) {
                                        this.infoRowId = result.data.id
                                        this.infoDialogVisible = true
                                    }
                                })
                            }
                        }
                    },
                    {
                        prop: 'reportDate',
                        label: '上报时间',
                        itemType: 'date',
                        disabled: true
                    },
                    { // [4]
                        prop: 'projectId',
                        label: '项目',
                        span: 24,
                        itemType: 'select',
                        labelKey: 'projectName',
                        valueKey: 'id',
                        rules: [
                            { required: true, message: '请选择项目', trigger: 'change' }
                        ],
                        change(e, options, params) {
                            // 切换项目时，清空被考核人
                            params.picIds = []
                            params.checkPeoplesName = []
                        }
                    },
                    {
                        prop: 'checkPeoplesName',
                        props: ['picIds'],
                        label: '被考核人',
                        itemType: 'peoplePick',
                        multiple: true,
                        span: 24,
                        queryInfo: _this.queryPeopleInfo
                    },
                    { // [6]
                        prop: 'classes', // 事件 大小类 自定义字段
                        label: '事件类型',
                        span: 24,
                        itemType: 'cascader',
                        rules: [
                            { required: true, message: '请选择事件类型', trigger: 'change' }
                        ],
                        formatter(params, formData) {
                            console.log(params)
                            const result = params.classList || []
                            return result[0] && result[0].label
                        }
                    },
                    {
                        prop: 'classList',
                        label: '考核标准',
                        disabled: true,
                        span: 24,
                        itemType: 'onlyshow',
                        formatter(params, formData) {
                            const result = params.classList || [],
                                  showData = result[result.length - 1]
                            return showData && showData.label || '- -'
                        }
                    },
                    {
                        prop: 'score',
                        label: '扣分（分）',
                        itemType: 'inputNumber',
                        precision: 1
                    },
                    {
                        prop: 'amount',
                        label: '扣款（元）',
                        itemType: 'inputNumber',
                        precision: 2,
                        max: 9999,
                        style: 'color: #fd0404' // red
                    },
                    {
                        itemType: 'addressInput',
                        prop: 'address', // ['address', 'point'],
                        props: ['point'], // 该formItem 被绑定的其他数据
                        isLimitProject: true,
                        label: '详细位置',
                        span: 24
                    },
                    {
                        prop: 'desc',
                        label: '情况说明',
                        span: 24,
                        itemType: 'textarea'
                    },
                    {
                        prop: 'caseFiles',
                        label: '附件',
                        itemType: 'upload',
                        span: 24,
                        accept: '.jpg, .jpeg, .png'
                    }
                ],
                formsOption: {
                    span: 12,
                    showFooter: false,
                    labelWidth: 80
                },
                localFlowData: []
            }
        },
        computed: {
            computedFormData() {
                return { ...this.formData, ...this.curParams }
            }
        },
        watch: {
            'formData.id': {
                handler(newId) {
                    if (!Array.isArray(this.getFlowData) || !this.getFlowData.length) {
                        if (!newId) return
                        this.formLoading = true
                        getFlowForCaseProcess(newId).then(res => {
                            this.localFlowData = res.data.data || []
                        }).finally(_ => {
                            this.formLoading = false
                        })
                    } else {
                        this.localFlowData = this.getFlowData
                    }
                },
                immediate: true
            },
            forms: {
                immediate: true,
                handler(newData) {
                    this.setFormsOptions('projectId', this.projectList) // 所属项目
                    this.setFormsOptions('classes', this.eventTypeList) // 事件类型
                }
            },
            projectList: {
                // immediate: true,
                handler(newData) {
                    this.setFormsOptions('projectId', newData)
                }
            },
            eventTypeList(newData) {
                this.setFormsOptions('classes', newData)
            },
            isEdit: {
                immediate: true,
                handler(newData) {
                }
            },
            isReview: {
                immediate: true,
                handler(newData) {
                    // console.log('isReview', newData)
                    const formEdit = !newData
                    this.forms = this.forms.map(form => {
                        return { ...form, isEdit: formEdit }
                    })
                }
            }
        },
        created() {
            if (this.isCreate) {
                // 新创建 不展示前面4 form的表单
                this.forms.splice(0, 4)
            }
        },
        methods: {
            formSubmit() {
                this.$refs.baseForm.submitHandler()
            },
            setFormsOptions(prop, options) {
                // const index = this.forms.findIndex((form) => {
                //     return form.prop === prop
                // })
                // index > -1 && this.$set(this.forms[index], 'options', options)
            },
            submit(params) {
                this.formLoading = true
                const submitParams = { ...this.formData, ...params }
                editCaseInfo(submitParams).then(res => {
                    this.formLoading = false
                    const { success, message } = res.data
                    if (success) {
                        this.$message.success('请求处理成功')
                        this.closeDialog() // 关闭按钮
                        // 若不是 isCreate 就表示 编辑
                        this.$emit('editSubmitCallBack', this.isCreate) // 触发操作成功的回调   // 编辑 / 新建
                    }
                })
            },
            closeDialog() {
                this.changeDialog(false)
            },
            changeDialog(bool) {
                this.$emit('updateVisible', bool)
            },
            queryPeopleInfo(id) {
                this.infoRowId = id
                this.infoDialogVisible = true
            }
        }
    }
</script>

<style lang="scss" scoped>
</style>
`
    },

    // 编辑、新增 弹窗模板
    editDialogTemplate: test => {
        return `<!--
* @description 弹窗
* @author todo 修改author
!-->
<template>
    <!-- 弹窗 新增 / 编辑 -->
    <el-dialog
        :title="title"
        :visible="visible"
        :close-on-click-modal="false"
        class="formDialog"
        width="720px"
        @close="closeDialog"
    >
        <div class="checkContainer">
            <ul class="tabs">
                <li v-if="!check" class="item">基础信息</li>
                <li
                    v-for="(item,index) in tags "
                    v-else
                    :class="{active:index===num}"
                    :key="index"
                    class="item"
                    @click="switchSlide(index)"
                >{{ item }}</li>
            </ul>
            <div class="sliderBox">
                <Form
                    v-if="slideIndex===0"
                    ref="form"
                    :formData="formData"
                    :isCreate="isCreate"
                    :isEdit="isEdit"
                    v-bind="$attrs"
                    isShowFooter
                    @updateVisible="changeDialog"
                    v-on="$listeners"
                />
                <div v-else class="todo">todo....</div>
            </div>
        </div>
        <span v-show="slideIndex===0 && isEdit" slot="footer">
            <el-button size="mini" @click="closeDialog">取消</el-button>
            <el-button v-prereclick type="primary" size="mini" @click="formSubmit">提交</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import Form from './Form'
    import { getFlowProcess, getFlowForCaseProcess } from '@/api/flow/index'

    export default {
        name: 'EditDialog',
        components: {
            Form
        },
        props: {
            check: {
                type: Boolean,
                default: true
            },
            visible: {
                type: Boolean,
                default: false
            },
            isCreate: {
                type: Boolean,
                default: false
            },
            formData: {
                type: Object,
                default: () => {
                    return {}
                }
            },
            isEdit: {
                type: Boolean,
                default: true
            }
        },
        data() {
            const { formData, isCreate, isEdit } = this.$props
            // todo
            const title = (isEdit && (isCreate ? '新增' : '编辑') + '弹窗title') || '详情弹窗title'
            return {
                num: null,
                slideIndex: null,
                tags: ['基础信息', '审核流程'],
                title,
                processList: [],
                options: {
                    height: 400,
                    stripe: true
                }
            }
        },
        mounted() {
            this.switchSlide(0)
        },
        created() {
            // !this.isCreate &&
            //     getFlowForCaseProcess(this.formData.id).then(res => {
            //         const processList = res.data.data
            //         this.processList = processList
            //     })
        },
        methods: {
            formSubmit() {
                this.$refs.form.formSubmit()
            },
            // 切换显示
            switchSlide(index) {
                this.num = index
                this.slideIndex = index
            },
            closeDialog() {
                this.changeDialog(false)
            },
            changeDialog(bool) {
                this.$emit('update:visible', bool)
            }
        }
    }
</script>

<style lang='scss' scoped>
.sliderBox{
    padding-right: 10px;
    ::v-deep {
        .FormConfig .form_wrap{
            max-height: inherit;
        }
    }
}
</style>
`
    },

    // 路由配置模板
    routeEntryTemplate: componentName => {
        return `export default {
    path: '/${componentName}/list',
    name: '${componentName}',
    component: () => import(/* webpackChunkName: "${componentName}" */ '@/views/${componentName}/list'),
    meta: {
        title: '请输入Title'
    }
}`
    },

    // 根据接口获取列表 项 创建  columns
    columnConfigTemplate: columns => {
        return `export default {
    columns: ${JSON.stringify(columns, '', '\t')}
}`
    }
}
