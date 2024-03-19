package hw.topevery.basis.framework.aop;

import com.alibaba.druid.pool.DruidDataSource;
import hw.topevery.framework.db.DataSourceFactory;
import hw.topevery.framework.db.DbExecute;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicReference;

/**
 * EnableTransactionAspect
 *
 * @Summary
 * @Author zhk
 * @Date 2021/5/24 10:54
 */
@Slf4j
@Aspect
@Component
@Order(1)
public class EnableTransactionAspect {

    @Autowired
    ITransactionManagerAccessor managerAccessor;

    @Pointcut("@annotation(hw.topevery.basis.framework.aop.EnableTransaction)")
    private void pointcut() {
    }

    @Around("pointcut()")
    public Object invoke(ProceedingJoinPoint joinPoint) throws NoSuchMethodException {

        EnableTransaction annotation = getDeclaredAnnotation(joinPoint);

        DbExecute dbExecute = DbExecute.getInstance(annotation.DbExecuteName());
        DruidDataSource dataSource = DataSourceFactory.getDataSource(dbExecute.getConnectionSetting());
        DataSourceTransactionManager transactionManager = new DataSourceTransactionManager(dataSource);
        TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);
        if (annotation.timeout() > 0) {
            transactionTemplate.setTimeout(annotation.timeout());
        }
        transactionTemplate.setPropagationBehavior(annotation.propagationBehavior());
        transactionTemplate.setIsolationLevel(annotation.isolationLevel());
        return transactionTemplate.execute((status) -> {
            try {
                managerAccessor.setAmbientData(new ITransactionManagerAccessor.AmbientData(transactionManager, status));
                return joinPoint.proceed();
            } catch (Throwable throwable) {
                log.error(throwable.getMessage(), throwable);
                throw new RuntimeException(throwable.getMessage(), throwable);
            }
        });
    }

    /**
     * 获取方法中声明的注解
     *
     * @param joinPoint
     * @return
     * @throws NoSuchMethodException
     */
    public EnableTransaction getDeclaredAnnotation(ProceedingJoinPoint joinPoint) throws NoSuchMethodException {
        // 获取方法名
        String methodName = joinPoint.getSignature().getName();
        // 反射获取目标类
        Class<?> targetClass = joinPoint.getTarget().getClass();
        // 拿到方法对应的参数类型
        Class<?>[] parameterTypes = ((MethodSignature) joinPoint.getSignature()).getParameterTypes();
        // 根据类、方法、参数类型（重载）获取到方法的具体信息
        Method objMethod = targetClass.getMethod(methodName, parameterTypes);
        // 拿到方法定义的注解信息
        return objMethod.getDeclaredAnnotation(EnableTransaction.class);
    }
}
