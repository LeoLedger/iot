package hw.topevery.basis.runtime;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * @description:
 * @author: Chris
 * @since: 2021年09月06日 11:28
 **/
@Configuration
public class InterceptorConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        InterceptorRegistration registration = registry.addInterceptor(new CostCenterInterceptor());
        //成本中心为空时，需拦截的路径
        registration.addPathPatterns("/approval-device-out",
                "/approvalDeviceReturn",
                "/approvalCashPledge",
                "/approvalServiceCharge",
                "/approval-extend",
                "/approval-sim-renew",
                "/approvalDeviceTransfer",
                "/approval-device-damaged",
                "/approval-device-install",
                "/approval-contract",
                "/approval-inventoryt-device",
                "/fault",
                "/express",
                "/fault-repair-car",
                "/repair-bill",
//                "/approvalInvoice",
                "/sales-contract",
                "/express-repair/save",
                "/device-install-details/confirm-fee/**",
                "/device-install/close/**",
                "/repair-bill-settle"
        );
    }
}
