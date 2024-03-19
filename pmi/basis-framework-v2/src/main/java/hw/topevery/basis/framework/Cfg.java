package hw.topevery.basis.framework;

import hw.topevery.basis.framework.jwt.JwtProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;

@Component("hw.topevery.basis.framework.Cfg")
public class Cfg {

    @Autowired
    private JwtProperties jwtCfgValAutowired;

    private static JwtProperties jwtCfgVal;

    public static JwtProperties getJwtCfgVal() {
        return jwtCfgVal;
    }
    @PostConstruct
    private void initAutowired() {
        jwtCfgVal = jwtCfgValAutowired;
    }
}
