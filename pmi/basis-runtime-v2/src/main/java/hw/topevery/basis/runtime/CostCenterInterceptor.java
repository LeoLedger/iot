package hw.topevery.basis.runtime;

import hw.topevery.basis.dal.dao.SysUserDao;
import hw.topevery.basis.entity.po.SysUser;
import hw.topevery.basis.framework.UserSession;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * @description:
 * @author: Chris
 * @since: 2021年09月06日 11:19
 **/

public class CostCenterInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        UserSession userSession = UserSession.getInstance();
        if ("OPTIONS".equals(request.getMethod()) || "GET".equals(request.getMethod())) {
            return true;
        }

        if (StringUtils.isBlank(userSession.getCostCenterId())) {
            throw new RuntimeException("该用户没有权限执行该操作");
        }

        return true;
    }

}
