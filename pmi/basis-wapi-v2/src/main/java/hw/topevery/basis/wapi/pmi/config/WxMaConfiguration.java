package hw.topevery.basis.wapi.pmi.config;

import cn.binarywang.wx.miniapp.api.WxMaService;
import cn.binarywang.wx.miniapp.api.impl.WxMaServiceImpl;
import cn.binarywang.wx.miniapp.config.impl.WxMaDefaultConfigImpl;
import lombok.extern.slf4j.Slf4j;
import me.chanjar.weixin.common.error.WxRuntimeException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * WxMaConfiguration
 *
 * @Summary
 * @Author zhk
 * @Date 2021/6/17 17:43
 */

@Slf4j
@Configuration
@EnableConfigurationProperties(WxMaProperties.class)
public class WxMaConfiguration {

    private final WxMaProperties properties;

    private static WxMaService maServices;

    @Autowired
    public WxMaConfiguration(WxMaProperties properties) {
        this.properties = properties;
    }

    public static WxMaService getMaService() {
        return maServices;
    }

    @PostConstruct
    public void init() {
        WxMaDefaultConfigImpl config = new WxMaDefaultConfigImpl();
//                WxMaDefaultConfigImpl config = new WxMaRedisConfigImpl(new JedisPool());
        // 使用上面的配置时，需要同时引入jedis-lock的依赖，否则会报类无法找到的异常
        config.setAppid(this.properties.getAppid());
        config.setSecret(this.properties.getSecret());
        config.setToken(this.properties.getToken());
        config.setAesKey(this.properties.getAesKey());
        config.setMsgDataFormat(this.properties.getMsgDataFormat());

        WxMaService service = new WxMaServiceImpl();
        service.setWxMaConfig(config);
        maServices = service;
    }
}
