package hw.topevery.basis.wapi.pmi.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class SwaggerProperties {
    /**
     * 标题
     */
    @Value("${swagger.title}")
    public String title;

    /**
     * 基本包
     */
    @Value("${swagger.base.package}")
    public String basePackage;

    /**
     * 描述
     */
    @Value("${swagger.description}")
    public String description;

    /**
     * URL
     */
    @Value("${swagger.url}")
    public String url;

    /**
     * 版本
     */
    @Value("${swagger.version}")
    public String version;
}
