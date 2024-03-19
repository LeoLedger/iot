<!--
* @description 问题反馈
* @author 王鹏
!-->
<template>
    <el-dialog
        :visible.sync="feedbackVisible"
        :before-close="handleDialogClose"
        :close-on-press-escape="false"
        title="意见反馈"
        width="800px"
        class="feedback-container"
    >
        <div class="feedback-header">
            <h2>尊敬用户您好：</h2>
            <p>为了给您提供更加完善的系统使用体验和服务，我们希望收集并了解您在系统使用过程中，发现的问题或意见建议。对您的配合和支持表示衷心的感谢！</p>
        </div>
        <!-- 意见反馈表单 -->
        <el-form
            ref="feedbackForm"
            :model="feedbackForm"
            :rules="rules"
            label-position="left"
            label-suffix="："
            label-width="120px"
            size="mini"
            class="feedback-form"
        >
            <el-form-item label="主题">
                <el-input v-model="feedbackForm.theme" placeholder="请填写反馈问题的主题" />
            </el-form-item>
            <el-form-item label="功能模块" class="feedback-features">
                <!-- 借用 input 框样式 -->
                <el-input v-if="featuresText.length == 0" placeholder="请选择反馈的功能模块" />
                <div class="feedback-features-cont" @click="handleFeaturesClick">{{ featuresText }}</div>
            </el-form-item>
            <el-form-item label="请选择提交类型" class="feedback-radio-wrap">
                <div v-for="item in radioList" :key="item.id" class="feedback-radio-item">
                    <el-radio v-model="radioType" :label="item.question" border>{{ item.question }}</el-radio>
                </div>
            </el-form-item>
            <el-form-item label="详细说明">
                <el-input
                    v-model="feedbackForm.describe"
                    :autosize="{ minRows: 3 }"
                    type="textarea"
                    placeholder="您对该功能模块有什么想法，请大声说出来吧！（例如：哪里有问题，哪些功能做得不够好等）"
                />
            </el-form-item>
            <el-form-item label="上传附件">
                <Upload :form="feedbackForm" :params="feedbackForm" />
            </el-form-item>
            <el-form-item style="text-align: right">
                <el-button @click="saveFeedbackForm">暂存</el-button>
                <el-button type="primary" @click="submitFeedbackForm('false')">提交</el-button>
            </el-form-item>
        </el-form>
        <!-- 功能模块弹窗 -->
        <el-dialog
            :visible.sync="featuresVisible"
            :close-on-press-escape="false"
            title="功能模块"
            width="500px"
            append-to-body
            class="feedback-features-dialog"
            @close="handleFeaturesDialogClose"
        >
            <el-input v-model="filterText" size="mini" placeholder="输入关键字进行过滤" />
            <el-tree
                ref="tree"
                :data="featuresTreeData"
                :props="defaultProps"
                :filter-node-method="filterNode"
                class="features-tree"
                default-expand-all
                @node-click="handleFeaturesNodeClick"
            />
            <span slot="footer">
                <el-button size="mini" @click="handleFeaturesDialogClose">取 消</el-button>
                <el-button size="mini" type="primary" @click="handleFeaturesDialogClick">确 定</el-button>
            </span>
        </el-dialog>
    </el-dialog>
