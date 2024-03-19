package hw.topevery.basis.framework.auditing;

import lombok.Data;

@Data
public class EntityPropertyChangeInfo {
    private Object newValue;
    private Object originalValue;
    private String propertyName;
    private String propertyTypeFullName;
    private boolean hasBeenChanged; // 属性值是否修改过。

    public void setNewValue(Object val) {
        this.hasBeenChanged = true;
        this.newValue = val;
    }
}
