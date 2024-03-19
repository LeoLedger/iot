package hw.topevery.basis.framework.enums;

import lombok.Getter;

/**
 * 部门类型枚举
 *
 * @author whw
 * @date 2020/4/23 16:19
 */
@Getter
public enum DeptTypeEnum {
    /** 部门 */
    DEPT(15001, "部门"),

    /** 待定 */
    UNKNOWN(15002, "待定"),

    /** 企业 */
    COMPANY(15003, "企业"),

    /** 项目组 */
    TEAM(15004, "项目组"),

    /** 巡查组 */
    INSPECT_GROUP(15005, "巡查组");

    /** code */
    private final Integer code;

    /** 描述 */
    private final String typeName;

    public Integer getCode() {
        return code;
    }

    public String getTypeName() {
        return typeName;
    }

    DeptTypeEnum(int code, String describe) {
        this.code = code;
        this.typeName = describe;
    }
}
