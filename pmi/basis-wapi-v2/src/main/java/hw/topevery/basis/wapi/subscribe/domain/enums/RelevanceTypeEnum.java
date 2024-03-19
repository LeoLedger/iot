package hw.topevery.basis.wapi.subscribe.domain.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * @author chen.jiesen
 * @date 2023/8/30
 **/
@AllArgsConstructor
@Getter
public enum RelevanceTypeEnum {
    DEPT_ROLE("1", "部门和角色"),
    ROLE_MEUN("2", "角色和菜单(权限)"),
    USER_DEPT("3", "用户和部门"),
    USER_ROLE("4", "用户和角色"),
    USER_MEUN("5", "用户和菜单(权限)");
    private final String type;

    private final String name;

    private static Map<String, RelevanceTypeEnum> cache;

    static {
        cache = Arrays.stream(RelevanceTypeEnum.values()).collect(Collectors.toMap(RelevanceTypeEnum::getType, Function.identity()));
    }

    public static RelevanceTypeEnum of(String type) {
        return cache.get(type);
    }
}
