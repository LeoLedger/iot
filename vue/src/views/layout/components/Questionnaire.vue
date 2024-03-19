<!--
* @description 问卷调查
* @author 王鹏
!-->
<template>
    <el-dialog
        :visible.sync="questionnaireVisible"
        :before-close="handleDialogClose"
        title="问卷调查"
        class="questionnaire-container">
        <div class="questionnaire-header">
            <h2>尊敬用户您好：</h2>
            <p>为了给您提供更加完善的系统使用体验和服务，我们希望收集并了解您的系统使用情况。对您的配合和支持表示衷心的感谢！</p>
        </div>
        <!-- 左侧菜单 -->
        <div class="questionnaire-menu-wrap">
            <div class="questionnaire-menu">
                <div
                    v-for="(item, index) in featuresTreeData"
                    :key="index"
                    :class="['questionnaire-menu-item', selectIndex === index ? 'active' :'']"
                    @click="handleQuestionnaireMenuClick(index)">
                    <span>({{ item.fillNum }} / {{ item.childrenNum }})</span>{{ item.meta.title }}
                </div>
            </div>
        </div>
        <!-- 右侧问卷 -->
        <div v-loading="loading" class="questionnaire-content">
            <questionnaire-list
                :questions-list="questionsList"
                :has-save-questionnaire="hasSaveQuestionnaire"
                :has-new-moudle="hasNewMoudle"
                :answer-list="answerList"
                :select-index="selectIndex"
                :select-features="selectFeatures"
                @getQuestionnaireFromData="getQuestionnaireFromData" />
        </div>
        <span slot="footer">
            <el-button size="mini" @click="handleSaveQuestionnaireClick">暂存</el-button>
            <el-button v-prereclick size="mini" type="primary" @click="handleSubmitQuestionnaireClick">提交</el-button>
        </span>
    </el-dialog>
