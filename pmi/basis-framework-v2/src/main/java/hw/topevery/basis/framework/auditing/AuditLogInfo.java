package hw.topevery.basis.framework.auditing;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * 审计信息的载体
 */
@Getter
@Setter
public class AuditLogInfo {

    private String userId;
    private String userName;

    // todo 客户端ip 端口 浏览器 user-agent、访问路径 控制器 action、请求耗时 等等，都可以记录

    private List<EntityChangeInfo> entityChanges;

    public AuditLogInfo(){
        entityChanges = new ArrayList<>();
    }
}
