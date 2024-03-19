package hw.topevery.basis.wapi.pmi.handler;

import hw.topevery.basis.framework.base.concurrency.ConcurrencyException;
import hw.topevery.basis.framework.enums.JsonResultCodeEnum;
import hw.topevery.framework.exception.TokenException;
import hw.topevery.framework.web.HttpResultCode;
import hw.topevery.framework.web.JsonResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.BindException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import javax.validation.ConstraintViolationException;

/**
 * 全局异常处理类
 *
 * @author whw
 * @date 2020/4/1 9:27
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    /**
     * 全局异常处理
     *
     * @param e
     * @return
     */
    @ExceptionHandler(Exception.class)
    @ResponseBody
    public JsonResult<String> exceptionHandler(Exception e) {
        log.error(e.getMessage(), e);
        return JsonResult.error(e.getMessage());
    }

    @ExceptionHandler(ConcurrencyException.class)
    @ResponseBody
    public JsonResult<String> concurrencyExceptionHandler(ConcurrencyException e) {
        log.error(e.getMessage(), e);
        return JsonResult.error(JsonResultCodeEnum.CONCURRENCY_EXCEPTION.getMessage(),
                JsonResultCodeEnum.CONCURRENCY_EXCEPTION.getCode());
    }

    /**
     * 会话过期异常处理
     *
     * @param e
     * @return
     */
    @ExceptionHandler(TokenException.class)
    @ResponseBody
    public JsonResult<String> exceptionHandler(TokenException e) {
        log.error(e.getMessage(), e);
        return JsonResult.error(e.getMessage(), e.getCode());
    }

    /**
     * post请求参数校验抛出的异常
     *
     * @param e
     * @return
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseBody
    public JsonResult<String> methodArgumentNotValidExceptionHandler(MethodArgumentNotValidException e) {
        BindingResult bindingResult = e.getBindingResult();
        StringBuilder errorMessage = new StringBuilder("");
        for (FieldError fieldError : bindingResult.getFieldErrors()) {
            errorMessage.append(fieldError.getDefaultMessage()).append("\n");
        }
        log.error(errorMessage.toString(), e);
        return JsonResult.error(errorMessage.toString(), HttpResultCode.PARAMETER_EXCEPTION.getCode());
    }

    /**
     * get请求参数校验抛出的异常
     *
     * @param e
     * @return
     */
    @ExceptionHandler(BindException.class)
    public JsonResult<String> bindExceptionHandler(BindException e) {
        //获取异常中随机一个异常信息
        String message = e.getBindingResult().getFieldError().getDefaultMessage();
        log.error(message, e);
        return JsonResult.error(message);
    }

    /**
     * 请求方法中校验抛出的异常
     *
     * @param e
     * @return
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public JsonResult<String> constraintViolationExceptionHandler(ConstraintViolationException e) {
        //获取异常中第一个错误信息
        String message = e.getConstraintViolations().iterator().next().getMessage();
        log.error(message, e);
        return JsonResult.error(message);
    }
}
