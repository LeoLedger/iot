package hw.topevery.basis.runtime;


import hw.topevery.basis.dal.util.UserUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;

/**
 * 静态实例工厂
 */
@Component
public class StaticFactory {

    public static UserUtil userUtil;

    @Autowired
    private UserUtil userUtilAutowired;

    private StaticFactory() {

    }

    @PostConstruct
    private void init() {
        userUtil = userUtilAutowired;
    }
}
