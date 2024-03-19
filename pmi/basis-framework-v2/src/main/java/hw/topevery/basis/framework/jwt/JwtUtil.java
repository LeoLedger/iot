package hw.topevery.basis.framework.jwt;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import hw.topevery.basis.framework.Cfg;
import hw.topevery.framework.Utility;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.time.DateUtils;

import java.util.Date;

@Slf4j
public class JwtUtil {
    public static JwtToken buildToken(String token) {
        return buildToken(token,"");
    }

    public static JwtToken buildToken(String token, String refreshToken) {
        JwtProperties jwtCfg = Cfg.getJwtCfgVal();
        DecodedJWT decodedJwt = JwtUtil.getJwtInfo(token);
        JwtToken res = new JwtToken(token, decodedJwt.getId(), refreshToken, jwtCfg.getExpireSecond());
        res.setLoginName(decodedJwt.getClaim("p_login_name").asString());
        res.setCreateDate(decodedJwt.getIssuedAt());
        res.setExpireSecond(jwtCfg.getExpireSecond());
        res.setExpireDate(decodedJwt.getExpiresAt());
        return res;
    }

    public static String buildTokenString(String loginName) {
        JwtProperties jwtCfg = Cfg.getJwtCfgVal();
        return buildTokenString(loginName, jwtCfg.getExpireSecond().intValue(), jwtCfg.getSecret());
    }

    public static String buildTokenString(String loginName, String userId) {
        JwtProperties jwtCfg = Cfg.getJwtCfgVal();
        return buildTokenString(loginName, jwtCfg.getExpireSecond().intValue(), jwtCfg.getSecret(), userId);
    }

    public static String buildTokenString(String loginName, int expireSecond, String salt) {
        JwtProperties jwtCfg = Cfg.getJwtCfgVal();
        Algorithm algorithm = Algorithm.HMAC256(salt);
        String jwtId = Utility.uuidRandomString();
        Date expireDate = DateUtils.addSeconds(new Date(), expireSecond);
        return JWT.create()
                //jwt唯一id
                .withJWTId(jwtId)
                .withClaim("p_login_name", loginName)
                //签发人
                .withIssuer(jwtCfg.getIssuer())
                //主题
                .withSubject(jwtCfg.getSubject())
                //签发的目标
                .withAudience(jwtCfg.getAudience())
                //签名时间
                .withIssuedAt(new Date())
                //token过期时间
                .withExpiresAt(expireDate)
                //签名
                .sign(algorithm);
    }

    public static String buildTokenString(String loginName, int expireSecond, String salt, String userId) {
        JwtProperties jwtCfg = Cfg.getJwtCfgVal();
        Algorithm algorithm = Algorithm.HMAC256(salt);
        String jwtId = Utility.uuidRandomString();
        Date expireDate = DateUtils.addSeconds(new Date(), expireSecond);
        return JWT.create()
                //jwt唯一id
                .withJWTId(jwtId)
                .withClaim("p_login_name", loginName)
                .withClaim("p_user_id", userId)
                //签发人
                .withIssuer(jwtCfg.getIssuer())
                //主题
                .withSubject(jwtCfg.getSubject())
                //签发的目标
                .withAudience(jwtCfg.getAudience())
                //签名时间
                .withIssuedAt(new Date())
                //token过期时间
                .withExpiresAt(expireDate)
                //签名
                .sign(algorithm);
    }

    public static boolean verifyToken(String token) {
        JwtProperties jwtCfg = Cfg.getJwtCfgVal();
        try {
            Algorithm algorithm = Algorithm.HMAC256(jwtCfg.getSecret());
            JWTVerifier verifier = JWT.require(algorithm)
                    // 签发人
                    .withIssuer(jwtCfg.getIssuer())
                    // 主题
                    .withSubject(jwtCfg.getSubject())
                    // 签发的目标
                    .withAudience(jwtCfg.getAudience())
                    .build();
            DecodedJWT jwt = verifier.verify(token);
            if (jwt != null) {
                return true;
            }
        } catch (Exception e) {
            log.error("Verify Token Exception", e);
        }
        return false;
    }

    /**
     * 解析token，获取token数据
     *
     * @param token token值
     * @return 解析后的token信息
     */
    public static DecodedJWT getJwtInfo(String token) {
        return JWT.decode(token);
    }

    /**
     * 获取过期时间
     *
     * @param token token值
     * @return 过期时间
     */
    public static Date getExpireDate(String token) {
        DecodedJWT decodedJwt = getJwtInfo(token);
        return decodedJwt.getExpiresAt();
    }

    /**
     * 判断token是否已过期
     *
     * @param token token值
     * @return 是否过期，true过期，false 未过期
     */
    public static boolean isExpired(String token) {
        Date expireDate = getExpireDate(token);
        if (expireDate == null) {
            return true;
        }
        return expireDate.before(new Date());
    }
}
