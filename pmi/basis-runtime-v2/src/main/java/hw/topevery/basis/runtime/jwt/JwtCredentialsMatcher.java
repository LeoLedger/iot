package hw.topevery.basis.runtime.jwt;

import hw.topevery.basis.framework.jwt.JwtToken;
import hw.topevery.basis.framework.jwt.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.shiro.authc.AuthenticationInfo;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.credential.CredentialsMatcher;

/**
 * JWT证书匹配
 *
 * @author yang.yang
 */
@Slf4j
public class JwtCredentialsMatcher implements CredentialsMatcher {

    @Override
    public boolean doCredentialsMatch(AuthenticationToken authenticationToken, AuthenticationInfo authenticationInfo) {
        JwtToken jwtToken = (JwtToken) authenticationToken;
        try {
            return JwtUtil.verifyToken(jwtToken.getToken());
        } catch (Exception e) {
            log.error("JWT Token CredentialsMatch Exception:" + e.getMessage(), e);
        }
        return false;
    }

}
