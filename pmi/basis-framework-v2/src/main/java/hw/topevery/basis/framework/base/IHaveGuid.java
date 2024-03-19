package hw.topevery.basis.framework.base;

import hw.topevery.framework.annotation.DbTableField;
import hw.topevery.framework.enums.DbTypeEnum;

/**
 * 用于标记是否有 guidId 字段，dao 在 insert 前会自动赋值。
 */
public interface IHaveGuid {
    String getGuidId();
    void setGuidId(String guidId);
}
