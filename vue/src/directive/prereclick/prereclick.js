export default {
    // inserted这个钩子函数调用的时候，当前元素已经插入页面中了，也就是说可以获取到父级节点了
    inserted(el, binding) {
        el.addEventListener('click', e => {
            if (!el.disabled) {
                el.disabled = true
                setTimeout(() => {
                    el.disabled = false
                    // binding.value 为 v-directive 指令的绑定值，等号后面的值 eg: <span v-xx="value">
                }, binding.value || 1000)
            }
        })
    }
}
