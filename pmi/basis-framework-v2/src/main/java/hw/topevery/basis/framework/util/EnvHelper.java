package hw.topevery.basis.framework.util;

import hw.topevery.cloud.client.CfgRuntime;
import hw.topevery.cloud.library.configuration.ApplicationModule;

public class EnvHelper {
    public static boolean IsDebug() {
        ApplicationModule am = CfgRuntime.getCfgContextVal();
        return am != null ? am.getSettingBoolValue("isDebug", true) : true;
    }

    public static boolean enableJob() {
        ApplicationModule am = CfgRuntime.getCfgContextVal();
        return am != null ? am.getSettingBoolValue("enableJob", false) : false;
    }
}
