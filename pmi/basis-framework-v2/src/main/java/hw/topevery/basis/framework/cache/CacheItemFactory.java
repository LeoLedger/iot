package hw.topevery.basis.framework.cache;

/**
 * @Summary
 * @Author zhk
 * @Date 2021/6/15 17:13
 */
@FunctionalInterface
public interface CacheItemFactory<T> {
    T create();
}
