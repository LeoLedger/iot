import layoutContainer from './layout-container'
import layoutRow from './layout-row'
import layoutCol from './layout-col'
import layoutBox from './layout-box'
import layoutFilter from './layout-filter'
import layoutFilterItem from './layout-filter-item'
import layoutTemplate from './layout-template'

const layout = {
    install(Vue) {
        Vue.component('layoutContainer', layoutContainer)
        Vue.component('layoutRow', layoutRow)
        Vue.component('layoutCol', layoutCol)
        Vue.component('layoutBox', layoutBox)
        Vue.component('layoutFilter', layoutFilter)
        Vue.component('layoutFilterItem', layoutFilterItem)
        Vue.component('layoutTemplate', layoutTemplate)
    }
}

export default layout
