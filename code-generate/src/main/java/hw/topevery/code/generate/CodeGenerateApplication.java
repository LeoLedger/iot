package hw.topevery.code.generate;

import com.alibaba.druid.spring.boot.autoconfigure.DruidDataSourceAutoConfigure;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;

@ComponentScan({"hw.topevery.framework.si",
        "hw.topevery.cloud.client",
        "hw.topevery.code.generate.*"})
@SpringBootApplication(exclude = {DruidDataSourceAutoConfigure.class, SecurityAutoConfiguration.class})
public class CodeGenerateApplication {

    public static void main(String[] args) {
        SpringApplication.run(CodeGenerateApplication.class, args);
    }

}
