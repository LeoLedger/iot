package hw.topevery.basis.runtime;

import org.apache.shiro.web.filter.AccessControlFilter;

import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

public class EoPermissionFilter extends AccessControlFilter {
    @Override
    protected boolean isAccessAllowed(ServletRequest servletRequest, ServletResponse servletResponse, Object o) throws Exception {
        HttpServletRequest httpServletRequest = (HttpServletRequest)servletRequest;
        String requestURI = httpServletRequest.getRequestURI();
        if(requestURI.contains("/purchase-supplier")) {
            return true;
        }
        return super.preHandle(servletRequest, servletResponse);
    }

    @Override
    protected boolean onAccessDenied(ServletRequest servletRequest, ServletResponse servletResponse) throws Exception {
        return false;
    }
}
