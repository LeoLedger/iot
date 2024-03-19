package hw.topevery.basis.framework.jwt;

import lombok.Data;
import org.apache.commons.lang3.time.DateUtils;
import org.apache.shiro.authc.AuthenticationToken;

import java.io.Serializable;
import java.util.Date;

@Data
public class JwtToken implements AuthenticationToken, Serializable {
    /**
     * 值
     */
    private String token;

    private String refresh_token;

    private String token_type;
    /**
     * jwtTokenId
     */
    private String jwtId;

    /**
     * 登陆用户名称
     */
    private String loginName;

    /**
     * 创建时间
     */
    private Date createDate;
    /**
     * 多长时间过期，默认一小时
     */
    private long expireSecond;
    /**
     * 过期日期
     */
    private Date expireDate;

    public JwtToken() {
    }

    public JwtToken(String token, String jwtId) {
        setToken(token);
        setJwtId(jwtId);
    }

    public JwtToken(String token, String jwtId, String refresh_token, long expireSecond) {
        setToken(token);
        setJwtId(jwtId);
        setRefresh_token(refresh_token);
        setExpireSecond(expireSecond);
        setExpireDate(DateUtils.addSeconds(new Date(), (int) expireSecond));
    }

    /**
     * 获取主要数据
     *
     * @return
     */
    @Override
    public Object getPrincipal() {
        return null;
    }

    /**
     * 获取资格证书
     *
     * @return
     */
    @Override
    public Object getCredentials() {
        return null;
    }
}
