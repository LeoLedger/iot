package hw.topevery.basis.framework.auditing;

public interface AuditLogStore {
    void save(AuditLogInfo logInfo);
}
