package hw.topevery.basis.framework;

import lombok.Data;
import org.apache.shiro.authz.Permission;

/**
 * 系统权限
 *
 * @author yang.yang
 */
@Data
public class ShiroPrivilege implements Permission {
    /**
     * 权限Id
     */
    private String permissionId;
    /**
     * 权限Code
     */
    private String code;
    /**
     * 权限名称
     */
    private String name;

    public ShiroPrivilege(String permissionId, String code, String name) {
        setCode(code);
        setName(name);
        setPermissionId(permissionId);
    }


    @Override
    public boolean implies(Permission permission) {
        return false;
    }
}
