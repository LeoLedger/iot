
import Layout from '@/layout'
import de from "element-ui/src/locale/lang/de";

const util = {}

/**
 * 判断是否为空
 */
const validatenull = (val) => {
    if (val instanceof Array) {
        if (val.length === 0) {
            return true
        }
    } else if (val instanceof Object) {
        if (JSON.stringify(val) === '{}') return true
    } else {
        if (val === 'null' || val == null || val === 'undefined' || val === undefined || val === '') {
            return true
        }
        return false
    }
    return false
}

/**
 * @Description:  格式化菜单
 */
util.formatRoutes = (aMenu) => {
    const aRouter = []
    aMenu.forEach(oMenu => {
        const {
            id,
            url,
            name,
            cssClass,
            children,
            parentId
        } = oMenu
        let path = "/" + url
        const routerUrl = ''
        if (children.length === 0) {
            let oRouter = {
                path: path
            }
            if(parentId === null || parentId.length===0
                || parentId ==='00000000-0000-0000-0000-000000000000') {
                oRouter.component = Layout
                oRouter.children = [{
                    path: path,
                    name: name,
                    component: () => import(`@/views/${url}`),
                    meta: {
                        title: name,
                        id: id,
                        icon: cssClass
                    }
                }]
            }
            else {
                oRouter.name = name
                oRouter.component = () => import(`@/views/${url}`)
                oRouter.children = [{
                    path: path,
                    name: name,
                    meta: {
                        title: name,
                        id: id,
                        icon: cssClass
                    }
                }]
            }
            aRouter.push(oRouter)
        } else {
            const oRouter = {
                path: path,
                redirect: path,
                component: Layout,
                name: path,
                meta: {
                    title: name,
                    id: id,
                    icon: cssClass
                },
                children: validatenull(children) ? [] : util.formatRoutes(children)
            }
            aRouter.push(oRouter)
        }
    })
    return aRouter
}

export default util
