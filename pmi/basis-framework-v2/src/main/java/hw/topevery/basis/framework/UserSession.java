package hw.topevery.basis.framework;

import lombok.Data;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.ArrayUtils;

import java.util.Arrays;
import java.util.List;

@Data
public class UserSession {
    private String userId;
    private String userName;
    private String userLoginName;
    private String deptId;
    private String deptName;
    private boolean admin;
    private String[] roles;
    private List<String> roleCodes;

    private boolean isAuthenticated;
    private boolean enableDataFilter;
    private String costCenterId;

    public boolean isInRole(String roleId) {
        if (ArrayUtils.isEmpty(roles)) return false;
        return Arrays.stream(roles).anyMatch(x -> x.equalsIgnoreCase(roleId));
    }

    public boolean isInRoleCode(String roleCode) {
        if (CollectionUtils.isEmpty(roleCodes)) return false;
        return roleCodes.stream().anyMatch(x -> x.equalsIgnoreCase(roleCode));
    }

    public static UserSession getInstance() {
        return SpringBeanUtils.getBean(UserSession.class);
    }
}