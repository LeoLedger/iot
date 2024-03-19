package hw.topevery.basis.framework.base.concurrency;

/**
 *  并发标记接口,用于实现乐观锁。
 *  过程如下：实现此接口的实体，在更新时会更新此并发token.
 *  执行更新脚本时增加并发token过滤条件： ConcurrencyToken=oldToken
 *  最后获取更新影响的行数，如果不等于原需要更新的数量，触发 ConcurrencyException 异常，事务回滚（依赖 EnableTransaction 注解）
 *  没有使用 EnableTransaction 需要自己启用事务，在发生异常时自行回滚。
 */
public interface IHasConcurrencyToken {
    String FieldName = "concurrencyToken";
    String getConcurrencyToken();
    void setConcurrencyToken(String concurrencyToken);
}