package hw.topevery.basis.framework.jwt;

import hw.topevery.basis.framework.Cfg;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;

@Slf4j
@Component
public class JwtTokenUtil {
    /**
     * 获取token名称
     *
     * @return
     */
    public static String getTokenName() {
        JwtProperties jwtCfg = Cfg.getJwtCfgVal();
        return  jwtCfg.getTokenName();
    }

    /**
     * 获取 refreshToken名称
     *
     * @return
     */
    public static String getRefreshTokenName() {
        JwtProperties jwtCfg = Cfg.getJwtCfgVal();
        return  jwtCfg.getRefreshTokenName();
    }

    /**
     * 从请求头或者请求参数中
     *
     * @return
     */
    public static String getToken() {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        return getToken(request);
    }

    /**
     * 从请求头或者请求参数中
     *
     * @param request
     * @return
     */
    public static String getToken(HttpServletRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("request不能为空");
        }
        String tokenName = getTokenName();
        // 从请求头中获取token
        String token = request.getHeader(tokenName);
        if (StringUtils.isBlank(token)) {
            // 从请求参数中获取token
            token = request.getParameter(tokenName);
        }
        return token;
    }
}
