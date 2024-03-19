import router from './router'
import store from './store'
import {
    Message
} from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import {
    getToken
} from '@/utils/auth' // getToken from cookie

NProgress.configure({
    showSpinner: false
}) // NProgress Configuration

const whiteList = ['/login', '/auth-redirect', '/appletsMap/tracePlay', '/share/amenitiesMeasurementList'] // no redirect whitelist
// 公用的父级 path  eg: /share/xxx 在  /share 内  属于白名单
const whiteParentPathList = ['/share/']
const baiduTongji = () => {
    if (window._hmt) return
    window._hmt = window._hmt || []
    let sc;
    (function() {
        if ((sc = document.getElementById('baidu'))) {
            document.head.removeChild(sc)
        }
        const hm = document.createElement('script')
        hm.src = 'https://hm.baidu.com/hm.js?3ba5c8fc26eee79a75c66f48b5f0fd40'
        hm.id = 'baidu'
        const s = document.getElementsByTagName('script')[0]
        s.parentNode.insertBefore(hm, s)
    })()
}
var isFromLogin = false
router.beforeEach(async(to, from, next) => {
    to.meta.keepAlive = !!to.query.keepAlive

    NProgress.start() // start progress bar
    // debugger
    if (process.env.VUE_APP_ENV === 'production') {
        baiduTongji()
        window._hmt && window._hmt.push(['_trackPageview', '/#' + to.fullPath])
    }
    if (getToken()) { // determine if there has token
        /* has token*/
        if (to.path === '/login') {
            next({
                path: '/'
            }) // 在角色登录的情况下 限制不能重新回到登录页
            NProgress.done() // if current page is dashboard will not trigger	afterEach hook, so manually handle it
        } else {
            if (store.getters.isLogin) {
                if (isFromLogin && to.path === '/404') {
                    isFromLogin = false // 重置
                    // 改为 首页
                    next({ path: '/' })
                    return
                }
            } else {
                store.dispatch('getUserInfo').then(() => {
                    Promise.all([
                        store.dispatch('generateRoutes'),
                        store.dispatch('queryDictData')
                    ]).then(() => {
                        router.options.routes = router.options.routes.concat(store.getters.flatRouters)
                        router.addRoutes(store.getters.flatRouters) // 动态添加可访问路由表
                        // 如果是通过登录重定向上次的跳转 设置 isFromLogin
                        if (from.fullPath.indexOf('/login?redirect=') === 0) {
                            isFromLogin = true
                        }
                        next({
                            ...to,
                            replace: true
                        })
                    })
                }).catch((err) => {
                    store.dispatch('fedLogOut').then(() => {
                        Message.error(err)
                        next({
                            path: '/'
                        })
                    })
                })
            }
            next()
        }
    } else {
        /* has no token*/
        if (whiteList.indexOf(to.path) !== -1 || isCurPathInWiteParentPath(to.path)) { // 在免登录白名单，直接进入
            next()
        } else {
            if (to.path.indexOf('/login') === 0) {
                next()
            } else {
                next(`/login?redirect=${to.path}`)
            }
            NProgress.done() // if current page is login will not trigger afterEach hook, so manually handle it
        }
    }
})
function isCurPathInWiteParentPath(toPath) {
    return whiteParentPathList.some(whitePath => {
        return toPath.indexOf(whitePath) !== -1
    })
}

router.afterEach(() => {
    NProgress.done() // finish progress bar
})
