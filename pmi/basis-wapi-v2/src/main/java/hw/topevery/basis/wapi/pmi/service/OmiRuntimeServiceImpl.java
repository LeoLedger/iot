package hw.topevery.basis.wapi.pmi.service;

import hw.topevery.framework.omi.RsDownloadResult;
import hw.topevery.framework.omi.RsHeader;
import hw.topevery.framework.omi.RsPara;
import hw.topevery.framework.omi.RuntimeService;
import org.springframework.web.multipart.MultipartFile;

public class OmiRuntimeServiceImpl implements RuntimeService {

    public static final RuntimeService value = new OmiRuntimeServiceImpl();

    public boolean checkHeader(RsHeader val) {
        return val != null && RsHeader.chkVal.uid.equals(val.uid) && RsHeader.chkVal.pwd.equals(val.pwd);
    }


    @Override
    public String executeCore(RsPara para) throws Exception {
        String result = null;
        switch (para.actTypeVal) {
            default:
                break;
        }
        return result;
    }

    @Override
    public String executeCoreUpload(RsPara para, MultipartFile part) throws Exception {
        return null;
    }

    @Override
    public RsDownloadResult executeCoreDownload(RsPara para) throws Exception {
        return null;
    }
}
