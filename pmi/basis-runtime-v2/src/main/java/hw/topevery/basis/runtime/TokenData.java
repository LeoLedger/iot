package hw.topevery.basis.runtime;

import lombok.Data;

import java.io.Serializable;

/**
 * @author yy
 */
@Data
public class TokenData implements Serializable {
    public String access_token;
    public String token_type;
    public Long expires_in;
    public String refresh_token;
}
