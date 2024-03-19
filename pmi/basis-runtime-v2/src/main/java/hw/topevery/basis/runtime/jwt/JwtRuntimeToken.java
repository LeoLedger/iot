package hw.topevery.basis.runtime.jwt;

import hw.topevery.basis.framework.jwt.JwtToken;
import hw.topevery.basis.runtime.UserRuntime;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class JwtRuntimeToken extends JwtToken {

    private UserRuntime userRuntime;

    public void copy(JwtToken token) {
        setCreateDate(token.getCreateDate());
        setExpireDate(token.getExpireDate());
        setExpireSecond(token.getExpireSecond());
        setJwtId(token.getJwtId());
        setLoginName(token.getLoginName());
        setToken(token.getToken());
    }

}
