package hw.topevery.code.generate.entity.bo;

import lombok.Data;

/**
 * GenerateCondition
 *
 * @Summary
 * @Author zhk
 * @Date 2021/4/15 20:51
 */
@Data
public class GenerateCondition {
    private String connectionKey;
    private String tables;
    private boolean skipGenerateEntity;
    private boolean skipGenerateDao;
    private boolean skipGenerateLogic;
    private boolean skipGenerateDto;
}
