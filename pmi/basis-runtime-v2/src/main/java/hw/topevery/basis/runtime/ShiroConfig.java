package hw.topevery.basis.runtime;

import hw.topevery.basis.runtime.jwt.JwtCredentialsMatcher;
import org.apache.shiro.authc.credential.CredentialsMatcher;
import org.apache.shiro.config.Ini;
import org.apache.shiro.mgt.DefaultSessionStorageEvaluator;
import org.apache.shiro.mgt.DefaultSubjectDAO;
import org.apache.shiro.mgt.SecurityManager;
import org.apache.shiro.mgt.SessionStorageEvaluator;
import org.apache.shiro.spring.security.interceptor.AuthorizationAttributeSourceAdvisor;
import org.apache.shiro.spring.web.ShiroFilterFactoryBean;
import org.apache.shiro.web.mgt.DefaultWebSecurityManager;
import org.apache.shiro.web.mgt.DefaultWebSessionStorageEvaluator;
import org.springframework.aop.framework.autoproxy.DefaultAdvisorAutoProxyCreator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.servlet.Filter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Shiro权鉴配置类
 *
 * @author bingxin.xu
 */
@Configuration
public class ShiroConfig {

    @Value("${hw.shiro.filter-chain-definitions}")
    private String filterChainDefinitions;

    /**
     * @return
     */
    @Bean
    public CredentialsMatcher credentialsMatcher() {
        return new JwtCredentialsMatcher();
    }

    @Bean
    @ConditionalOnMissingBean
    public DefaultAdvisorAutoProxyCreator defaultAdvisorAutoProxyCreator() {
        DefaultAdvisorAutoProxyCreator defaultAAP = new DefaultAdvisorAutoProxyCreator();
        defaultAAP.setProxyTargetClass(true);
        return defaultAAP;
    }

    /**
     * @return
     */
    @Bean
    public AuthorizationAttributeSourceAdvisor authorizationAttributeSourceAdvisor(SecurityManager shiroSecurityManager) {
        AuthorizationAttributeSourceAdvisor advisor = new ShiroAdvisor();
        advisor.setSecurityManager(shiroSecurityManager);
        return advisor;
    }

    private Ini.Section chainListSection() {
        //加载默认的url过滤定义
        Ini ini = new Ini();
        //加载XML配置中的filterChainDefinitions配置
        ini.load(this.filterChainDefinitions);
        //配置Map<String,String>
        Ini.Section section = ini.getSection(Ini.DEFAULT_SECTION_NAME);
        return section;
    }

