package hw.topevery.code.generate.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * 视图控制器
 *
 * @author whw
 * @date 21:33
 */
@Controller
public class PageController {
    @RequestMapping("/")
    private String index() {
        return "index";
    }
}
