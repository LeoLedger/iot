package hw.topevery.basis.runtime;

import org.apache.shiro.spring.aop.SpringAnnotationResolver;
import org.apache.shiro.spring.security.interceptor.AopAllianceAnnotationsAuthorizingMethodInterceptor;

/**
 * aop许可拦截器
 *
 * @author bingxin.xu
 */
public class ShiroPermissionAopInterceptor extends AopAllianceAnnotationsAuthorizingMethodInterceptor {
    public ShiroPermissionAopInterceptor() {
        super();
        {
            this.methodInterceptors.add(new ShiroPermissionMethodInterceptor(new SpringAnnotationResolver()));
        }
    }
}