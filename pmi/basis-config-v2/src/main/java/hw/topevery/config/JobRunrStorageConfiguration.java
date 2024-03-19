package hw.topevery.config;

import hw.topevery.basis.framework.Database;
import hw.topevery.framework.db.DataSourceFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
@ComponentScan(basePackageClasses = JobRunrStorageConfiguration.class)
public class JobRunrStorageConfiguration {

    @Bean
    public DataSource dataSource() {
        return DataSourceFactory.getDataSource(Database.pmiDbExecute.getConnectionSetting());
    }
}
