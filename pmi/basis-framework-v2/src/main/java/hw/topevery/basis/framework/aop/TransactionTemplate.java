package hw.topevery.basis.framework.aop;

import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionException;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.transaction.support.CallbackPreferringPlatformTransactionManager;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.util.Assert;

import java.lang.reflect.UndeclaredThrowableException;

public class TransactionTemplate extends org.springframework.transaction.support.TransactionTemplate {
    public TransactionTemplate() {
    }

    public TransactionTemplate(PlatformTransactionManager transactionManager) {
        super(transactionManager);
    }

    @Override
    public <T> T execute(TransactionCallback<T> action) throws TransactionException {
        Assert.state(this.getTransactionManager() != null, "No PlatformTransactionManager set");
        if (this.getTransactionManager() instanceof CallbackPreferringPlatformTransactionManager) {
            return ((CallbackPreferringPlatformTransactionManager) this.getTransactionManager()).execute(this, action);
        } else {
            TransactionStatus status = this.getTransactionManager().getTransaction(this);

            Object result;
            try {
                result = action.doInTransaction(status);
            } catch (Error | RuntimeException var5) {
                this.rollbackOnException(status, var5);
                throw var5;
            } catch (Throwable var6) {
                this.rollbackOnException(status, var6);
                throw new UndeclaredThrowableException(var6, "TransactionCallback threw undeclared checked exception");
            }

            // 事务已经被提交，则不再提交
            if (!status.isCompleted()) {
                this.getTransactionManager().commit(status);
            }
            return (T) result;
        }
    }

    private void rollbackOnException(TransactionStatus status, Throwable ex) throws TransactionException {
        Assert.state(this.getTransactionManager() != null, "No PlatformTransactionManager set");
        this.logger.debug("Initiating transaction rollback on application exception", ex);
        // 事务已经被提交，则不再提交
        if (status.isCompleted()) {
            return;
        }
        try {
            this.getTransactionManager().rollback(status);
        } catch (TransactionSystemException var4) {
            this.logger.error("Application exception overridden by rollback exception", ex);
            var4.initApplicationException(ex);
            throw var4;
        } catch (Error | RuntimeException var5) {
            this.logger.error("Application exception overridden by rollback exception", ex);
            throw var5;
        }
    }
}
