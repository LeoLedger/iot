package hw.topevery.basis.wapi.pmi.controller;

import hw.topevery.basis.entity.po.SysPrivilege;
import hw.topevery.basis.entity.po.SysUser;
import hw.topevery.basis.framework.base.BaseEntity;
import hw.topevery.basis.runtime.UserRuntime;
import hw.topevery.framework.SystemConst;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * @author Herux
 */
@Data
public class BaseController {

    protected SysUser getUser() {
        return UserRuntime.getSysUser();
    }

    protected boolean checkPrivilege(String privilegeId) {
        List<SysPrivilege> sysPrivilegeList = UserRuntime.getSysPrivilege();
        if (getUser().userIsAdmin == 1) {
            return true;
        }
        if (sysPrivilegeList != null) {
            for (SysPrivilege ite : sysPrivilegeList) {
                if (ite.privilegeId.equals(privilegeId)) {
                    return true;
                }
            }
        }
        return false;
    }

    protected String getUserId() {
        SysUser sysUser = getUser();
        if (sysUser != null) {
            return sysUser.userId;
        }
        return SystemConst.UUID_EMPTY_STRING;
    }

    protected String getUserName() {
        SysUser sysUser = getUser();
        if (sysUser != null) {
            return sysUser.userName;
        }
        return "";
    }

    protected void setInsertValue(BaseEntity val) {
        LocalDateTime dtNow = LocalDateTime.now();
        String userId = getUserId();

        val.createId = userId;
        val.createTime = dtNow;

        val.updateId = userId;
        val.updateTime = dtNow;

        val.dbStatus = false;
    }

    protected void setUpdateValue(BaseEntity val) {

        LocalDateTime dtNow = LocalDateTime.now();
        String userId = getUserId();

        val.updateId = userId;
        val.updateTime = dtNow;
    }
}
