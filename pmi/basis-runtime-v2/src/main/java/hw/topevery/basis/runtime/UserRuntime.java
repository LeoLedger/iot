package hw.topevery.basis.runtime;


import cn.binarywang.wx.miniapp.api.WxMaService;
import cn.binarywang.wx.miniapp.bean.WxMaJscode2SessionResult;
import hw.topevery.basis.dal.util.UserUtil;
import hw.topevery.basis.entity.dto.SysUserDto;
import hw.topevery.basis.entity.fetch.UserFetch;
import hw.topevery.basis.entity.po.*;
import hw.topevery.basis.framework.ShiroPrivilege;
import hw.topevery.basis.framework.jwt.JwtToken;
import hw.topevery.basis.framework.jwt.JwtUtil;
import hw.topevery.basis.runtime.jwt.JwtRuntimeToken;
import hw.topevery.framework.CacheExpireStrategyEnum;
import hw.topevery.framework.CacheRuntime;
import hw.topevery.framework.db.entity.DataPager;
import hw.topevery.framework.exception.TokenException;
import hw.topevery.framework.web.HttpResultCode;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.subject.Subject;
import org.springframework.util.Assert;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * @author bingxin.xu
 */
public class UserRuntime implements Serializable {
    private SysUser userVal;
    private SysDept deptVal;
    private List<SysRole> listRole;
    private List<SysPrivilege> listPrivilege;
    private List<SysMenu> listMenu;
    private List<SysDept> listDept;
    private List<String> listPrivilegeIds;
    private JwtToken jwtToken;

    private static String getCacheKey(String token) {
        return String.format("CACHE_USER_RUNTIME_%s", token);
    }

    public static UserRuntime getCacheData(String token) {
        String key = getCacheKey(token);
        return (UserRuntime) CacheRuntime.get(key);
    }

    private static void setCacheData(String token, UserRuntime val, long expireSecond) {
        String key = getCacheKey(token);
        CacheRuntime.put(key, val, expireSecond, CacheExpireStrategyEnum.ByAccessDate, () -> {
            System.out.println(String.format("清理登录用户='%s'缓存", token));
        });
    }

    private static void clearCacheData(String token) {
        String key = getCacheKey(token);
        CacheRuntime.removeCache(key);
    }


    public UserRuntime(SysUser userVal) {
        this.userVal = userVal;
        this.deptVal = null;
    }

    public static TokenData login(UserUtil sysUserLogic, String loginName, String loginPassword) {
        SysUser sysUser = sysUserLogic.getSysUserByLoginName(loginName);
        Assert.notNull(sysUser, HttpResultCode.WRONG_USERNAME_OR_PASSWORD.getMsg());
        if(BooleanUtils.isNotTrue(sysUser.enable)){
            throw new RuntimeException("账号已被禁用");
        }
        // 系统中的密码
        String sysUserPassword = sysUser.loginPassword;
        if (!loginPassword.equals(sysUserPassword)) {
            throw new TokenException(HttpResultCode.WRONG_USERNAME_OR_PASSWORD);
        }
        String token = JwtUtil.buildTokenString(loginName, sysUser.userId);
        JwtToken jwtToken = JwtUtil.buildToken(token);
        return login(sysUser, jwtToken);
    }

    public static TokenData wxLogin(UserUtil userUtil, WxMaService wxService, String openId){
        SysUser sysUser = userUtil.sysUserLogic.getUserByOpenId(openId);
        Assert.notNull(sysUser, "此微信用户未绑定账号");
        if(BooleanUtils.isNotTrue(sysUser.enable)){
            throw new RuntimeException("账号已被禁用");
        }
        String token = JwtUtil.buildTokenString(sysUser.loginName);
        JwtToken jwtToken = JwtUtil.buildToken(token);
        return login(sysUser, jwtToken);
    }

    /**
     * 解析文件
     *
     * @param inputStream
     * @return
     * @throws IOException
     */
    public static String readRsa(InputStream inputStream) throws IOException {
        String key;
        // 以文件流的形式逐行读取txt文件(文件存储编码需要utf-8格式，不然会乱码)
        InputStreamReader in = new InputStreamReader(inputStream, StandardCharsets.UTF_8);
        BufferedReader br = new BufferedReader(in);
        while ((key = br.readLine()) != null) {
            return key;
        }
        return null;
    }


