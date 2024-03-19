
// 弹窗选择器
import DialogPick from '@/components/customizeFormItem/DialogPick'
// 选择器input
import PickInput from '@/components/customizeFormItem/PickInput'
// 表格组件
import TableComponent from '@/components/TableComponent'

const globalComponent = {
    install(Vue) {
        Vue.component('PickInput', PickInput)
        Vue.component('DialogPick', DialogPick)
        Vue.component('TableComponent', TableComponent)
    }
}

export default globalComponent
