package hw.topevery.basis.runtime;

import hw.topevery.basis.framework.ShiroPrivilege;
import hw.topevery.basis.framework.jwt.JwtToken;
import hw.topevery.basis.runtime.jwt.JwtRuntimeToken;
import lombok.SneakyThrows;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.AuthenticationInfo;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.SimpleAuthenticationInfo;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.authz.SimpleAuthorizationInfo;
import org.apache.shiro.realm.AuthorizingRealm;
import org.apache.shiro.subject.PrincipalCollection;

import java.util.List;

/**
 * @author bingxin.xu
 * 用户授权领域
 */
public class ShiroUserRealm extends AuthorizingRealm {

    @Override
    public boolean supports(AuthenticationToken authenticationToken) {
        return authenticationToken instanceof JwtToken;
    }

    @Override
    protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principals) {
        SimpleAuthorizationInfo info = new SimpleAuthorizationInfo();
        // 设置角色/权限信息
        JwtRuntimeToken jwtToken = (JwtRuntimeToken) principals.getPrimaryPrincipal();
        if (jwtToken != null) {
            UserRuntime ur = jwtToken.getUserRuntime();
            if (ur != null) {
                List<ShiroPrivilege> privilegeEnums = ur.getListPrivilegeEnum();
                for (ShiroPrivilege i : privilegeEnums) {
                    info.addObjectPermission(i);
                }
            }
        }
        return info;
    }

    @SneakyThrows
    @Override
    protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken authenticationToken) throws AuthenticationException {
        JwtToken jwtToken = (JwtToken) authenticationToken;
        if (jwtToken == null) {
            throw new AuthenticationException("jwtToken不能为空");
        }
        return new SimpleAuthenticationInfo(jwtToken, null, getName());
    }
}