</template>
<script>

    import QuestionnaireList from './QuestionnaireList'
    import request from '@/utils/request'
    export default {
        name: 'Questionnaire',
        components: {
            QuestionnaireList
        },
        props: {
            questionnaireVisible: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                isSubmit: false, // 是否已提交
                checkSave: false, // 确认是否有暂存
                saveId: 0, // 暂存id
                hasSaveQuestionnaire: false, // 是否有暂存
                hasNewMoudle: false, // 暂存后是否有添加新模块
                loading: false,
                featuresTreeData: [], // 功能树
                selectFeatures: null, // 选中的模块
                selectIndex: 0, // 选中的模块索引值
                moduleList: [], // 所有表单数据
                questionsList: [], // 问题列表
                answerList: [] // 选项列表
            }
        },
        computed: {},
        watch: {
            questionnaireVisible(newVal, oldVal) {
                if (newVal) {
                    this.getSaveQuestionnaire()
                }
            }
        },
        created() {
        },
        methods: {
            // 是否有暂存问卷
            getSaveQuestionnaire() {
                // 刷新页面/暂存/提交前只请求一次
                if (this.checkSave) { return }
                this.loading = true
                request({
                    url: '/api/Questionnaire/0',
                    method: 'get'
                }).then(res => {
                    const result = res.data
                    if (result.data) {
                        this.saveId = result.data.id
                        this.hasSaveQuestionnaire = true
                        this.moduleList = result.data.moduleList
                        this.selectFeatures = result.data.moduleList[0].questionnairePageList
                        // console.log(result.data.moduleList[0].questionnairePageList)
                    } else {
                        this.hasSaveQuestionnaire = false
                    }
                    this.checkSave = true
                    // 获取选项列表
                    this.getFeaturesTree()
                })
            },
            // 获取功能模块
            getFeaturesTree() {
                // this.selectFeatures = null
                this.featuresVisible = true
                // 如果模块数量为 0 则向后台请求
                if (this.featuresTreeData.length === 0) {
                    request({
                        url: '/api/Menu/GetMenuListForVue',
                        method: 'get',
                        params: {
                            appId: this.$store.state.user.setsslKEY.appId
                        }
                    }).then(res => {
                        const result = res.data.data
                        // 获取children个数
                        result.map(v => {
                            let num = 0
                            function getObjChildren(data, menu) {
                                const list = data
                                if (list.length === 0) {
                                    num++
                                }
                                for (let i = 0; i < list.length; i++) {
                                    getObjChildren(list[i].children)
                                }
                            }
                            getObjChildren(v.children)
                            v.childrenNum = num
                        })
                        // 添加层级名字
                        result.map(v => {
                            v.menuArr = []
                            function setChildrenName(data, menu) {
                                const list = data
                                list.menu = (menu || '') + list.meta.title + ' / '
                                if (list.children.length === 0) {
                                    v.menuArr.push({
                                        moduleId: v.menuId,
                                        menuId: list.menuId,
                                        menu: list.menu
                                    })
                                }
                                for (let i = 0; i < list.children.length; i++) {
                                    setChildrenName(list.children[i], list.menu)
                                }
                            }
                            setChildrenName(v)
                        })
                        result.map(v1 => {
                            v1.menuArr.map(v2 => {
                                v2.menu = v2.menu.substring(7, v2.menu.length - 3)
                            })
                            // 设置问卷答题数量
                            v1.fillNum = 0
                            v1.desc = ''
                            // 设置表单数据
                            if (!this.hasSaveQuestionnaire) {
                                this.moduleList.push({
                                    id: 0,
                                    questionnaireId: 0,
                                    moduleId: v1.menuId,
                                    satisfaction: 0,
                                    questionnairePageList: []
                                })
                            }
                        })

                        this.featuresTreeData = result
                        // 暂存后添加的模块
                        const saveList = result.map(v => {
                            return v.menuId
                        })
                        const saveArr = [] // 储存暂存后添加的功能模块
                        for (let i = 0; i < saveList.length; i++) {
                            const id = this.moduleList[i] && this.moduleList[i].moduleId
                            // console.log(id)
                            if (saveList.indexOf(id) === -1) {
                                saveArr.push({
                                    index: i,
                                    id: saveList[i]
                                })
                                this.hasNewMoudle = true
                            }
                        }
                        // 通过筛选出来的新增模块, 再添加至答题列表
                        saveArr.map((v, i) => {
                            this.moduleList.splice(v.index, 0, {
                                id: 0,
                                questionnaireId: 0,
                                moduleId: v.id,
                                satisfaction: 0,
                                questionnairePageList: []
                            })
                        })

                        // 如果没有暂存就重新赋值
                        if (!this.hasSaveQuestionnaire) {
                            this.selectFeatures = result[0].menuArr
                        } else {
                            // 设置问卷答题数量
                            this.setQuestionNum()
                        }
                        // 获取问题列表
                        this.getQuestionnaireConfigure()
                    })
                }
                // 如果是已经提交过的
                if (this.isSubmit) {
                    const list = this.featuresTreeData
                    list.map(v => {
                        v.fillNum = 0
                        // 设置表单数据
                        if (!this.hasSaveQuestionnaire) {
                            this.moduleList.push({
                                id: 0,
                                questionnaireId: 0,
                                moduleId: v.menuId,
                                satisfaction: 0,
                                questionnairePageList: []
                            })
                        }
                    })
                    // 如果是暂存数据, 重新请求后需要设置问卷答题数量
                    if (this.hasSaveQuestionnaire) {
                        this.setQuestionNum()
                    }
                    this.featuresTreeData = list
                    this.isSubmit = false

                    // 如果没有暂存就重新赋值
                    if (!this.hasSaveQuestionnaire) {
                        this.selectFeatures = list[0].menuArr
                    }
                    // 获取问题列表
                    this.getQuestionnaireConfigure()
                }
            },
            // 获取问题列表
            getQuestionnaireConfigure() {
                request({
                    url: '/api/QuestionnaireConfigure',
                    method: 'get'
                }).then(res => {
                    // 设置当前功能问题总列表
                    this.questionsList = res.data
                    // 获取选项列表
                    this.getQuestionnaireOption()
                })
            },
            // 获取选项列表
            getQuestionnaireOption() {
                request({
                    url: '/api/QuestionnaireOption?configId=0',
                    method: 'get'
                }).then(res => {
                    this.answerList = res.data
                    this.loading = false
                })
            },
            // 设置问卷填写数量
            setQuestionNum() {
                this.moduleList.map((v1, i1) => {
                    // 如果列表数量大于0则计算
                    if (v1.questionnairePageList.length > 0 && this.featuresTreeData[i1]) {
                        v1.questionnairePageList.map((v2, i2) => {
                            this.featuresTreeData[i1].fillNum = this.computeQuestionnaire(v1.questionnairePageList, i2, this.featuresTreeData[i1].fillNum)
                        })
                    }
                })
            },
            // 功能模块点击事件
            handleQuestionnaireMenuClick(index) {
                const menuArr = this.featuresTreeData[index].menuArr
                this.selectIndex = index
                if (this.moduleList[index].questionnairePageList.length === 0) {
                    this.selectFeatures = menuArr
                } else {
                    this.selectFeatures = this.moduleList[index].questionnairePageList
                }
                document.getElementsByClassName('questionnaire-content')[0].scrollTop = 0
            },
            // 弹窗关闭
            handleDialogClose() {
                this.$confirm('确认关闭？')
                    .then(_ => {
                        this.$emit('closeQuestionnaireDialog')
                        done()
                    })
                    .catch(_ => {})
            },
            // 获取表单填写情况
            getQuestionnaireFromData(data, index) {
                const list = data
                const fillNum = this.featuresTreeData[this.selectIndex].fillNum
                this.featuresTreeData[this.selectIndex].fillNum = this.computeQuestionnaire(data, index, fillNum)
                this.moduleList[this.selectIndex].questionnairePageList = list
            },
            // 计算填写了多少个问题
            computeQuestionnaire(data, index, fillNum) {
                let questionsChecked = 0
                data[index].questionsList.map((v1, i1) => {
                    v1.answerList.map((v2, i2) => {
                        if (v2.checked) {
                            questionsChecked++
                        }
                    })
                    // 判断填写问题的个数 第一次fillNum才加
                    if (questionsChecked === data[index].questionsList.length && questionsChecked !== 0 && !v1.alreadyChecked) {
                        v1.alreadyChecked = true // 防止重复累加
                        fillNum++
                    }
                })
                return fillNum
            },
            // 暂存问卷调查
            handleSaveQuestionnaireClick() {
                this.handleSubmitQuestionnaireClick('1')
            },
            // 提交问卷调查
            handleSubmitQuestionnaireClick(save) {
                const list = this.moduleList
                // 判断是否有题目尚未填写 过滤功能取消
                const filterFill = this.featuresTreeData.filter(v => {
                    return v.fillNum === 0
                })

                if (filterFill.length === this.featuresTreeData.length) {
                    this.$message.warning('请最少填写一个问题再提交~')
                    return
                }
                this.loading = true

                // 删除不必要的参数
                for (let i = 0; i < list.length; i++) {
                    for (let j = 0; j < list[i].questionnairePageList.length; j++) {
                        for (let h = 0; h < list[i].questionnairePageList[j].questionsList.length; h++) {
                            if (list[i].questionnairePageList[j].questionsList[h].checked) {
                                delete list[i].questionnairePageList[j].questionsList[h].checked
                            }
                            if (list[i].questionnairePageList[j].questionsList[h].alreadyChecked) {
                                delete list[i].questionnairePageList[j].questionsList[h].alreadyChecked
                            }
                        }
                    }
                }

                let formList = []
                let totalSatisfaction = 0
                // 暂存 添加没有填写的模块内容
                if (save === '1') {
                    list.map((v1, i1) => {
                        if (v1.questionnairePageList.length === 0) {
                            this.featuresTreeData[i1].menuArr.map((v2, i2) => {
                                v1.questionnairePageList.push({
                                    menu: v2.menu,
                                    menuId: v2.menuId,
                                    fillNum: 0,
                                    satisfaction: 0,
                                    questionnaireModuleId: v2.moduleId,
                                    questionsList: this.questionsList
                                })
                            })
                        }
                        v1.questionnairePageList.map((v3, i3) => {
                            // 暂存数据保存
                            v3.questionsList.map((v4, i4) => {
                                if (!v4.answerList) {
                                    v4.questionnairePageId = v4.id
                                    v4.title = v4.question
                                    v4.answerList = this.answerList
                                }
                            })
                        })
                    })
                    formList = list
                } else {
                    // 过滤出已答题的
                    list.map((v1, i1) => {
                        v1.questionnairePageList2 = []
                        v1.questionnairePageList.map((v2, i2) => {
                            v2.questionsList2 = []
                            v2.questionsList.map((v3, i3) => {
                                v3.answerList.map((v4, i4) => {
                                    if (v4.checked) {
                                        v2.questionsList2.push(v3)
                                    }
                                })
                            })
                            if (v2.questionsList2.length > 0) {
                                v1.questionnairePageList2.push(v2)
                            }
                        })
                    })

                    // 计算满意度
                    formList = list.filter(v => { return v.questionnairePageList2.length > 0 })
                    formList.map((v1, i1) => {
                        v1.questionnairePageList2.map((v2, i2) => {
                            v2.questionsList2.map((v3, i3) => {
                                if (!v2.satisfaction) {
                                    v2.satisfaction = 0
                                }
                                v3.answerList.map((v4, i4) => {
                                    if (v4.checked) {
                                        v3.satisfaction = v4.ratio * v3.satisfaction / 100
                                    }
                                })
                                // 累加问题的百分比 不能超过 100%
                                v2.satisfaction += v3.satisfaction
                            })
                            // 累加所有问题的百分比下一步进行改模块的平均数计算
                            v1.satisfaction += v2.satisfaction
                        })
                        v1.satisfaction = (v1.satisfaction / v1.questionnairePageList2.length).toFixed(2)
                    })

                    // 总满意度
                    totalSatisfaction = formList.reduce((total, next) => { return total + Number(next.satisfaction) }, 0) / formList.length
                    for (let i = 0; i < formList.length; i++) {
                        if (formList[i].questionnairePageList2) {
                            formList[i].questionnairePageList = formList[i].questionnairePageList2
                            delete formList[i].questionnairePageList2
                            for (let j = 0; j < formList[i].questionnairePageList.length; j++) {
                                formList[i].questionnairePageList[j].questionsList = formList[i].questionnairePageList[j].questionsList2
                                delete formList[i].questionnairePageList[j].questionsList2
                            }
                        }
                    }
                }

                const fromData = {
                    moduleList: formList,
                    id: this.saveId,
                    tempStore: save === '1',
                    satisfaction: totalSatisfaction.toFixed(2)
                }

                request({
                    url: '/api/Questionnaire',
                    method: 'post',
                    data: fromData
                }).then(res => {
                    const result = res.data
                    if (result.success) {
                        if (save === '1') {
                            this.$message.success('暂存成功!')
                        } else {
                            this.$message.success('提交成功!')
                        }
                        this.$emit('closeQuestionnaireDialog')
                        // 提交/暂存成功后初始化数据
                        this.checkSave = false
                        this.selectFeatures = null // 选中的模块
                        this.selectIndex = 0 // 选中的模块索引值
                        this.moduleList = [] // 所有表单数据
                        this.questionsList = [] // 问题列表
                        this.answerList = [] // 选项列表
                        this.isSubmit = true
                        this.loading = false
                    } else {
                        this.$message.error(result.message)
                    }
                })
            }
        }
    }
