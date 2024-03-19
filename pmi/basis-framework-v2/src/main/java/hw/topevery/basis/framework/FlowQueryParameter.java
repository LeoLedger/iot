package hw.topevery.basis.framework;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.Date;
import java.util.List;

/**
 * 流程基础查询参数
 *
 * @author zzk
 * @date 2021/9/7
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class FlowQueryParameter extends QueryParameter {

    private String code;

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private List<Date> applyDate;

    private Boolean canHandle;

    private Integer approvalStatus;

    private String applyUserName;

}
