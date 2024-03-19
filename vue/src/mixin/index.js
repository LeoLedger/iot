// 全局混入

import moment from 'moment'
import enums from '@/utils/enum'
import { isEmpty, getPriceFormat } from '@/utils'
import { mapState, mapGetters, mapActions } from 'vuex'
import { checkFeature, includeFeature } from '@/directive/permission/permission'

export default {
    computed: {
        ...mapState({
            'canApprovalCount': state => state.user.canApprovalCount
        }),
        ...mapGetters(['getDict', 'areaTree'])
    },
    filters: {
        // 日期格式化
        dateFormat(value, format = 'YYYY-MM-DD') {
            let d = moment(value)
            if (d.isValid()) {
                return d.format(format) || '- -'
            }
            return '- -'
        },
        // 金额格式化
        moneyFormat(value) {
            return getPriceFormat(value)
        },
        // 获取字典label
        getDictLabel(value, data) {
            data = Array.isArray(data) ? data : enums[data]
            return (data.find(v => v.value === value) || {}).label || '- -'
        }
    },
    methods: {
        checkFeature,
        includeFeature,
        ...mapActions(['getCanApprovalCount']),
        // 验证是否存在指定字段
        checkPermissionProps(props) {
            if (Array.isArray(this.permissionProps)) {
                props = Array.isArray(props) ? props : [props]
                return this.permissionProps.findIndex(prop => props.includes(prop)) > -1
            }
            return true
        },
        /**
         * 根据名称获取仓位类型
         * @param {Number} warehouses [0: 智能设备, 1: 其他产品, 2: SIM卡]
         * @param {String} warehousesSpace 仓位名称
         */
        getWarehousesSpaceType(warehouses, warehousesSpace) {
            var data = enums[[
                'warehousesSpaceTypeSmart',
                'warehousesSpaceTypeOther',
                'warehousesSpaceTypeSim'
            ][warehouses]].find(item => item.label === warehousesSpace)
            if (data) {
                return data.guidId
            }
        },
        /**
         * 当路由改变时，该路由下的页面会被keep-alive缓存，同时页标签栏会增加一个标签，
         * 但是如果不刷新页面，缓存会永远存在，所以在这里我们用一个特别的处理来删除关闭的标签页，但是保留没有关闭的页面
         */
        _handleTagClose() {
            try {
                let route_name = this.$options.$route_name
                let cachedViews = this.$store.state.tagsView.cachedViews
                if (route_name && cachedViews.indexOf(route_name) === -1) {
                    // 如果当前页面已从页标签删除，则删除缓存
                    if (this.$vnode && this.$vnode.data.keepAlive) {
                        if (this.$vnode.parent && this.$vnode.parent.componentInstance && this.$vnode.parent.componentInstance.cache) {
                            if (this.$vnode.componentOptions) {
                                let key = this.$vnode.key == null
                                    ? this.$vnode.componentOptions.Ctor.cid + (this.$vnode.componentOptions.tag ? `::${this.$vnode.componentOptions.tag}` : '')
                                    : this.$vnode.key
                                let keys = this.$vnode.parent.componentInstance.keys
                                let cache = this.$vnode.parent.componentInstance.cache
                                if (cachedViews.length) {
                                    if (cache[key]) {
                                        if (keys.length) {
                                            var index = keys.indexOf(key)
                                            if (index > -1) {
                                                keys.splice(index, 1)
                                            }
                                        }
                                        delete cache[key]
                                    }
                                } else {
                                    keys.length = 0
                                    Object.keys(cache).forEach(key => {
                                        delete cache[key]
                                    })
                                }
                            }
                        }
                    }
                    this.$destroy()
                }
            } catch (e) {
                console.error(e)
            }
        }
    },
    mounted() {
        if (this.$options.$route_name) {
            this.$globalEvent.$on('tagClose', this._handleTagClose)
        }
    },
    beforeDestroy() {
        if (this.$options.$route_name) {
            this.$globalEvent.$off('tagClose', this._handleTagClose)
        }
    },
    beforeRouteLeave(to, from, next) {
        if (this.$options.$route_name) {
            this._handleTagClose()
        }
        next()
    }
}
