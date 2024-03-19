package hw.topevery.basis.dal.util;

import hw.topevery.basis.dal.logic.SysDeptLogic;
import hw.topevery.basis.dal.logic.SysPrivilegeLogic;
import hw.topevery.basis.dal.logic.SysRoleLogic;
import hw.topevery.basis.dal.logic.SysUserLogic;
import hw.topevery.basis.entity.dto.SysUserDto;
import hw.topevery.basis.entity.fetch.UserFetch;
import hw.topevery.basis.entity.po.SysDept;
import hw.topevery.basis.entity.po.SysPrivilege;
import hw.topevery.basis.entity.po.SysRole;
import hw.topevery.basis.entity.po.SysUser;
import hw.topevery.framework.db.entity.DataPager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class UserUtil {

    @Autowired
    public SysUserLogic sysUserLogic;
    @Autowired
    public SysPrivilegeLogic sysPrivilegeLogic;

    @Autowired
    public SysDeptLogic sysDeptLogic;

    @Autowired
    public SysRoleLogic sysRoleLogic;

    public DataPager<SysUserDto> getUserList(UserFetch userFetch) {
        return sysUserLogic.getUserList(userFetch);
    }

    public SysUser login(String loginName, String loginPassword) {
        return sysUserLogic.login(loginName, loginPassword);
    }

    public List<SysPrivilege> getListPrivilege(String userId) {
        return sysPrivilegeLogic.getListPrivilege(userId);
    }

    public List<SysRole> getListRole(String userId) {
        return sysRoleLogic.getListbyUserId(userId);
    }

    public SysDept getSysDept(String deptId) {
        return sysDeptLogic.getEntityByDataId(deptId);
    }

    public SysUser getSysUserByLoginName(String loginName) {
        return sysUserLogic.getEntityByLoginName(loginName);
    }

    public SysUser getByGuid(String guid) {
        return sysUserLogic.getEntityByDataId(guid);
    }

    /**
     * 更新用户信息
     *
     * @param sysUser
     * @return
     */
    public Boolean updateUser(SysUser sysUser) {
        return sysUserLogic.update(sysUser);
    }


    /**
     * 新曾用户信息
     *
     * @param sysUser
     * @return
     */
    public Boolean addUser(SysUser sysUser) {
        return sysUserLogic.save(sysUser);
    }

    /**
     * 根据角色获取用户信息
     *
     * @param userFetch 查询
     * @return 返回列表
     */
    public DataPager<SysUserDto> getUserListByRoleId(UserFetch userFetch) {
        return sysUserLogic.getUserListByRoleId(userFetch);
    }
}