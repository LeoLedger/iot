import router from './router'
import store from './store'
import {
    Message
} from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import {
    getToken
} from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({
    showSpinner: false
}) // NProgress Configuration

const whiteList = ['/login'] // no redirect whitelist

router.beforeEach((to, from, next) => {
    // start progress bar
    NProgress.start()

    // set page title
    document.title = getPageTitle(to.meta.title)

    // determine whether the user has logged in
    const hasToken = getToken()
    console.log(hasToken,'hasToken')

    if (hasToken) {
        if (to.path === '/login') {
            // if is logged in, redirect to the home page
            next({
                path: '/'
            })
            NProgress.done()
        } else {
            const hasGetUserInfo = store.getters.name
            if (hasGetUserInfo) {
                next()
            } else {
                // get user info
                store.dispatch('user/getInfo').then(() => {
                    store.dispatch('menu/getMenuTree').then(() => {
                        router.options.routes = store.getters.addRouters
                        router.addRoutes(store.getters.addRouters)
                        next({...to, replace: true})//执行路由跳转方法
                    })
                }).catch((error) => {
                    store.dispatch('user/FedLogOut').then(() => {
                        Message.error(error)
                        next({
                            path: '/'
                        })
                        NProgress.done()
                    })
                })
            }
        }
    } else {
        /* has no token*/

        if (whiteList.indexOf(to.path) !== -1) {
            // in the free login whitelist, go directly
            next()
        } else {
            // other pages that do not have permission to access are redirected to the login page.
            next(`/login?redirect=${to.path}`)
            NProgress.done()
        }
    }
})

router.afterEach(() => {
    // finish progress bar
    NProgress.done()
})
