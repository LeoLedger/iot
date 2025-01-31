package hw.topevery.basis.runtime;

import hw.topevery.basis.entity.annotation.PmiPrivilegeAnnot;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 许可注解
 *
 * @author bingxin.xu
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.TYPE})
public @interface ShiroPermission {
    @PmiPrivilegeAnnot String value();
}
