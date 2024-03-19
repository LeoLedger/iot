package hw.topevery.basis.framework.jwt;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "hw.jwt")
public class JwtProperties {
    /**
     * token名称,默认名称为：token，可自定义
     */
    private String tokenName = "token";

    /**
     * token名称,默认名称为：refreshToken，可自定义
     */
    private String refreshTokenName = "refreshToken";

    /**
     * 密码
     */
    private String secret = "66666";

    /**
     * 签发人
     */
    private String issuer;

    /**
     * 主题
     */
    private String subject;

    /**
     * 签发的目标
     */
    private String audience;

    /**
     * token失效时间,默认1小时，60*60=3600
     */
    private Long expireSecond = 360000000L;

    /**
     * 是否刷新token，默认为true
     */
    private boolean refreshToken = true;

    /**
     * 刷新token过期时间 默认7天，单位秒
     */
    private Integer refreshExpireSecond = 604800;
    /**
     * 单用户登陆，一个用户只能又一个有效的token
     */
    private boolean singleLogin;

    /**
     * 是否进行盐值校验
     */
    private boolean saltCheck;

}
