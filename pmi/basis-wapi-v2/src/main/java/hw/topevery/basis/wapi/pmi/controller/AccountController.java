package hw.topevery.basis.wapi.pmi.controller;

import cn.binarywang.wx.miniapp.api.WxMaService;
import cn.binarywang.wx.miniapp.bean.WxMaJscode2SessionResult;
import hw.topevery.basis.dal.logic.SysUserLogic;
import hw.topevery.basis.dal.util.UserUtil;
import hw.topevery.basis.entity.model.LoginParam;
import hw.topevery.basis.entity.model.UserInfoSimple;
import hw.topevery.basis.entity.po.SysUser;
import hw.topevery.basis.framework.UserSession;
import hw.topevery.basis.framework.util.EnvHelper;
import hw.topevery.basis.runtime.TokenData;
import hw.topevery.basis.runtime.UserRuntime;
import hw.topevery.basis.wapi.pmi.config.HWProperties;
import hw.topevery.basis.wapi.pmi.config.WxMaConfiguration;
import hw.topevery.framework.CacheExpireStrategyEnum;
import hw.topevery.framework.CacheRuntime;
import hw.topevery.framework.util.CaptchaUtil;
import hw.topevery.framework.web.JsonResult;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import me.chanjar.weixin.common.error.WxErrorException;
import org.apache.shiro.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

/**
 * @author eric.yang
 */
@Slf4j
@RestController
@RequestMapping("/")
public class AccountController extends BaseController {
    @Autowired
    private UserUtil userUtil;

    @Autowired
    private SysUserLogic userLogic;

    @Autowired
    private HWProperties hwProperties;

    /**
     * post表单提交，登录
     *
     * @return
     * @loginParam username
     */
    @PostMapping("/login")
    public JsonResult<TokenData> login(@RequestBody @Valid LoginParam loginParam) {
        JsonResult<TokenData> result = new JsonResult<>();
        try {
            // 检验验证码
            String captcha = (String) CacheRuntime.get(formatCaptchaCacheKey(loginParam.getUuid()));
            if (!Objects.equals(loginParam.getCaptcha(), captcha)) {
                throw new RuntimeException("验证码错误");
            }

            result.data = UserRuntime.login(userUtil, loginParam.getLoginName(), loginParam.getPassword());
            result.success();
        } catch (Exception e) {
            result.fail(e.getMessage());
            log.error(e.getMessage(), e);
        }
        return result;
    }

    /**
     * 微信登录
     * @param code
     * @return
     */
    @ApiOperation("微信登录")
    @PostMapping("/oauth/wx/login")
    public JsonResult<TokenData> WxLogin(String code) throws WxErrorException {
        final WxMaService wxService = WxMaConfiguration.getMaService();
        WxMaJscode2SessionResult session = wxService.getUserService().getSessionInfo(code);
        JsonResult<TokenData> result = new JsonResult<>();
        result.success(UserRuntime.wxLogin(userUtil, wxService, session.getOpenid()));
        return result;
    }

    @ApiOperation("绑定微信")
    @PostMapping("/account/bind-weixin")
    public JsonResult bindWeixin(String code) throws WxErrorException {
        final WxMaService wxService = WxMaConfiguration.getMaService();
        WxMaJscode2SessionResult session = wxService.getUserService().getSessionInfo(code);
        userLogic.bindWeixin(getUserId(), session.getOpenid());
        return JsonResult.ok();
    }

    @PostMapping("/logout")
    public String logout() throws Exception {
        UserRuntime.logout();
        return "退出成功!";
    }

    @ApiOperation("验证码图片")
    @GetMapping("/captcha")
    public JsonResult<Map<String, String>> captcha() {
        JsonResult<Map<String, String>> result = new JsonResult<>();
        try {
            String code = CaptchaUtil.generateCode();
            String key = UUID.randomUUID().toString();
            CacheRuntime.put(formatCaptchaCacheKey(key), code, 60 * 5, CacheExpireStrategyEnum.ByWriteDate, null);
            SecurityUtils.getSubject().getSession().setAttribute("captcha", code);
            Map<String, String> map = CaptchaUtil.generate(code);
            if (EnvHelper.IsDebug()) {
                map.put("code", code);
            }
            map.put("uuid", key);
            result.data = map;
            result.success();
        } catch (Exception e) {
            result.setCode(500);
            result.success = false;
            result.msg = e.getMessage();
            log.error(e.getMessage(), e);
        }
        return result;
    }


    @ApiOperation("用户信息")
    @GetMapping("/account/userinfo")
    public JsonResult<UserInfoSimple> getUserInfo(){
        SysUser user = this.getUser();
        UserInfoSimple dto = new UserInfoSimple(user);
        dto.setCostCenterId(UserSession.getInstance().getCostCenterId());
        return JsonResult.ok(dto);
    }

    // region helper

    private static String formatCaptchaCacheKey(String key) {
        return "captcha##" + key;
    }

    // endregion
}
