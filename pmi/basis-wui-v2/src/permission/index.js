import store from '@/store'
import de from 'element-ui/src/locale/lang/de'
/**
 * 判断用户是否拥有操作权限
 * 根据传入的权限标识，查看是否存在用户权限标识集合
 * @param perms
 */
export function hasPermission(perms) {
    let hasPermission = false
    if (store.state.user.isAdmin) {
        return true
    }

    const permissions = store.state.user.perms || []
    for (let i = 0, len = permissions.length; i < len; i++) {
        if (permissions[i] === perms) {
            hasPermission = true
            break
        }
    }
    return hasPermission
}
