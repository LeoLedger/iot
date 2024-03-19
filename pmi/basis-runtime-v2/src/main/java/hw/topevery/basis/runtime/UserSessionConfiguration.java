package hw.topevery.basis.runtime;

import hw.topevery.basis.entity.po.SysDept;
import hw.topevery.basis.entity.po.SysRole;
import hw.topevery.basis.entity.po.SysUser;
import hw.topevery.basis.framework.UserSession;
import hw.topevery.framework.SystemConst;
import org.apache.commons.collections.CollectionUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

import java.util.List;
import java.util.stream.Collectors;

@Configuration
public class UserSessionConfiguration {

    private SysUser getUser() {
        return UserRuntime.getSysUser();
    }

    private String getUserId() {
        SysUser sysUser = getUser();
        if (sysUser != null) {
            return sysUser.userId;
        }
        return SystemConst.UUID_EMPTY_STRING;
    }

    @Bean
    @Scope("request")
    public UserSession getUserSession() {
        UserSession session = new UserSession();
        SysUser u = UserRuntime.getSysUser();
        if (u != null) {
            session.setUserId(u.userId);
            session.setUserName(u.userName);
            session.setUserLoginName(u.loginName);
            session.setDeptId(u.deptId);
            session.setAuthenticated(true);
            session.setAdmin(u.userIsAdmin == 1);
            List<SysRole> roles = UserRuntime.getRoles();
            if(CollectionUtils.isNotEmpty(roles)){
                session.setRoles(roles.stream().map(x -> x.roleId).toArray(String[]::new));
                session.setRoleCodes(roles.stream().map(x -> x.roleCode).collect(Collectors.toList()));
            }

            SysDept dept = UserRuntime.getSysDept();
            if (dept != null) {
                if (dept.enableDataFilter != null) {
                    session.setEnableDataFilter(dept.enableDataFilter);
                }
                if (dept.enableDataFilter != null) {
                    session.setCostCenterId(dept.costCenterId);
                }
                session.setDeptName(dept.deptName);
            }
        }

        return session;
    }
}
