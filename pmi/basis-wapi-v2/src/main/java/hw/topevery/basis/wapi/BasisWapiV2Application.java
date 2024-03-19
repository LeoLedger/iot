package hw.topevery.basis.wapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;

import com.alibaba.druid.spring.boot.autoconfigure.DruidDataSourceAutoConfigure;


@ComponentScan({
        "hw.topevery.framework.si",
        "hw.topevery.cloud.client",
        "hw.topevery.basis.**",
        "hw.topevery.af.**",
        "hw.topevery.config"
})
@SpringBootApplication(exclude = {DruidDataSourceAutoConfigure.class, SecurityAutoConfiguration.class})
public class BasisWapiV2Application {

    public static void main(String[] args) {
        SpringApplication.run(BasisWapiV2Application.class, args);
    }
}
