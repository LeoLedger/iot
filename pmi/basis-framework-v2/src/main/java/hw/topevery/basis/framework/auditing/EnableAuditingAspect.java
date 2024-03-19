package hw.topevery.basis.framework.auditing;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect
@Component
@Order(99)
public class EnableAuditingAspect {

    @Autowired
    AuditingManager auditingManager;

    @Pointcut("@annotation(hw.topevery.basis.framework.auditing.EnableAuditing)")
    private void pointcut() {
    }

    @Around("pointcut()")
    public Object invoke(ProceedingJoinPoint joinPoint) throws Throwable {
        AuditLogScope auditLog = auditingManager.beginScope();

        try {
            return joinPoint.proceed();
        } finally {
            try {
                auditingManager.save(auditLog);
            } catch (Exception e) {
                // 不再抛出此异常
                log.error(e.getMessage(), e);
            }
        }
    }

}
