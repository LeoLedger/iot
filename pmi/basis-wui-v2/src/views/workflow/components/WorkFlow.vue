<template>
    <div class="panel">
        <div class="nodeTools-sider">
            <NodeTools
                ref="nodeTools"
                @addNode="addNode"
            />
        </div>
        <div
            id="efContainer"
            ref="efContainer"
            v-flowDrag
            class="container"
            style="height: calc(70vh);"
        >
            <template v-for="node in data.activities">
                <flow-node
                    v-if="!node.dbStatus"
                    :id="node.identifier"
                    :key="node.identifier"
                    :node="node"
                    :active-element="activeElement"
                    @changeNodeSite="changeNodeSite"
                    @nodeRightMenu="nodeRightMenu"
                    @clickNode="clickNode(node)"
                    @rightClickDel="rightClickDel"
                />
            </template>
            <!-- 给画布一个默认的宽度和高度 -->
            <!-- <div style="position:absolute;top: 2000px;left: 2000px;">&nbsp;</div> -->
        </div>
        <div style="position: absolute;right: 30px;top:90px">
            <el-button size="mini" class="button-tip" type="primary" @click="showWorkInfo">
                流程信息
            </el-button>
        </div>
        <NodeProperty
            ref="nodeProperty"
            :visible="dialogVisible"
            :data-type="nodeType"
            title="环节属性"
            @closeNodeProperty="closeNodeProperty"
            @changeActivity="changeActivity"
            @setLineLabel="setLineLabel"
        />
        <workflow-info
            ref="workflowInfo"
            :visible="workflowInfoVisible"
            :workflow-info="data"
            title="流程属性"
            @closeWorkflowInfo="closeWorkflowInfo"
            @saveWorkFlowInfo="saveWorkFlowInfo"
        />
    </div>
</template>

