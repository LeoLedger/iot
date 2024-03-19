package hw.topevery.basis.framework.aop;

import com.alibaba.ttl.TransmittableThreadLocal;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;

@Component
public class TransmittableTransactionManagerAccessor implements ITransactionManagerAccessor {

    private static ThreadLocal<AmbientData> _current = new TransmittableThreadLocal();

    @Override
    public PlatformTransactionManager getCurrent() {
        PlatformTransactionManager res = null;
        AmbientData ambientData = _current.get();
        if(ambientData != null){
            res = ambientData.getPlatformTransactionManager();
        }
        return res;
    }

    @Override
    public TransactionStatus getStatus() {
        TransactionStatus res = null;
        AmbientData ambientData = _current.get();
        if(ambientData != null){
            res = ambientData.getTransactionStatus();
        }
        return res;
    }

    @Override
    public void setAmbientData(AmbientData val) {
        _current.set(val);
    }

}
