package hw.topevery.basis.framework.base.concurrency;

public class ConcurrencyException extends Exception {
    public ConcurrencyException(String message) {
        super(message);
    }

    public static boolean occursConcurrencyException(Exception exception) {
        Throwable throwable = exception;
        do {
            if (throwable instanceof ConcurrencyException) {
                return true;
            }
            throwable = throwable.getCause();
        } while (throwable != null);
        return false;
    }
}
