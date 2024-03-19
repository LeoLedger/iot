package hw.topevery.basis.runtime;

import hw.topevery.basis.framework.jwt.JwtToken;
import hw.topevery.basis.framework.jwt.JwtTokenUtil;
import hw.topevery.basis.framework.jwt.JwtUtil;
import hw.topevery.framework.TokenInVaidateRes;
import hw.topevery.framework.Utility;
import hw.topevery.framework.util.LogUtil;
import hw.topevery.framework.util.RequestResponseUtil;
import hw.topevery.framework.web.HttpResultCode;
import lombok.SneakyThrows;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.entity.ContentType;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.subject.Subject;
import org.apache.shiro.web.filter.authc.FormAuthenticationFilter;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.time.LocalDateTime;
import java.time.ZoneId;

/**
 * @author eric.xu
 */
@Configuration
public class ShiroFilter extends FormAuthenticationFilter {

    public void shiroFilter() {
        this.setLoginUrl("/login");
    }

    @Override
    protected boolean preHandle(ServletRequest request, ServletResponse response) throws Exception {
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        HttpServletRequest httpRequest = (HttpServletRequest) request;

        //跨域的header设置
        httpResponse.setHeader("Access-control-Allow-Origin", httpRequest.getHeader("Origin"));
        httpResponse.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS,PUT,DELETE,PATCH");
        httpResponse.setHeader("Access-Control-Allow-Credentials", "true");
        httpResponse.setHeader("Access-Control-Allow-Headers", httpRequest.getHeader("Access-Control-Request-Headers"));
        //防止乱码，适用于传输JSON数据
        httpResponse.setHeader("Content-Type", "application/json;charset=UTF-8");

        if (httpRequest.getMethod().equals(RequestMethod.OPTIONS.name())) {
            httpResponse.setStatus(HttpStatus.OK.value());
            return true;
        }
        return super.preHandle(httpRequest, httpResponse);
    }

    @SneakyThrows
    @Override
    protected boolean isAccessAllowed(ServletRequest request, ServletResponse response, Object mappedValue) {
        if (this.isLoginRequest(request, response)) {
            return true;
        }
        boolean allowed = false;
        try {
            allowed = executeLogin(request, response);
        } catch (AuthenticationException e) {
            //not found any token
            LogUtil.error("Token不能为空", e);
            RequestResponseUtil.responseWrite(ContentType.DEFAULT_TEXT.getMimeType(), "token错误", HttpResultCode.UNAUTHORIZED.getCode(), response, true);
        } catch (Exception e) {
            LogUtil.error("访问错误", e);
            throw e;
        }
        return allowed || super.isPermissive(mappedValue);
    }

    // 企业微信/小程序 token失效处理
    @Override
    protected boolean onAccessDenied(ServletRequest request, ServletResponse response) throws Exception {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String userAgent = httpRequest.getHeader("User-Agent").toLowerCase();
        String isMobileStr = httpRequest.getHeader("isMobile");
        boolean isMobile = false;
        if (!StringUtils.isEmpty(isMobileStr)) {
            isMobile = Boolean.parseBoolean(isMobileStr);
        }
        if (userAgent.contains("micromessenger") || isMobile) {
            TokenInVaidateRes result = new TokenInVaidateRes();
            result.success = false;
            result.msg = "token 失效";
            result.code = 101;
            RequestResponseUtil.responseWrite(Utility.jsonSerialize(result), response, true);
            return false;
        } else {
            return super.onAccessDenied(request, response);
        }
    }

    /**
     * 将JWT Token包装成AuthenticationToken
     *
     * @param servletRequest  请求头
     * @param servletResponse 请求体
     * @return AuthenticationToken
     */
    @Override
    protected AuthenticationToken createToken(ServletRequest servletRequest, ServletResponse servletResponse) {
        String token = JwtTokenUtil.getToken((HttpServletRequest) servletRequest);
        if (StringUtils.isBlank(token)) {
            throw new AuthenticationException("token不能为空");
        }
        if (JwtUtil.isExpired(token)) {
            throw new AuthenticationException("JWT Token已过期,token:" + token);
        }
        return JwtUtil.buildToken(token);
    }

    @Override
    protected boolean executeLogin(ServletRequest request, ServletResponse response) {
        JwtToken jwtToken = (JwtToken) createToken(request, response);
        // 提交给realm进行登入，如果错误他会抛出异常并被捕获
        Subject subject = getSubject(request, response);
        ZoneId zoneId = ZoneId.systemDefault();
        LocalDateTime expireDate = jwtToken.getExpireDate().toInstant().atZone(zoneId).toLocalDateTime();
        if (UserRuntime.getSysUser() == null && expireDate.isAfter(LocalDateTime.now())) {
            UserRuntime.login(UserRuntime.getByLoginName(jwtToken.getLoginName()), jwtToken);
        } else {
            subject.login(jwtToken);
        }
        return true;
    }
}