    /**
     * 设置过滤规则
     *
     * @param shiroSecurityManager
     * @return
     */
    @Bean
    public ShiroFilterFactoryBean shiroFilterFactoryBean(SecurityManager shiroSecurityManager) {
        ShiroFilterFactoryBean shiroFilterFactoryBean = new ShiroFilterFactoryBean();
        shiroFilterFactoryBean.setSecurityManager(shiroSecurityManager);
        shiroFilterFactoryBean.setLoginUrl("/login");
        shiroFilterFactoryBean.setSuccessUrl("/");
        shiroFilterFactoryBean.setUnauthorizedUrl("/unauth");


        // 注意此处使用的是LinkedHashMap，是有顺序的，shiro会按从上到下的顺序匹配验证，匹配了就不再继续验证
        // 所以上面的url要苛刻，宽松的url要放在下面，尤其是"/**"要放到最下面，如果放前面的话其后的验证规则就没作用了。
        // authc:url必须认证通过才可以访问;
        // anon:url可以匿名访问
        Map<String, String> filterChainDefinitionMap = new LinkedHashMap<>();
        filterChainDefinitionMap.put("/", "anon");
        filterChainDefinitionMap.put("/favicon.ico", "anon");
        filterChainDefinitionMap.put("/rs/**", "anon");
        filterChainDefinitionMap.put("/oauth/**", "anon");
        filterChainDefinitionMap.put("/login", "anon");
        filterChainDefinitionMap.put("/checkToken", "anon");
        filterChainDefinitionMap.put("/refreshToken", "anon");
        filterChainDefinitionMap.put("/get_token_by_code", "anon");

        // 案件
        filterChainDefinitionMap.put("/eventService", "anon");
        filterChainDefinitionMap.put("/event", "anon");

        // 企业为登录注册，企业微信授权
        filterChainDefinitionMap.put("/noPermiss/hello", "anon");
        filterChainDefinitionMap.put("/account/login", "anon");
        filterChainDefinitionMap.put("/oauth/login", "anon");
        filterChainDefinitionMap.put("/account/getLoginAuthUrl", "anon");
        filterChainDefinitionMap.put("/account/loginCallBack", "anon");
        filterChainDefinitionMap.put("/account/loginByCode", "anon");
        filterChainDefinitionMap.put("/account/getRegisterAuthUrl", "anon");
        filterChainDefinitionMap.put("/account/registerCallBack", "anon");
        filterChainDefinitionMap.put("/account/submitRegister", "anon");
        filterChainDefinitionMap.put("/account/submitMaRegister", "anon");
        filterChainDefinitionMap.put("/account/getOpenIdByCode", "anon");
        filterChainDefinitionMap.put("/account/test", "anon");
        filterChainDefinitionMap.put("/account/getWechatDeptTree", "anon");
        filterChainDefinitionMap.put("/account/getSysDeptTree", "anon");
        filterChainDefinitionMap.put("/account/getWechatIdByCode", "anon");
        filterChainDefinitionMap.put("/WW_verify_6J23GXRIcIna2tQi.txt", "anon");
        filterChainDefinitionMap.put("/WW_verify_oFv3mrAJZhAJIGuw.txt", "anon");

        // fmp请求地址，暂时不用验证
        filterChainDefinitionMap.put("/fmp/file", "anon");
        filterChainDefinitionMap.put("/fmp/thumbnail", "anon");
        // excel模板
        filterChainDefinitionMap.put("/excelTemplate/**", "anon");
        filterChainDefinitionMap.put("/logout", "anon");
        filterChainDefinitionMap.put("/js/**", "anon");
        filterChainDefinitionMap.put("/css/**", "anon");
        filterChainDefinitionMap.put("/img/**", "anon");
        filterChainDefinitionMap.put("/docs", "anon");
        filterChainDefinitionMap.put("/captcha", "anon");
        filterChainDefinitionMap.put("/encrypt", "anon");
        filterChainDefinitionMap.put("/getDecryptPwd", "anon");
        filterChainDefinitionMap.put("/getEncryptPwd", "anon");
        // 获取公钥
        filterChainDefinitionMap.put("/getPublicKey", "anon");
        filterChainDefinitionMap.put("/swagger-ui/**", "anon");
        filterChainDefinitionMap.put("/swagger-ui.html", "anon");
        filterChainDefinitionMap.put("/v3/api-docs", "anon");
        filterChainDefinitionMap.put("/webjars/springfox-swagger-ui/**", "anon");
        filterChainDefinitionMap.put("/swagger-resources/**", "anon");
        filterChainDefinitionMap.put("/v2/api-docs", "anon");
        filterChainDefinitionMap.put("/csrf", "anon");
        // 统一门户同步数据
        filterChainDefinitionMap.put("/sync/**", "anon");

        Ini.Section chainList = chainListSection();
        for (String key : chainList.keySet()) {
            String value = chainList.get(key);
            filterChainDefinitionMap.put(key, value);
        }
        filterChainDefinitionMap.put("/**", "authc");

        shiroFilterFactoryBean.setFilterChainDefinitionMap(filterChainDefinitionMap);
        // 自定义权鉴处理
        Map<String, Filter> filters = new LinkedHashMap<String, Filter>();
        {
            EoPermissionFilter eoPermissionFilter = new EoPermissionFilter();
            filters.put("authc", eoPermissionFilter);
            ShiroFilter csf = new ShiroFilter();
            filters.put("authc", csf);
        }

        shiroFilterFactoryBean.setFilters(filters);

        return shiroFilterFactoryBean;
    }


    /**
     * 自定义realm
     *
     * @return
     */
    @Bean
    public ShiroUserRealm userRealm(CredentialsMatcher credentialsMatcher) {
        ShiroUserRealm userRealm = new ShiroUserRealm();
        userRealm.setCredentialsMatcher(credentialsMatcher);
        return userRealm;
    }

    /**
     * 禁用session, 不保存用户登录状态。保证每次请求都重新认证。
     * 需要注意的是，如果用户代码里调用Subject.getSession()还是可以用session
     */
    @Bean
    protected SessionStorageEvaluator sessionStorageEvaluator() {
        DefaultWebSessionStorageEvaluator sessionStorageEvaluator = new DefaultWebSessionStorageEvaluator();
        sessionStorageEvaluator.setSessionStorageEnabled(false);
        return sessionStorageEvaluator;
    }

    /**
     * 安全管理器
     * 注：使用shiro-spring-boot-starter 1.4时，返回类型是SecurityManager会报错，直接引用shiro-spring则不报错
     *
     * @return
     */
    @Bean
    public DefaultWebSecurityManager shiroSecurityManager(ShiroUserRealm userRealm) {
        DefaultWebSecurityManager securityManager = new DefaultWebSecurityManager();
        securityManager.setRealm(userRealm);

        /**
         * 关闭shiro自带的session，详情见文档
         * http://shiro.apache.org/session-management.html#SessionManagement-StatelessApplications%28Sessionless%29
         **/
        DefaultSubjectDAO subjectDAO = new DefaultSubjectDAO();
        DefaultSessionStorageEvaluator defaultSessionStorageEvaluator = new DefaultSessionStorageEvaluator();
        defaultSessionStorageEvaluator.setSessionStorageEnabled(false);
        subjectDAO.setSessionStorageEvaluator(defaultSessionStorageEvaluator);
        securityManager.setSubjectDAO(subjectDAO);

        return securityManager;
    }
}
