//package hw.topevery.basis.runtime;
//
//import com.baomidou.mybatisplus.core.toolkit.ArrayUtils;
//import org.apache.commons.text.StringEscapeUtils;
//
//import javax.servlet.http.HttpServletRequest;
//import javax.servlet.http.HttpServletRequestWrapper;
//
///**
// * @author auto
// */
//public class XssHttpServletRequestWrapper extends HttpServletRequestWrapper {
//
//    public XssHttpServletRequestWrapper(HttpServletRequest request) {
//        super(request);
//    }
//
//    @Override
//    public String getQueryString() {
//        return StringEscapeUtils.escapeHtml4(super.getQueryString());
//    }
//
//    @Override
//    public String getParameter(String name) {
//        return StringEscapeUtils.escapeHtml4(super.getParameter(name));
//    }
//
//    @Override
//    public String[] getParameterValues(String name) {
//        String[] values = super.getParameterValues(name);
//        if (ArrayUtils.isEmpty(values)) {
//            return values;
//        }
//        int length = values.length;
//        String[] escapeValues = new String[length];
//        for (int i = 0; i < length; i++) {
//            escapeValues[i] = StringEscapeUtils.escapeHtml4(values[i]);
//        }
//        return escapeValues;
//    }
//
//}