    public static TokenData login(SysUser user, JwtToken jwtToken) {
        TokenData res = new TokenData();
        JwtRuntimeToken runtimeToken = new JwtRuntimeToken();
        runtimeToken.copy(jwtToken);
        UserRuntime userRuntime = new UserRuntime(user);
        {
            userRuntime.jwtToken = jwtToken;
            setCacheData(jwtToken.getToken(), userRuntime, jwtToken.getExpireSecond());
        }
        runtimeToken.setUserRuntime(userRuntime);
        // 从SecurityUtils里边创建一个 subject
        Subject subject = SecurityUtils.getSubject();
        // 执行认证登陆
        subject.login(runtimeToken);
        res.setAccess_token(jwtToken.getToken());
        res.setExpires_in(jwtToken.getExpireSecond());
        res.setRefresh_token(jwtToken.getRefresh_token());
        res.setToken_type("jwt");
        return res;
    }


    public static void logout() throws Exception {
        Subject subject = SecurityUtils.getSubject();
        JwtToken jwtToken = (JwtToken) subject.getPrincipal();
        if (jwtToken != null) {
            clearCacheData(jwtToken.getToken());
        }
        subject.logout();
    }

    public static UserRuntime getValue() {
        Subject subject = SecurityUtils.getSubject();
        JwtToken jwtToken = (JwtToken) subject.getPrincipal();
        UserRuntime res = null;
        if (jwtToken != null) {
            res = getCacheData(jwtToken.getToken());
        }
        return res;
    }

    public static SysUser getSysUser() {
        UserRuntime result = getValue();
        if (result != null) {
            return result.getUserVal();
        }
        return null;
    }

    public static SysDept getSysDept() {
        UserRuntime result = getValue();
        if (result != null) {
            return result.getDeptVal();
        }
        return null;
    }

    public static List<SysPrivilege> getSysPrivilege() {
        UserRuntime result = getValue();
        if (result != null) {
            return result.getListPrivilege();
        }
        return null;
    }

    public boolean checkPrivilege(String val) {
        return true;
    }

    public SysUser getUserVal() {
        return userVal;
    }

    public SysDept getDeptVal() {
        if (deptVal == null && userVal != null) {
            deptVal = StaticFactory.userUtil.getSysDept(userVal.deptId);
        }
        return deptVal;
    }

    public List<SysRole> getListRole() {
        if (listRole == null && userVal != null) {
            listRole = StaticFactory.userUtil.getListRole(userVal.userId);
        }
        return listRole;
    }

    public static List<SysRole> getRoles() {
        UserRuntime result = getValue();
        if (result != null) {
            return result.getListRole();
        }
        return null;
    }

    public List<SysPrivilege> getListPrivilege() {
        if (listPrivilege == null && userVal != null) {
            listPrivilege = StaticFactory.userUtil.getListPrivilege(userVal.userId);
        }
        return listPrivilege;
    }

    /**
     * 获取用户拥有的权限枚举
     *
     * @return
     */
    public List<ShiroPrivilege> getListPrivilegeEnum() {
        List<ShiroPrivilege> result = new ArrayList<>();
        {
            List<SysPrivilege> privileges = getListPrivilege();
            if (privileges != null) {
                for (SysPrivilege i : privileges) {
                    result.add(new ShiroPrivilege(i.privilegeId, i.code, i.name));
                }
            }
        }
        return result;
    }

    /**
     * 根据角色获取用户信息
     *
     * @param userFetch 查询
     * @return 返回列表
     */
    public static DataPager<SysUserDto> getUserListByRoleId(UserFetch userFetch) {
        return StaticFactory.userUtil.getUserListByRoleId(userFetch);
    }

    public static SysUser getByGuid(String guid) {
        return StaticFactory.userUtil.getByGuid(guid);
    }

    public static SysUser getByLoginName(String loginName) {
        return StaticFactory.userUtil.getSysUserByLoginName(loginName);
    }

    public static boolean updateUser(SysUser sysUser) {
        return StaticFactory.userUtil.updateUser(sysUser);
    }
//
//    public List<SysDept> getListDept() {
//        if (listDept == null && userVal != null) {
//            listDept = sysUserLogic.getListDept(userVal.getUserId());
//        }
//        return listDept;
//    }
//
//    public List<SysMenu> getListMenu() {
//        if (listMenu == null && userVal != null) {
//            listMenu = sysUserLogic.getListMenu(userVal.getUserId());
//        }
//        return listMenu;
//    }
}
