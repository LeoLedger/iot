package hw.topevery.basis.framework.auditing;

import com.alibaba.ttl.TransmittableThreadLocal;
import org.springframework.stereotype.Component;

@Component
public class AuditLogScopeAccessor {
    private static ThreadLocal<AuditLogScope> _current = new TransmittableThreadLocal();

    public AuditLogScope getCurrent(){
        return _current.get();
    }

    public void setCurrent(AuditLogScope val){
        _current.set(val);
    }
}
