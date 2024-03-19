package hw.topevery.basis;

import com.alibaba.druid.spring.boot.autoconfigure.DruidDataSourceAutoConfigure;
import org.jobrunr.scheduling.JobScheduler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@ComponentScan({
        "hw.topevery.framework.si",
        "hw.topevery.cloud.client",
        "hw.topevery.basis.**",
        "hw.topevery.af.**",
        "hw.topevery.config"
})
@SpringBootApplication(exclude = {DruidDataSourceAutoConfigure.class})
public class BasisScheduleV2Application {

    public static void main(String[] args) {
        SpringApplication.run(BasisScheduleV2Application.class, args);
    }
}