</script>

<style lang='scss'>
.questionnaire-container {
    .el-dialog__header {
        line-height: 20px;
    }
}

.questionnaire-header {
    padding: 10px 0 30px;
    line-height: 20px;
    border-bottom: 1px solid #d4d4d4;
    h2, p {
        line-height: 20px;
        font-size: 14px;
        color: #555;
    }
    h2 {
        margin: 0;
        font-weight: normal;
    }
}

.questionnaire-content {
    position: relative;
    margin-top: 10px;
    padding-left: 210px;
    min-height: 410px;
}

.questionnaire-menu-wrap {
    position: absolute;
    z-index: 6;
    margin-top: 10px;
}

.questionnaire-menu {
    position: absolute;
    top: 0;
    left: 0;
    width: 180px;
}

.questionnaire-menu-item {
    height: 32px;
    line-height: 32px;
    padding-right: 20px;
    padding-left: 16px;
    margin-bottom: 1px;
    color: #7f7f7f;
    border-left: 4px solid #f4f6f7;
    background-color: #f4f6f7;
    cursor: pointer;
    &.active, &:hover {
        color: #2a2a2a;
        border-left-color: #04a1e7;
        background-color: #d4d4d4;
    }
    span {
        float: right;
        color: #7f7f7f;
    }
}

</style>
