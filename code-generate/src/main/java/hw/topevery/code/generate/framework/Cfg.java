package hw.topevery.code.generate.framework;

import hw.topevery.cloud.client.CfgRuntime;
import hw.topevery.cloud.library.configuration.ConnectionSetting;

import java.util.List;

/**
 * 配置类
 *
 * @author bingxin.xu
 */
public class Cfg {
    /**
     * 获取 生成路径
     *
     * @return
     */
    public static String getGeneratePath() {
        return CfgRuntime.getCfgContextVal().getSettingValue("part", "C:\\auto_code");
    }

    public static String getPackageName(String connectionKey) {
        String key = String.format("package-%s", connectionKey);
        return CfgRuntime.getCfgContextVal().getSettingValue(key, "hw.topevery.business");
    }

    public static List<ConnectionSetting> getConnectionSettings() {
        return CfgRuntime.getCfgContextVal().connectionCollection;
    }
}