</template>
<script>
    import { uploadFileUrl } from '@/utils'
    import Upload from '@/components/customizeFormItem/Upload'
    import request from '@/utils/request'

    export default {
        name: 'FeedBack',
        components: {
            Upload
        },
        props: {
            feedbackVisible: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                uploadUrl: uploadFileUrl,
                // 意见反馈表单
                feedbackForm: {
                    id: 0, // 编辑的时候需要传
                    theme: '', // 主题
                    moduleIdArr: [], // 功能模块
                    moduleId: 0, // 归属模块id 选中的最后一级id 如果只选中第一级则全部传选中的第一级id
                    menuId: 0, // 根菜单id 首页同级别的id
                    feedbackOptionName: '', // 问题类型
                    satisfaction: 0, // 满意度
                    describe: '', // 详细说明
                    tempStore: false, // 是否暂存
                    prop: 'files', // upload组件对应字段名
                    files: [] // 上传文件
                },
                // 规则
                rules: {
                    name: [
                        {
                            required: true,
                            message: '请输入活动名称',
                            trigger: 'blur'
                        },
                        {
                            min: 3,
                            max: 5,
                            message: '长度在 3 到 5 个字符',
                            trigger: 'blur'
                        }
                    ],
                    region: [
                        {
                            required: true,
                            message: '请选择活动区域',
                            trigger: 'change'
                        }
                    ],
                    date1: [
                        {
                            type: 'date',
                            required: true,
                            message: '请选择日期',
                            trigger: 'change'
                        }
                    ],
                    date2: [
                        {
                            type: 'date',
                            required: true,
                            message: '请选择时间',
                            trigger: 'change'
                        }
                    ],
                    type: [
                        {
                            type: 'array',
                            required: true,
                            message: '请至少选择一个活动性质',
                            trigger: 'change'
                        }
                    ],
                    resource: [
                        {
                            required: true,
                            message: '请选择活动资源',
                            trigger: 'change'
                        }
                    ],
                    desc: [
                        {
                            required: true,
                            message: '请填写活动形式',
                            trigger: 'blur'
                        }
                    ]
                },
                featuresText: '', // 功能模块展示信息
                featuresSlectNode: [], // 选中的功能模块数组
                featuresVisible: false,
                filterText: '', // 过滤关键词
                // 功能模块数据
                featuresTreeData: [],
                defaultProps: {
                    children: 'children',
                    label: 'label'
                },
                treeDownTime: null, // 记录树形控件单击时的时间戳，用于实现双击
                // 提交类型
                radioList: [],
                radioType: '', // 选中的提交类型
                fileList: [], // 上传文件列表
                flieIndex: [], // 查看图片的坐标值
                checkSave: false, // 确认暂存
                carouselVisible: false // 轮播图窗口
            }
        },
        computed: {},
        watch: {
            feedbackVisible(newVal, oldVal) {
                // console.log(newVal)
                if (newVal && !this.checkSave) {
                    this.getFeedbackSave()
                }
            },
            filterText(val) {
                this.$refs.tree.filter(val)
            }
        },
        created() {
            this.delayTimer = null
        },
        methods: {
            // 获取意见反馈暂存信息
            getFeedbackSave() {
                request({
                    url: '/api/Feedback/0',
                    method: 'get'
                }).then(res => {
                    const result = res.data
                    if (result.data) {
                        this.feedbackForm = result.data
                        this.feedbackForm.prop = 'files'
                        this.featuresText = result.data.moduleStr
                        this.radioType = result.data.feedbackOptionName
                    }
                    this.checkSave = true
                    this.getFeedbackOption()
                })
            },
            // 获取问题配置信息
            getFeedbackOption() {
                request({
                    url: '/api/FeedbackOption',
                    method: 'get'
                }).then(res => {
                    this.radioList = res.data
                })
            },
            // 弹窗关闭
            handleDialogClose() {
                this.$confirm('确认关闭？')
                    .then(_ => {
                        this.$emit('closeFeedbackDialog')
                        done()
                    })
                    .catch(_ => {})
            },
            // 获取功能模块
            handleFeaturesClick() {
                this.featuresVisible = true
                // appId
                if (this.featuresTreeData.length === 0) {
                    request({
                        url: '/api/Menu/GetMenuListForVue',
                        method: 'get',
                        params: {
                            appId: this.$store.state.user.setsslKEY.appId
                        }
                    }).then(res => {
                        const result = res.data
                        function setLabel(list) {
                            list.map((v, i) => {
                                v.label = v.meta.title
                                if (v.children.length > 0) {
                                    setLabel(v.children)
                                }
                            })
                        }
                        setLabel(result.data)
                        this.featuresTreeData = result.data
                    })
                }
            },
            // 过滤树形节点
            filterNode(value, data) {
                if (!value) return true
                return data.label.indexOf(value) !== -1
            },
            // 功能模块树点击事件
            handleFeaturesNodeClick(select, node) {
                // console.log(select, node)
                // 获取目标menuId及label值
                function getSelectNode(node, arr) {
                    if (node.parent) {
                        arr[node.level - 1] = {
                            value: node.data.menuId,
                            label: node.data.label
                        }
                        getSelectNode(node.parent, arr)
                    }
                    return arr
                }
                this.featuresSlectNode = getSelectNode(node, [])
                /**
                 * 树形控件被点击时，判断treeDownTime是否为null来确定当前是否是第二次点击
                 */
                clearTimeout(this.delayTimer)
                if (this.treeDownTime) {
                    if (Date.now() - this.treeDownTime < 300) {
                        this.treeDownTime = null
                        this.handleFeaturesDialogClick()
                    } else {
                        this.treeDownTime = null
                    }
                } else {
                    this.treeDownTime = Date.now()
                    this.delayTimer = setTimeout(() => {
                        this.treeDownTime = null
                    }, 500)
                }
            },
            // 功能模块弹窗关闭事件
            handleFeaturesDialogClose() {
                this.filterText = ''
                this.featuresVisible = false
                this.featuresSlectNode = []
            },
            // 功能模块弹窗确认事件
            handleFeaturesDialogClick() {
                const arr = []
                let str = ''
                this.featuresSlectNode.map((v, i) => {
                    str += v.label + ' / '
                    // 获取功能模块显示内容对应value
                    arr.push(v.value)
                })
                if (arr.length === 0) {
                    this.$message.warning('请选择系统级别以下的功能模块')
                    return
                }
                // 设置功能模块显示内容
                this.featuresText = str.substring(0, str.length - 2)
                this.feedbackForm.moduleIdArr = arr // 功能模块
                this.feedbackForm.moduleId = arr[arr.length - 1] // 归属模块id 选中的最后一级id 如果只选中第一级则全部传选中的第一级id
                this.feedbackForm.menuId = arr[0] // 根菜单id 首页同级别的id
                this.featuresVisible = false
                this.treeDownTime = null
            },
            // 暂存意见反馈
            saveFeedbackForm() {
                this.submitFeedbackForm(true)
            },
            // 提交意见反馈
            submitFeedbackForm(bool) {
                const formData = this.feedbackForm
                const reg = /(^\s{0,})|(\s{0,}$)/g
                formData.tempStore = bool === 'false' ? false : bool
                formData.feedbackOptionName = this.radioType
                this.radioList.map((v, i) => {
                    if (v.question === this.radioType) {
                        formData.satisfaction = v.satisfaction
                    }
                })
                if (!formData.theme.replace(reg, '')) {
                    this.$message.warning('请填写主题!')
                    return
                }
                if (formData.moduleIdArr.length === 0) {
                    this.$message.warning('请选择功能模块!')
                    return
                }
                if (!formData.feedbackOptionName) {
                    this.$message.warning('请选择提交类型!')
                    return
                }
                delete formData.prop

                for (let i = 0; i < formData.files.length; i++) {
                    delete formData.files[i].status
                    delete formData.files[i].uid
                }
                request({
                    url: '/api/Feedback',
                    method: 'post',
                    data: formData
                }).then(res => {
                    this.$message.success('操作成功')
                    this.$emit('closeFeedbackDialog')
                    // 初始化数据
                    this.featuresText = ''
                    this.radioType = ''
                    this.checkSave = false
                    this.feedbackForm = {
                        id: 0, // 编辑的时候需要传
                        theme: '', // 主题
                        moduleIdArr: [], // 功能模块
                        moduleId: 0, // 归属模块id 选中的最后一级id 如果只选中第一级则全部传选中的第一级id
                        menuId: 0, // 根菜单id 首页同级别的id
                        feedbackOptionName: '', // 问题类型
                        satisfaction: 0, // 满意度
                        describe: '', // 详细说明
                        tempStore: false, // 是否暂存
                        files: [] // 上传文件
                    }
                })
            }
        }
    }
