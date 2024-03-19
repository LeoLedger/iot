package hw.topevery.basis.framework.auditing;

import cn.hutool.core.util.ReflectUtil;
import hw.topevery.basis.framework.UserSession;
import hw.topevery.basis.framework.base.BaseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class AuditingManager {

    @Autowired
    AuditLogScopeAccessor auditLogScopeAccessor;
    @Autowired
    AuditLogStore logStore;

    public AuditLogScope getCurrent() {
        return auditLogScopeAccessor.getCurrent();
    }

    public AuditLogScope beginScope() {

        AuditLogScope curr = auditLogScopeAccessor.getCurrent();
        if (curr != null) {
            return curr;
        }

        AuditLogInfo log = new AuditLogInfo();
        UserSession session = UserSession.getInstance();
        log.setUserId(session.getUserId());
        log.setUserName(session.getUserName());

        curr = new AuditLogScope(log);
        auditLogScopeAccessor.setCurrent(curr);
        return curr;
    }

    public void save(AuditLogScope auditLog) {
        for (EntityChangeInfo entityChange : auditLog.getLog().getEntityChanges()) {
            entityChange.setChangedTime(getChangedTime(entityChange));
            refreshPropertyChanges(entityChange);
        }
        logStore.save(auditLog.getLog());
    }

    private LocalDateTime getChangedTime(EntityChangeInfo entityChange) {
        if (entityChange.getEntity() instanceof BaseEntity) {
            BaseEntity baseEntity = (BaseEntity) entityChange.getEntity();
            return baseEntity.updateTime;
        }
        return LocalDateTime.now();
    }

    protected void refreshPropertyChanges(EntityChangeInfo entityChange) {
        List<EntityPropertyChangeInfo> propertyChanges = entityChange.getPropertyChanges();
        for (EntityPropertyChangeInfo propertyChange : propertyChanges) {
            if (!propertyChange.isHasBeenChanged()) {
                Object newVal = ReflectUtil.getFieldValue(entityChange.getEntity(), propertyChange.getPropertyName());
                Object oldVal = propertyChange.getOriginalValue();

                if (oldVal == null && newVal == null) {
                    continue;
                } else if (
                        oldVal == null && newVal != null ||
                                oldVal != null && newVal == null ||
                                !oldVal.equals(newVal)
                ) {
                    propertyChange.setNewValue(newVal);
                }
            }
        }
    }
}
