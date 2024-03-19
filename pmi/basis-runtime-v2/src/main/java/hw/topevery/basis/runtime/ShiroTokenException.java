package hw.topevery.basis.runtime;

/**
 * @author yang.yang
 */
public class ShiroTokenException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    private Integer code;

    public ShiroTokenException(Integer code, String msg) {
        super(msg);
        this.code = code;
    }

    public Integer getCode() {
        return code;
    }

    public void setCode(Integer code) {
        this.code = code;
    }
}
