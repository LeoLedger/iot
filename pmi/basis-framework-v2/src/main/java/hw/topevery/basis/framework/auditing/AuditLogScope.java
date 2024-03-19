package hw.topevery.basis.framework.auditing;

import cn.hutool.Hutool;
import cn.hutool.core.util.ReflectUtil;
import com.alibaba.fastjson.JSON;
import hw.topevery.basis.framework.base.BaseEntity;
import lombok.Getter;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;

@Getter
public class AuditLogScope {
    private AuditLogInfo log;

    public AuditLogScope(AuditLogInfo log) {
        this.log = log;
    }

    public EntityChangeInfo createEntityChangeInfo(Object entity) {
        EntityChangeInfo changeInfo = new EntityChangeInfo();
        changeInfo.setEntity(entity);
        changeInfo.setEntityId(getEntityId(entity));
        changeInfo.setEntityTypeFullName(entity.getClass().getName());
        changeInfo.setPropertyChanges(getPropertyChanges(entity));
        this.log.getEntityChanges().add(changeInfo);
        return changeInfo;
    }

    private List<EntityPropertyChangeInfo> getPropertyChanges(Object entity) {
        Field[] fields = ReflectUtil.getFields(entity.getClass());

        List<EntityPropertyChangeInfo> changeInfos = new ArrayList<>();
        for (Field field : fields) {
            EntityPropertyChangeInfo item = new EntityPropertyChangeInfo();
            item.setPropertyName(field.getName());
            item.setPropertyTypeFullName(field.getType().getName());
            item.setOriginalValue(ReflectUtil.getFieldValue(entity, field));
            changeInfos.add(item);
        }

        return changeInfos;
    }

    private String getEntityId(Object entity) {
        if (entity instanceof BaseEntity) {
            BaseEntity baseEntity = (BaseEntity) entity;
            return baseEntity.id.toString();
        }

        return null;
    }
}
