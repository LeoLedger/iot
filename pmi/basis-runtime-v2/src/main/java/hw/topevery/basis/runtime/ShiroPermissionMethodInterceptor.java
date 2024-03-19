package hw.topevery.basis.runtime;

import org.apache.shiro.aop.AnnotationResolver;
import org.apache.shiro.aop.MethodInvocation;
import org.apache.shiro.authz.AuthorizationException;
import org.apache.shiro.authz.aop.AuthorizingAnnotationMethodInterceptor;

/**
 * @author bingxin.xu
 */
public class ShiroPermissionMethodInterceptor extends AuthorizingAnnotationMethodInterceptor {
    /**
     * 构造函数
     */
    public ShiroPermissionMethodInterceptor() {
        super(new ShiroSecurityInterceptor());
    }

    public ShiroPermissionMethodInterceptor(AnnotationResolver resolver) {
        super(new ShiroSecurityInterceptor(), resolver);
    }

    @Override
    public void assertAuthorized(MethodInvocation mi) throws AuthorizationException {
        // 验证权限
        try {
            ((ShiroSecurityInterceptor) getHandler()).assertAuthorized(getAnnotation(mi));
        } catch (AuthorizationException ae) {
            // Annotation handler doesn't know why it was called, so add the information here if possible.
            // Don't wrap the exception here since we don't want to mask the specific exception, such as
            // UnauthenticatedException etc.
            if (ae.getCause() == null) {
                ae.initCause(new AuthorizationException("Not authorized to invoke method: " + mi.getMethod()));
            }
            throw ae;
        }
    }
}