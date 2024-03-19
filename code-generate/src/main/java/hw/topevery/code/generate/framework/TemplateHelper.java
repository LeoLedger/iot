package hw.topevery.code.generate.framework;

import hw.topevery.code.generate.entity.bo.Template;
import hw.topevery.framework.Utility;

public class TemplateHelper {
    /**
     * 根据数据库名称获取对应的模板
     *
     * @param schemaName
     * @return
     */
    public static Template getTemplate(String schemaName) {
        Template res = new Template();
        {
            res.entityFieldString = Utility.getResourceText(String.format("templates\\%s\\java\\entity.field.template", schemaName));
            res.entityString = Utility.getResourceText(String.format("templates\\%s\\java\\entity.template", schemaName));

            res.daoString = Utility.getResourceText(String.format("templates\\%s\\java\\dao.template", schemaName));
            res.daoImplString = Utility.getResourceText(String.format("templates\\%s\\java\\daoImpl.template", schemaName));
            res.logicString = Utility.getResourceText(String.format("templates\\%s\\java\\logic.template", schemaName));
            res.controllerString = Utility.getResourceText(String.format("templates\\%s\\java\\controller.template", schemaName));

            res.fetchString = Utility.getResourceText(String.format("templates\\%s\\java\\fetch.template", schemaName));
            res.dtoFieldString = Utility.getResourceText(String.format("templates\\%s\\java\\dto.field.template", schemaName));
            res.createOrUpdateDtoString = Utility.getResourceText(String.format("templates\\%s\\java\\createOrUpdateDto.template", schemaName));
            res.detailDtoString = Utility.getResourceText(String.format("templates\\%s\\java\\detailDto.template", schemaName));
        }
        return res;
    }
}
