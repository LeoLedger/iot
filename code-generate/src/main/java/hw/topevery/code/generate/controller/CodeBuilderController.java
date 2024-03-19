package hw.topevery.code.generate.controller;

import hw.topevery.cloud.library.configuration.ConnectionSetting;
import hw.topevery.code.generate.dal.logic.DbLogic;
import hw.topevery.code.generate.entity.po.Table;
import hw.topevery.code.generate.framework.Cfg;
import hw.topevery.framework.Utility;
import hw.topevery.framework.db.DbExecute;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 入口控制器
 *
 * @author bingxin.xu
 */
@RestController
@RequestMapping("/ctl/cb")
public class CodeBuilderController {
    @Autowired
    DbLogic dbLogic;

    /**
     * 执行
     *
     * @param connectionKey 连接键
     */
    @GetMapping("/run")
    public String run(@RequestParam(value = "connectionKey") String connectionKey, @RequestParam(value = "tables") String tableNames, @RequestParam(value = "author") String author) {
        DbExecute db = DbExecute.getInstance(connectionKey);
        List<String> tableNameList = new ArrayList<>();
        if (!Utility.stringIsBlank(tableNames)) {
            String[] tableNameSplit = StringUtils.split(tableNames,",");
            for (String i : tableNameSplit) {
                if (!Utility.stringIsBlank(i)) {
                    tableNameList.add(i);
                }
            }
        }
        return dbLogic.codeBuild(db, tableNameList, author);
    }

    /**
     * 目标文件夹：：代码将生成到该文件夹下面
     *
     * @return
     */
    @GetMapping("/codePath")
    public String getCfgPath() {
        return Cfg.getGeneratePath();
    }

    /**
     * 获取连接集合
     *
     * @return
     */
    @GetMapping("/connections")
    public List<ConnectionSetting> getConnectionSettings() {
        return Cfg.getConnectionSettings();
    }

    /**
     * @param connectionKey 连接键
     * @return
     */
    @GetMapping(value = "/tables")
    public List<Table> getTables(@RequestParam(value = "connectionKey") String connectionKey) {
        DbExecute db = DbExecute.getInstance(connectionKey);
        return dbLogic.getTables(db);
    }

    @RequestMapping(method = {RequestMethod.GET}, produces = {"text/html;charset=utf-8"})
    public String getHtml() {
        return Utility.getResourceText("page\\cb.html");
    }
}