</script>

<style lang='scss'>
.feedback-container {
    .el-dialog__header {
        line-height: 20px;
    }
}

.feedback-header {
    padding: 10px 0 30px;
    line-height: 20px;
    border-bottom: 1px solid #d4d4d4;
    h2,
    p {
        line-height: 20px;
        font-size: 14px;
        color: #555;
    }
    h2 {
        margin: 0;
        font-weight: normal;
    }
}

.feedback-form {
    padding-top: 20px;
    max-height: 620px;
    overflow-y: auto;
    label {
        font-weight: normal;
    }
    .feedback-radio-wrap {
        margin-bottom: 8px;
    }
}

.feedback-features {
    position: relative;
}

.feedback-features-cont {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 28px;
    padding: 0 15px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    cursor: pointer;
}

.features-tree {
    max-height: 600px;
    overflow-y: auto;
}

.feedback-radio-item {
    float: left;
    padding-right: 10px;
    padding-bottom: 10px;
}

.feedback-upload {
    .el-upload {
        vertical-align: middle;
    }
    .el-upload-dragger {
        width: 180px;
        height: 100px;
    }
    .el-icon-upload {
        font-size: 40px;
        margin: 10px 0 0;
    }
    .el-upload__text {
        font-size: 12px;
    }
}

.feedback-upload-tip {
    display: inline-block;
    max-width: 400px;
    vertical-align: middle;
    padding-left: 10px;
    color: #aaa;
}
</style>
