package hw.topevery.basis.framework.enums;

import hw.topevery.framework.web.HttpResultCode;
import lombok.Getter;

@Getter
public enum JsonResultCodeEnum {

    CONCURRENCY_EXCEPTION(4001, "数据已经被修改，请获取最新后重新提交"),
    INSTALL_DEVICE_EXISTS(4002, "安装设备已经存在"),
    ;

    private int code;
    private String message;

    JsonResultCodeEnum(int code, String message) {
        this.code = code;
        this.message = message;
    }
}
