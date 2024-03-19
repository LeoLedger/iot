<template>
    <div class="dialog-container Sfix">
        <el-dialog
            :title="title"
            :visible.sync="visible"
            :before-close="simpleClose"
            width="90%"
        >
            <!-- width="900px" -->
            <div>
                <div class="tooltip-right">
                    <el-tooltip placement="bottom" effect="light">
                        <div slot="content">
                            <p v-for="(item,index) in contentText" :key="index">
                                {{ item }}
                            </p>
                        </div>
                        <el-button size="mini" class="button-tip" type="primary">
                            操作提示 <i class="el-icon-question" />
                        </el-button>
                    </el-tooltip>
                </div>
                <!-- 面板 -->
                <work-flow ref="workflow" :flow-data="workflow" />
            </div>
            <span slot="footer">
                <el-button
                    size="mini"
                    @click="simpleClose"
                >取 消</el-button>
                <el-button
                    type="primary"
                    size="mini"
                    @click="submit"
                >确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>

    import { getWorkFlow, saveWorkFlow, initWorkFlow } from '@/api/workflow'
    import WorkFlow from '@/views/workflow/components/WorkFlow'
    export default {
        name: 'AddEditDialog',
        components: { WorkFlow },
        props: {
            workFlowId: { type: String, default: '' },
            visible: {
                type: Boolean,
                default: false
            },
            title: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                workflow: null,
                contentText: [
                    '温馨提示:',
                    '点击绘制图形,弹出图形节点信息编辑。',
                    '点击图形之外的画布，弹出当前工作流信息编辑。'
                ]
            }
        },
        watch: {
            workFlowId: {
                immediate: true,
                handler(val) {
                    if (val) {
                        this.getWorkFlow()
                    } else {
                        this.initWorkFlow()
                    }
                }
            }
        },
        mounted() {
        },
        methods: {
            getWorkFlow() {
                getWorkFlow({ workflowId: this.workFlowId }).then(res => {
                    if (res.data.success) {
                        this.workflow = res.data.data
                    }
                })
            },
            initWorkFlow() {
                initWorkFlow().then(res => {
                    if (res.data.success) {
                        this.workflow = res.data.data
                    }
                })
            },
            // 直接关闭
            simpleClose() {
                this.$emit('closeApp', false)
            },
            submit() {
                const workflowData = this.$refs.workflow.getWorkflowData()
                saveWorkFlow(workflowData).then(res => {
                    if (res.data.success) {
                        this.$notify({
                            title: '成功',
                            message: '操作成功',
                            type: 'success',
                            duration: 2000
                        })
                        this.$emit('closeApp', true)
                    } else {
                        this.$notify({
                            title: '失败',
                            message: '添加失败',
                            type: 'warning',
                            duration: 2000
                        })
                    }
                })
            }
        }

    }
</script>

<style scoped>
  /*工作流程*/
  /*左边工具栏以及编辑节点的样式*/
  @import "~bpmn-js/dist/assets/diagram-js.css";
  @import '~bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
  @import '~bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css';
  @import '~bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
  /*右边工具栏样式*/
  @import "~bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css";
  /*最外层容器*/
  .containers {
    background-color: #ffffff;
    width: 100%;
    min-height: 700px;
  }

  /*画布*/
  .canvas {
    width: 100%;
    /* height: 700px; */
    position: relative;
  }
  .canvas .button-tip{
    margin-left: 20px;
  }

  .tooltip-right{
    text-align: right;
  }
</style>
