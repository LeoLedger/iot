package hw.topevery.basis.dal.util;

import java.util.concurrent.*;

import org.apache.commons.lang3.concurrent.BasicThreadFactory;
import org.springframework.stereotype.Component;

@Component
public class ThreadUtils {
    public static final ExecutorService MULTI_EXECUTOR_SERVICE = new ThreadPoolExecutor(8,
        16,
        3,
        TimeUnit.MINUTES,
        new ArrayBlockingQueue<>(1000),
        new BasicThreadFactory.Builder().namingPattern("task-schedule-pool-%d").build());

    public <T> Future<T> submit(Callable<T> task) {
        return MULTI_EXECUTOR_SERVICE.submit(task);
    }

    public void execute(Runnable command) {
        MULTI_EXECUTOR_SERVICE.execute(command);
    }

}
