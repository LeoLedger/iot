package hw.topevery.basis.framework.auditing;

import cn.hutool.core.util.ReflectUtil;
import com.alibaba.fastjson.JSON;
import lombok.Data;
import org.apache.commons.collections.CollectionUtils;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Data
public class EntityChangeInfo {

    private Object entity;
    private String entityId;
    private String entityTypeFullName;
    private EntityChangeType changeType;
    private LocalDateTime changedTime;

    private List<EntityPropertyChangeInfo> propertyChanges;

    public EntityChangeInfo() {
        propertyChanges = new ArrayList<>();
    }

    public void changeField(String fieldName, Object newVal) {
        for (EntityPropertyChangeInfo propertyChange : propertyChanges) {
            if (propertyChange.getPropertyName().equals(fieldName)) {
                propertyChange.setNewValue(newVal);
                return;
            }
        }
    }

    public boolean hasBeenChanged(){

        if(CollectionUtils.isNotEmpty(propertyChanges)){
            return propertyChanges.stream().anyMatch(x -> x.isHasBeenChanged());
        }

        return false;
    }

    public boolean hasBeenChanged(String[] ignorePropertyList){

        if(CollectionUtils.isNotEmpty(propertyChanges)){
            return propertyChanges.stream().anyMatch(x -> Arrays.stream(ignorePropertyList).allMatch(y -> !y.equals(x.getPropertyName())) && x.isHasBeenChanged());
        }

        return false;
    }

    public enum EntityChangeType {
        CREATE,
        UPDATE,
        DELETE
    }
}
