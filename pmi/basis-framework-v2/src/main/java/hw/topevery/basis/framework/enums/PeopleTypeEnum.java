package hw.topevery.basis.framework.enums;

import lombok.Getter;

/**
 * @description: 联系人类型枚举
 * @author: Chris
 * @since: 2021年04月08日 20:46
 **/
@Getter
public enum PeopleTypeEnum {

    /*** 客户*/
    CUSTOM(0, "客户"),

    /*** 供应商*/
    SUPPLIER(1, "供应商"),
    ;

    private Integer type;

    private String typeName;

    PeopleTypeEnum(Integer type, String typeName) {
        this.type = type;
        this.typeName = typeName;
    }

}
