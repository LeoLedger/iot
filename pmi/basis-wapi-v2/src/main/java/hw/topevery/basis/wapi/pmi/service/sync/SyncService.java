//package hw.topevery.basis.wapi.pmi.service.sync;
//
//import cn.hutool.http.HttpUtil;
//import cn.hutool.json.JSONUtil;
//import cn.hutool.jwt.JWT;
//import cn.hutool.jwt.JWTUtil;
//import com.topevery.sdk.common.properties.RunBaseProperties;
//import com.topevery.sdk.common.util.RsaUtil;
//import com.topevery.sdk.sync.enums.OpenDataStateEnum;
//import com.topevery.sdk.sync.query.BaseQuery;
//import com.topevery.sdk.sync.service.ISyncDataHandle;
//import com.topevery.sdk.sync.vo.*;
//import com.topevery.sdk.sync.web.DataPager;
//import hw.topevery.basis.dal.dao.SysSyncDao;
//import hw.topevery.basis.dal.logic.SysUserLogic;
//import hw.topevery.basis.entity.dto.DeptDto;
//import hw.topevery.basis.entity.dto.MenuGrant.MenuDto;
//import hw.topevery.basis.entity.dto.SysUserDto;
//import hw.topevery.basis.entity.fetch.UserFetch;
//import hw.topevery.basis.entity.po.SysRole;
//import hw.topevery.basis.entity.po.SysUser;
//import hw.topevery.basis.entity.po.SysUserInDept;
//import hw.topevery.basis.entity.po.SysUserInRole;
//import hw.topevery.basis.framework.jwt.JwtToken;
//import hw.topevery.basis.framework.jwt.JwtUtil;
//import hw.topevery.basis.runtime.TokenData;
//import hw.topevery.basis.runtime.UserRuntime;
//import hw.topevery.framework.DataFillHelper;
//import hw.topevery.framework.util.LogUtil;
//import org.apache.commons.lang3.BooleanUtils;
//import org.apache.commons.lang3.StringUtils;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Component;
//
//import java.util.ArrayList;
//import java.util.LinkedHashMap;
//import java.util.List;
//import java.util.Map;
//import java.util.stream.Collectors;
//
///**
// * @description: 同步到统一门户
// * @author: 张宗正
// * @since: 2023/10/17 10:37
// **/
//@Component
//public class SyncService implements ISyncDataHandle {
//
//    @Autowired
//    private SysUserLogic sysUserLogic;
//
//    @Autowired
//    private SysSyncDao sysSyncDao;
//
//
//
//    @Override
//    public DataPager<OpenUserVO> getUsers(BaseQuery query, RunBaseProperties properties) {
//        UserFetch userFetch = new UserFetch();
//        userFetch.setPageSize(query.getPageSize());
//        userFetch.setPageIndex(query.getPageIndex());
//        hw.topevery.framework.db.entity.DataPager<SysUserDto> userList = sysUserLogic.getUserList(userFetch);
//        List<OpenUserVO> records = userList.records.stream().map(item -> {
//            OpenUserVO openUserVO = new OpenUserVO();
//            openUserVO.setUserId(item.userId);
//            openUserVO.setUserName(item.userName);
//            openUserVO.setLoginName(item.loginName);
//            openUserVO.setDeptId(item.deptId);
//            openUserVO.setDeptName(item.getDeptName());
//            openUserVO.setMobile(item.userMobile);
//            openUserVO.setEmail(item.userEmail);
//            openUserVO.setSystemCode(properties.getSystemCode().get(0));
//            return openUserVO;
//        }).collect(Collectors.toList());
//        DataPager<OpenUserVO> openUser = new DataPager<>();
//        openUser.setRecords(records);
//        openUser.setTotal(records.size());
//
//        return openUser;
//    }
//
//
//    @Override
//    public DataPager<OpenDeptVO> getDepts(BaseQuery query, RunBaseProperties properties) {
//        hw.topevery.framework.db.entity.DataPager<DeptDto> deptPage = sysSyncDao.getDepts(query.getPageIndex(), query.getPageSize());
//        DataPager<OpenDeptVO> dataPager = new DataPager<>();
//        dataPager.setTotal(deptPage.records.size());
//        List<OpenDeptVO> deptList = new ArrayList<>();
//        deptPage.records.forEach(item -> {
//            OpenDeptVO deptVO = new OpenDeptVO();
//            deptVO.setDeptId(item.deptId);
//            deptVO.setDeptCode(item.deptCode);
//            deptVO.setDeptName(item.deptName);
//            deptVO.setDeptPid(item.deptPid);
//            // TODO:这里后面再处理
//            // deptVO.setDeptPname();
//            deptVO.setSystemCode(properties.getSystemCode().get(0));
//            deptVO.setOrderNum(item.orderNum);
//
//            deptVO.setState(OpenDataStateEnum.getByState(BooleanUtils.toInteger(item.dbStatus)).getName());
//
//            deptList.add(deptVO);
//        });
//        dataPager.setRecords(deptList);
//
//        return dataPager;
//    }
//
//    @Override
//    public DataPager<OpenMenuVO> getMenus(BaseQuery query, RunBaseProperties properties) {
//        hw.topevery.framework.db.entity.DataPager<MenuDto> sysMenuDataPager = sysSyncDao.getMenus(query.getPageIndex(), query.getPageSize());
//        // 只同步业务系统的菜单
//        List<OpenMenuVO> records = sysMenuDataPager.records.stream()
//                .filter(item -> "409d1a3c-2068-459c-9f9d-8e591d12d6dc".equals(item.getAppId()))
//                .map(item -> {
//            OpenMenuVO openMenuVO = new OpenMenuVO();
//            openMenuVO.setMenuId(item.getMenuId());
//            openMenuVO.setMenuName(item.getMenuName());
//            openMenuVO.setMenuPid(item.getMenuPid());
//            openMenuVO.setLinkUrl(item.getLinkUrl());
//            openMenuVO.setSystemCode(properties.getSystemCode().get(0));
//            return openMenuVO;
//        }).collect(Collectors.toList());
//        DataPager<OpenMenuVO> openMenu = new DataPager<>();
//        openMenu.setRecords(records);
//        openMenu.setTotal(records.size());
//
//        return openMenu;
//    }
//
//    @Override
//    public DataPager<OpenRoleVO> getRoles(BaseQuery query, RunBaseProperties properties) {
//        hw.topevery.framework.db.entity.DataPager<SysRole> sysRoleDataPager = sysSyncDao.getRole(query.getPageIndex(), query.getPageSize());
//        List<OpenRoleVO> records = sysRoleDataPager.records.stream().map(item -> {
//            OpenRoleVO openRoleVO = new OpenRoleVO();
//            openRoleVO.setRoleId(item.roleId);
//            openRoleVO.setRoleCode(item.roleCode);
//            openRoleVO.setRoleName(item.roleName);
//            openRoleVO.setDeptId(item.deptId);
//            openRoleVO.setSystemCode(properties.getSystemCode().get(0));
//            return openRoleVO;
//        }).collect(Collectors.toList());
//        DataPager<OpenRoleVO> openRole = new DataPager<>();
//        openRole.setRecords(records);
//        openRole.setTotal(records.size());
//
//        return openRole;
//    }
//
//    @Override
//    public DataPager<OpenUserInDeptVO> getUserInDepts(BaseQuery query, RunBaseProperties properties) {
//        hw.topevery.framework.db.entity.DataPager<SysUserInDept> sysUserInDeptDataPager = sysSyncDao.getUserInDept(query.getPageIndex(), query.getPageSize());
//        List<OpenUserInDeptVO> records = sysUserInDeptDataPager.records.stream().map(item -> {
//            OpenUserInDeptVO openUserInDeptVO = new OpenUserInDeptVO();
//            openUserInDeptVO.setDeptId(item.deptId);
//            openUserInDeptVO.setUserId(item.userId);
//            openUserInDeptVO.setSystemCode(properties.getSystemCode().get(0));
//            return openUserInDeptVO;
//        }).collect(Collectors.toList());
//        DataPager<OpenUserInDeptVO> openUser = new DataPager<>();
//        openUser.setRecords(records);
//        openUser.setTotal(records.size());
//
//        return openUser;
//    }
//
//    @Override
//    public DataPager<OpenUserInRoleVO> getUserInRoles(BaseQuery query, RunBaseProperties properties) {
//        hw.topevery.framework.db.entity.DataPager<SysUserInRole> sysUserInRoleDataPager = sysSyncDao.getUserInRole(query.getPageIndex(), query.getPageSize());
//        List<OpenUserInRoleVO> records = sysUserInRoleDataPager.records.stream().map(item -> {
//            OpenUserInRoleVO openUserInRoleVO = new OpenUserInRoleVO();
//            openUserInRoleVO.setUserId(item.userId);
//            openUserInRoleVO.setRoleId(item.roleId);
//            openUserInRoleVO.setSystemCode(properties.getSystemCode().get(0));
//            return openUserInRoleVO;
//        }).collect(Collectors.toList());
//        DataPager<OpenUserInRoleVO> openUser = new DataPager<>();
//        openUser.setRecords(records);
//        openUser.setTotal(records.size());
//
//        return openUser;
//    }
//
//    @Override
//    public DataPager<OpenUserInMenuVO> getUserInMenus(BaseQuery query, RunBaseProperties properties) {
//        return null;
//    }
//
//    @Override
//    public DataPager<OpenMenuInRoleVO> getMenuInRoles(BaseQuery query, RunBaseProperties properties) {
//        return null;
//    }
//
//    @Override
//    public OpenTokenVO loginByToken(String token, RunBaseProperties properties) {
//        // 这里需要用公钥进行解密
//        try {
//            String openToken = RsaUtil.decryptByPublicKey(token, properties.getRsaPublicKey());
//            JWT jwt = JWTUtil.parseToken(openToken);
//            String loginName = (String) jwt.getPayload("p_login_name");
//            if (StringUtils.isNotEmpty(loginName)) {
//                SysUser sysUser = sysUserLogic.getEntityByLoginName(loginName);
//                String newToken = JwtUtil.buildTokenString(loginName);
//                JwtToken jwtToken = JwtUtil.buildToken(newToken);
//                TokenData login = UserRuntime.login(sysUser, jwtToken);
//
//                OpenTokenVO openTokenVO = new OpenTokenVO();
//                DataFillHelper.readToTarget(login, openTokenVO);
//                openTokenVO.setExpires_in(login.getExpires_in().intValue());
//
//                return openTokenVO;
//            } else {
//                throw new RuntimeException("token静默登录失败!");
//            }
//        } catch (Exception ex) {
//            LogUtil.error(String.format("token解析失败！,token:【%s】,配置信息：【%s】", token, JSONUtil.toJsonStr(properties)));
//            throw new RuntimeException(ex);
//        }
//    }
//}
