package hw.topevery.basis.wapi.pmi.controller;

import hw.topevery.basis.wapi.pmi.service.OmiRuntimeServiceImpl;
import hw.topevery.framework.omi.BaseRsController;
import hw.topevery.framework.omi.RuntimeService;

public class RsController extends BaseRsController {

    @Override
    protected RuntimeService getInst() {
        return OmiRuntimeServiceImpl.value;
    }
}