<script>
    import workflow from './mixins/workflow'
    import jsPlumb from 'jsplumb'

    import FlowNode from '@/views/workflow/components/FlowNode'
    import NodeTools from '@/views/workflow/components/NodeTools'
    import NodeProperty from '@/views/workflow/components/NodeProperty'
    import WorkflowInfo from '@/views/workflow/components/WorkflowInfo'

    export default {
        name: 'WorkFlow',
        components: { FlowNode, NodeTools, NodeProperty, WorkflowInfo },
        mixins: [workflow],
        props: {
            flowData: { type: Object, default: null }
        },
        data() {
            return {
                // 控制画布销毁
                easyFlowVisible: true,
                // 控制流程数据显示与隐藏
                flowInfoVisible: false,
                // 是否加载完毕标志位
                loadEasyFlowFinish: false,
                flowHelpVisible: false,
                dialogVisible: false,
                workflowInfoVisible: false,
                // 激活的元素、可能是节点、可能是连线
                activeElement: {
                    // 可选值 node 、line
                    type: undefined,
                    // 节点ID
                    nodeId: undefined,
                    // 连线ID
                    sourceActivityIdentifier: undefined,
                    targetActivityIdentifier: undefined
                },
                data: { activities: [], flows: [] },
                nodeType: 'node'
            }
        },
        computed: {
            linkLine() {
                return this.data.flows.filter((line) => !line.dbStatus)
            }
        },
        watch: {
            flowData: {
                immediate: false,
                handler(val) {
                    this.data = Object.assign(this.data, val)
                    if (this.data.activities) {
                        for (let i = 0; i < this.data.activities.length; i++) {
                            const node = this.data.activities[i]
                            if (node.designExt) {
                                node.left = node.designExt.split(',')[0] + 'px'
                                node.top = node.designExt.split(',')[1] + 'px'
                            }
                            node.ico = 'el-icon-user'
                            node.viewOnly = false
                        }
                    }
                    this.$nextTick(() => {
                        this.jsPlumbInit()
                    })
                }
            }
        },
        mounted() {
            this.jsPlumbInstance = jsPlumb.jsPlumb.getInstance()
        },
        methods: {
            jsPlumbInit() {
                this.jsPlumbInstance.ready(() => {
                    // 导入默认配置
                    this.jsPlumbInstance.importDefaults(this.jsplumbSetting)
                    // 会使整个jsPlumb立即重绘。
                    this.jsPlumbInstance.setSuspendDrawing(false, true)
                    // 初始化节点
                    this.loadEasyFlow()
                    // 单点击了连接线, https://www.cnblogs.com/ysx215/p/7615677.html
                    this.jsPlumbInstance.bind('click', conn => {
                        this.activeElement.type = 0
                        this.nodeType = 'line'
                        this.activeElement.sourceActivityIdentifier = conn.sourceId
                        this.activeElement.targetActivityIdentifier = conn.targetId
                        let flow = {}
                        this.linkLine.forEach(function(line) {
                            if (line.sourceActivityIdentifier === conn.sourceId &&
                                line.targetActivityIdentifier === conn.targetId) {
                                flow = line
                            }
                        })
                        this.dialogVisible = true
                        this.$nextTick(() => {
                            this.$refs.nodeProperty.nodeInit(flow)
                        })
                    })
                    // 连线
                    this.jsPlumbInstance.bind('connection', evt => {
                        const from = evt.source.id
                        const to = evt.target.id
                        if (this.loadEasyFlowFinish) {
                            this.data.flows.push({
                                sourceActivityIdentifier: from,
                                targetActivityIdentifier: to,
                                runtimeService: '',
                                runtimeTarget: '',
                                remark: '',
                                orderNum: 0,
                                type: 0,
                                dbStatus: false,
                                workflowId: this.workflowId
                            })
                        }
                    })

                    // 删除连线回调
                    this.jsPlumbInstance.bind('connectionDetached', evt => {
                        this.deleteLine(evt.sourceId, evt.targetId)
                    })

                    // 改变线的连接节点
                    this.jsPlumbInstance.bind('connectionMoved', evt => {
                        this.changeLine(evt.originalSourceId, evt.originalTargetId)
                    })

                    // 连线右击
                    this.jsPlumbInstance.bind('contextmenu', (conn, event) => {
                        this.$confirm('此操作将删除此链接, 是否继续?', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning',
                            center: true
                        }).then(() => {
                            let line = this.jsPlumbInstance.getAllConnections().find(v => v.id === conn.id)
                            if (line) {
                                this.jsPlumbInstance.deleteConnection(line)
                            }
                        })
                        event.preventDefault()
                    })

                    // 连线
                    this.jsPlumbInstance.bind('beforeDrop', evt => {
                        const from = evt.sourceId
                        const to = evt.targetId
                        if (from === to) {
                            this.$message.error('节点不支持连接自己')
                            return false
                        }
                        if (this.hasLine(from, to)) {
                            this.$message.error('该关系已存在,不允许重复创建')
                            return false
                        }
                        this.$message.success('连接成功')
                        console.log('activities', this.data.activities)
                        console.log('flows', this.data.flows)
                        return true
                    })
                    // beforeDetach
                    this.jsPlumbInstance.bind('beforeDetach', evt => {
                        console.log('beforeDetach', evt)
                    })
                    this.jsPlumbInstance.setContainer(this.$refs.efContainer)
                })
            },
            // 加载流程图
            loadEasyFlow() {
                // 初始化节点
                if (this.data.activities) {
                    for (let i = 0; i < this.data.activities.length; i++) {
                        const node = this.data.activities[i]
                        if (!node.identifier) {
                            node.identifier = this.getUUID()
                        }
                        // 设置源点，可以拖出线连接其他节点
                        this.jsPlumbInstance.makeSource(
                            node.identifier,
                            this.jsplumbSourceOptions || {}
                        )
                        // // 设置目标点，其他源点拖出的线可以连接该节点
                        this.jsPlumbInstance.makeTarget(node.identifier, this.jsplumbTargetOptions)
                        if (!node.viewOnly) { // 不可拖拽
                            this.jsPlumbInstance.draggable(node.identifier, {
                                containment: 'parent',
                                stop: function(el) {
                                    // 拖拽节点结束后的对调
                                    console.log('拖拽结束: ', el)
                                }
                            })
                        }
                    }
                }
                if (this.linkLine) {
                    // 初始化连线
                    for (let i = 0; i < this.linkLine.length; i++) {
                        const line = this.linkLine[i]
                        const connParam = {
                            source: line.sourceActivityIdentifier,
                            target: line.targetActivityIdentifier,
                            label: line.label ? line.label : '',
                            connector: line.connector ? line.connector : '',
                            anchors: line.anchors ? line.anchors : undefined,
                            paintStyle: line.paintStyle ? line.paintStyle : undefined
                        }
                        this.jsPlumbInstance.connect(connParam, this.jsplumbConnectOptions)
                    }
                }
                this.$nextTick(function() {
                    this.loadEasyFlowFinish = true
                })
            },
            nodeRightMenu() {
            },
            /**
             * 拖拽结束后添加新的节点
             * @param evt
             * @param nodeMenu 被添加的节点对象
             * @param mousePosition 鼠标拖拽结束的坐标
             */
            addNode(evt, nodeMenu, mousePosition) {
                const screenX = evt.originalEvent.clientX
                const screenY = evt.originalEvent.clientY
                const efContainer = this.$refs.efContainer
                const containerRect = efContainer.getBoundingClientRect()
                let left = screenX
                let top = screenY
                // 计算是否拖入到容器中
                if (
                    left < containerRect.x ||
                    left > containerRect.width + containerRect.x ||
                    top < containerRect.y ||
                    containerRect.y > containerRect.y + containerRect.height
                ) {
                    this.$message.error('请把节点拖入到画布中')
                    return
                }
                left = left - containerRect.x + efContainer.scrollLeft
                top = top - containerRect.y + efContainer.scrollTop
                // 居中
                left -= 85
                top -= 16
                const nodeId = this.getUUID()

                const beginEndAct = this.data.activities.find(item => item.type === parseInt(nodeMenu.type))
                if ((nodeMenu.type === '1' || nodeMenu.type === '9') && beginEndAct) {
                    this.$message.error('已有结束或开始环节')
                    return
                }
                const node = {
                    identifier: nodeId,
                    name: nodeMenu.name,
                    type: nodeMenu.type,
                    ico: nodeMenu.ico,
                    viewOnly: false,
                    left: left + 'px',
                    top: top + 'px',
                    designExt: left + ',' + top,
                    limit: 0,
                    status: 0,
                    activityId: this.getUUID()
                }
                /**
                 * 这里可以进行业务判断、是否能够添加该节点
                 */
                this.data.activities.push(node)
                const _this = this
                this.$nextTick(function() {
                    _this.jsPlumbInstance.makeSource(nodeId, _this.jsplumbSourceOptions)
                    _this.jsPlumbInstance.makeTarget(nodeId, _this.jsplumbTargetOptions)
                    _this.jsPlumbInstance.draggable(nodeId, {
                        containment: 'parent',
                        stop: function(el) {
                            // 拖拽节点结束后的对调
                            console.log('拖拽结束: ', el)
                        }
                    })
                })
                this.dialogVisible = false
            },
            /**
             * 删除节点
             * @param nodeId 被删除节点的ID
             * @param name 被删除节点名称
             */
            deleteNode(nodeId, name) {
                this.$confirm('确定要删除' + name + '?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    closeOnClickModal: false
                })
                    .then(() => {
                        /**
                         * 这里需要进行业务判断，是否可以删除
                         */
                        this.data.activities.forEach(function(node) {
                            if (node.identifier === nodeId) {
                                node.dbStatus = true
                            }
                        })
                        const _this = this
                        this.$nextTick(function() {
                            _this.jsPlumbInstance.removeAllEndpoints(nodeId)
                            this.$nextTick().then(() => {
                                _this.jsPlumbInstance && _this.jsPlumbInstance.removeAllEndpoints && _this.jsPlumbInstance.removeAllEndpoints(nodeId)
                            })
                        })
                        return true
                    })
            },
            clickNode(obj) {
                this.activeElement.type = 0
                this.activeElement.nodeId = obj.identifier
                this.dialogVisible = true
                this.nodeType = 'node'
                this.$nextTick(() => {
                    this.$refs.nodeProperty.nodeInit(obj)
                })
                // this.$refs.nodeForm.nodeInit(this.data, nodeId)
            },
            seNodeProperty() {
                this.dialogVisible = false
            },
            // 设置连线条件
            setLineLabel(flow) {
                const conn = this.jsPlumbInstance.getConnections({
                    source: flow.sourceActivityIdentifier,
                    target: flow.targetActivityIdentifier
                })[0]
                if (!flow.label || flow.label === '') {
                    conn.removeClass('flowLabel')
                    conn.addClass('emptyFlowLabel')
                } else {
                    conn.addClass('flowLabel')
                }
                conn.setLabel({ label: flow.label || '' })
                this.linkLine.forEach(function(line) {
                    if (line.sourceActivityIdentifier === flow.sourceActivityIdentifier &&
                        line.targetActivityIdentifier === flow.targetActivityIdentifier) {
                        line.label = flow.label || ''
                        line.runtimeService = flow.runtimeService
                        line.runtimeTarget = flow.runtimeTarget
                        line.orderNum = flow.orderNum
                    }
                })
                this.dialogVisible = false
            },
            // 删除激活的元素
            deleteElement() {
                if (this.activeElement.type === 'node') {
                    this.deleteNode(this.activeElement.nodeId, this.activeElement.name)
                } else if (this.activeElement.type === 'line') {
                    this.$confirm('确定删除所点击的线吗?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    })
                        .then(() => {
                            const conn = this.jsPlumb.getConnections({
                                source: this.activeElement.sourceId,
                                target: this.activeElement.targetId
                            })[0]
                            this.jsPlumb.deleteConnection(conn)
                        })
                        .catch(() => {
                        })
                }
            },
            // 删除线
            deleteLine(from, to) {
                let line = this.linkLine.find((line) => line.sourceActivityIdentifier === from && line.targetActivityIdentifier === to)
                if (line) {
                    line.dbStatus = true
                }
            },
            // 改变连线
            changeLine(oldFrom, oldTo) {
                this.deleteLine(oldFrom, oldTo)
            },
            // 改变节点的位置
            changeNodeSite(data) {
                for (let i = 0; i < this.data.activities.length; i++) {
                    const node = this.data.activities[i]
                    if (node.identifier === data.identifier) {
                        node.left = data.left
                        node.top = data.top
                        node.designExt = data.left.replace('px', '') + ',' + data.top.replace('px', '')
                    }
                }
            },
            // 是否具有该线
            hasLine(from, to) {
                for (let i = 0; i < this.linkLine.length; i++) {
                    const line = this.linkLine[i]
                    if (line.sourceActivityIdentifier === from && line.targetActivityIdentifier === to) {
                        return true
                    }
                }
                return false
            },
            // 是否含有相反的线
            hashOppositeLine(from, to) {
                return this.hasLine(to, from)
            },
            // 删除节点
            rightClickDel(id, name) {
                this.deleteNode(id, name)
            },
            changeActivity(activity) {
                for (let i = 0; i < this.data.activities.length; i++) {
                    const node = this.data.activities[i]
                    if (node.identifier === activity.identifier) {
                        this.data.activities[i] = activity
                    }
                }
                this.dialogVisible = false
            },
            closeNodeProperty() {
                this.dialogVisible = false
            },
            getWorkflowData() {
                return this.data
            },
            showWorkInfo() {
                this.workflowInfoVisible = true
            },
            closeWorkflowInfo() {
                this.workflowInfoVisible = false
            },
            saveWorkFlowInfo(workflowInfo) {
                this.data = Object.assign(this.data, workflowInfo)
                this.workflowInfoVisible = false
            }
        }
    }
</script>

<style scoped lang="scss">
@import "../../../../src/styles/workflow.scss";

.panel {
  display: flex;

  .nodeTools-sider {
    width: 200px;
    border: #dadce0 1px solid;
    background-color: aliceblue;
  }

  .container {
    flex: 1;
    background-color: azure;
    border-top: #dadce0 1px solid;
    border-right: #dadce0 1px solid;
    border-bottom: #dadce0 1px solid;
  }
}
</style>
