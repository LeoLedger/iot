
import FormConfig from '@/components/FormConfig'
// 选项卡布局
import TabsLayout from '@/components/TabsLayout'
// 表格组件
import TableComponent from '@/components/TableComponent'
// 审批弹窗组件
import ApprovalDialog from '@/components/Approval/ApprovalDialog'
// 字典选择器
import DictSelect from '@/components/customizeFormItem/DictSelect'
// 远程搜索选择组件
import RemoteSelect from '@/components/customizeFormItem/RemoteSelect'
// 地理区域选择器
import RegionCascader from '@/components/customizeFormItem/RegionCascader'
// 弹窗选择器
import DialogPick from '@/components/customizeFormItem/DialogPick'
// 选择器input
import PickInput from '@/components/customizeFormItem/PickInput'
// 历史记录选择器
import HistorySelect from '@/components/customizeFormItem/HistorySelect'
// 故障代码选择器
import FaultMsgSelect from '@/components/customizeFormItem/FaultMsgSelect'
// 公共详情窗口
import PublicDetailDialog from '@/components/PublicDetailDialog'
// 窗口选择器
import SelectDialog from '@/components/SelectDialog'
// 点提示
import DotTip from '@/components/DotTip'
// 金额输入框
import MoneyInput from '@/components/customizeFormItem/MoneyInput'
// 消息确认窗口
import MessageDialog from '@/components/MessageDialog'
// 出库选择器
import WarehouseCascader from '@/components/customizeFormItem/WarehouseCascader'
// 导入按钮
import ImportButton from '@/components/customizeFormItem/ImportButton'
// 通用列表配置窗口
import ListConfigDialog from '@/components/ListConfigDialog/ListConfigDialog'
// 折叠面板
import CollapseTabLayout from '@/components/CollapseTabLayout'

const globalComponent = {
    install(Vue) {
        Vue.component('PickInput', PickInput)
        Vue.component('TabsLayout', TabsLayout)
        Vue.component('DialogPick', DialogPick)
        Vue.component('DictSelect', DictSelect)
        Vue.component('FormConfig', FormConfig)
        Vue.component('ImportButton', ImportButton)
        Vue.component('SelectDialog', SelectDialog)
        Vue.component('RemoteSelect', RemoteSelect)
        Vue.component('HistorySelect', HistorySelect)
        Vue.component('FaultMsgSelect', FaultMsgSelect)
        Vue.component('ApprovalDialog', ApprovalDialog)
        Vue.component('RegionCascader', RegionCascader)
        Vue.component('TableComponent', TableComponent)
        Vue.component('CollapseTabLayout', CollapseTabLayout)
        Vue.component('PublicDetailDialog', PublicDetailDialog)
        Vue.component('DotTip', DotTip)
        Vue.component('MoneyInput', MoneyInput)
        Vue.component('MessageDialog', MessageDialog)
        Vue.component('WarehouseCascader', WarehouseCascader)
        Vue.component('ListConfigDialog', ListConfigDialog)
    }
}

export default globalComponent
