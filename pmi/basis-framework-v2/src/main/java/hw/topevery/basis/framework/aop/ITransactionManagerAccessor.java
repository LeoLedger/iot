package hw.topevery.basis.framework.aop;

import lombok.Data;
import lombok.Getter;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;

/**
 * TransactionManager 访问器。
 */
public interface ITransactionManagerAccessor {
    PlatformTransactionManager getCurrent();
    TransactionStatus getStatus();
    void setAmbientData(AmbientData val);

    @Data
    public static class AmbientData {
        private PlatformTransactionManager platformTransactionManager;
        private TransactionStatus transactionStatus;

        public AmbientData(PlatformTransactionManager manager, TransactionStatus status){
            this.platformTransactionManager = manager;
            this.transactionStatus = status;
        }
    }
}
