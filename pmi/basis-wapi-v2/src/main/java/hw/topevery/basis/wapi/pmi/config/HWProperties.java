package hw.topevery.basis.wapi.pmi.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * @author 陆韦里
 */
@Component
public class HWProperties {

    @Value("${hw.fmpCode}")
    public String fmpCode;
}
