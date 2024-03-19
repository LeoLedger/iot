package hw.topevery.basis;

import org.jobrunr.scheduling.BackgroundJob;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * 初始化周期任务
 */
@Component
public class InitRecurringJob implements ApplicationRunner {
    @Override
    public void run(ApplicationArguments args) throws Exception {

        /**
         * 调用的方法，看情况加 事务控制 @EnableTransaction
         * 保持调用lambda尽可能的小。
         * 不要传递过多参数，注意参数的时效性，传递的参数尽量是业务对象的Id
         * 方法要支持重入。
         * 不要捕抓异常。
         * 可选：长执行任务，推荐使用 JobDashboardProgressBar ，反馈任务处理进度。
         * 参考：https://www.jobrunr.io/en/documentation/background-methods/best-practices/
         */

        // 同步设备最后通讯时间 每5分钟更新一次
        BackgroundJob.scheduleRecurrently("do-timed-task","0 7 10,20,28 * *", () ->{});

    }
}
