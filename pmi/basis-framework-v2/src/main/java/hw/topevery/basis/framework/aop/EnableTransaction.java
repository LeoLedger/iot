package hw.topevery.basis.framework.aop;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import org.springframework.transaction.TransactionDefinition;

/**
 * @Summary
 * @Author zhk
 * @Date 2021/5/24 10:53
 */

@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface EnableTransaction {
    int timeout() default 0;

    /**
     * 事务传播行为
     * @see TransactionDefinition
     * @return
     */
    int propagationBehavior() default TransactionDefinition.PROPAGATION_REQUIRED;

    /**
     * 事务隔离级别
     * @return
     */
    int isolationLevel() default TransactionDefinition.ISOLATION_DEFAULT;

    String DbExecuteName() default "pmiDatabase";
}
