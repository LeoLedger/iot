package hw.topevery.basis.config;

import hw.topevery.basis.framework.UserSession;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class UserSessionConfiguration {

    @Bean
    public UserSession getUserSession() {
        UserSession session = new UserSession();
        session.setUserId("JobRunr");
        session.setUserName("JobRunr");
        session.setUserLoginName("JobRunr");
        session.setAuthenticated(true);
        return session;
    }
}
