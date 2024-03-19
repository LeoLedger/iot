<template>
  <div ref="content" class="containers">
    <!-- 画布 -->
    <div ref="canvas" class="canvas" />
    <!-- 面板 -->
    <div v-show="propertiesPanelShow" ref="propertiesPanel" class="panel" />
    <div>
      <el-button @click="download">保存</el-button>
    </div>
  </div>
</template>

<script>

// 自定义模块
import customModule from './customExtension/custom-bpmn'

// 自定义属性
import custProps from './customExtension/custom-panel'
// 渲染器
import BpmnModeler from 'bpmn-js/lib/Modeler'
// 左边工具栏
import propertiesPanelModule from 'bpmn-js-properties-panel'
// 右边工具栏,扩展属性
import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda'
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda'

import { getWorkFlow } from '@/api/workflow'

export default {
  name: 'WorkflowBpmn',
  props: {
    workFlowId: { type: String, default: '' }
  },
  data() {
    return {
      // bpmn建模器
      bpmnModeler: null,
      container: null,
      canvas: null,
      xmlStr: null,
      processName: '',
      propertiesPanelShow: false
    }
  },
  mounted() {
    this.$nextTick().then(() => {
      const _this = this
      this.canvas = this.$refs.canvas
      this.bpmnModeler = new BpmnModeler({
        container: this.canvas,
        keyboard: {
          bindTo: window
        },
        propertiesPanel: {
          parent: this.$refs.propertiesPanel
        },
        additionalModules: [
          propertiesPanelModule,
          propertiesProviderModule
        ],
        moddleExtensions: {
          camunda: camundaModdleDescriptor
        }
      })

      this.bpmnModeler.on('element.click', function(e) {
        _this.propertiesPanelShow = true
      })
      // 创建新图
      this.getWorkFlow()
    })
  },
  methods: {
    getWorkFlow() {
      getWorkFlow({ workFlowId: this.workFlowId }).then(res => {
        if (res.data.success) {
          const that = this
          this.bpmnModeler.importXML(res.data.data, function(err) {
            if (err) {
              console.error(err)
            } else {
              that.bpmnModeler.get('canvas').zoom('fit-viewport')
            }
          })
        }
      })
    },
    download() {
      this.bpmnModeler.saveXML({ format: true }, (err, xml) => {
        if (xml) {
          let a = document.createElement('a')
          a.href = 'data:application/bpmn20-xml;charset=UTF-8,' + encodeURIComponent(xml)
          a.download = 'diagram.bpmn'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          a = null
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
        height: 700px;
    }

    /*面板*/
    .panel {
        position: absolute;
        left: 10px;
        top: 50px;
        width: 300px;
    }

</style>
