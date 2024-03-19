package hw.topevery.basis.runtime;

import hw.topevery.basis.entity.annotation.PmiPrivilegeAnnot;
import org.apache.shiro.authz.AuthorizationException;
import org.apache.shiro.authz.aop.AuthorizingAnnotationHandler;
import org.apache.shiro.subject.Subject;

import java.lang.annotation.Annotation;

/**
 * 安全拦截器
 *
 * @author bingxin.xu
 */
public class ShiroSecurityInterceptor extends AuthorizingAnnotationHandler {

    public ShiroSecurityInterceptor() {
        super(ShiroPermission.class);
    }

    @Override
    public void assertAuthorized(Annotation attr) throws AuthorizationException {
        if (attr instanceof ShiroPermission) {
            ShiroPermission annotation = (ShiroPermission) attr;
            String attrVal = annotation.value();
            if (attrVal != PmiPrivilegeAnnot.NULL) {
                Subject subject = getSubject();
//              subject.isPermitted() //是否准许 用于判断 不做截获
//              subject.checkPermission() //验证许可 做权限截获
            }
        }
    }
}