package hw.topevery.basis.framework.cache;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;

/**
 * RedisUtil
 *
 * @Summary
 * @Author zhk
 * @Date 2021/6/15 15:22
 */
@Slf4j
@Component
public final class RedisUtil {

    private static final String DataKey = "data";
    final Semaphore syncSemaphore = new Semaphore(1);

    @Autowired
    RedisTemplate<String, Object> redisTemplate;

    @Value("${spring.redis.keyPrefix}")
    String keyPrefix;

    /**
     * 设置失效时间
     *
     * @param key
     * @param time
     * @return
     */
    public <TValue> boolean expire(String key, Class<TValue> clazz, long time) {
        try {
            if (time > 0) {
                boolean b = redisTemplate.expire(formatCacheKey(key, clazz), time, TimeUnit.SECONDS);
            }
            return true;
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            return false;
        }
    }

    /**
     * 获取过期时间
     *
     * @param key
     * @return
     */
    public <TValue> long getExpire(String key, Class<TValue> clazz) {
        return redisTemplate.getExpire(formatCacheKey(key, clazz), TimeUnit.SECONDS);
    }

    /**
     * 判断key是否存在。
     *
     * @param key
     * @return
     */
    public <TValue> boolean hasKey(String key, Class<TValue> clazz) {
        try {
            return redisTemplate.hasKey(formatCacheKey(key, clazz));
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            return false;
        }
    }

    public <TValue> TValue get(String key, Class<TValue> clazz) {
        return (TValue) redisTemplate.opsForHash().get(formatCacheKey(key, clazz), DataKey);
    }

    public <TValue> TValue getOrAdd(String key, Class<TValue> clazz, CacheItemFactory<TValue> factory) throws InterruptedException {
        TValue val = get(key, clazz);
        if (val != null) {
            return val;
        }

        syncSemaphore.acquire();
        try {
            val = get(key, clazz);
            if (val != null) {
                return val;
            }
            val = factory.create();
            Assert.notNull(val);
            set(key, val);
            return val;
        } finally {
            syncSemaphore.release();
        }
    }

    public <TValue> TValue getOrAdd(String key, Class<TValue> clazz, long time, CacheItemFactory<TValue> factory) throws InterruptedException {
        TValue val = get(key, clazz);
        if (val != null) {
            return val;
        }

        syncSemaphore.acquire();
        try {
            val = get(key, clazz);
            if (val != null) {
                return val;
            }
            val = factory.create();
            Assert.notNull(val);
            set(key, val, time);
            return val;
        } finally {
            syncSemaphore.release();
        }
    }


    public boolean set(String key, Object value) {
        try {
            redisTemplate.opsForHash().put(formatCacheKey(key, value.getClass()), DataKey, value);
            return true;
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            return false;
        }
    }

    public boolean set(String key, Object value, long time) {
        try {
            redisTemplate.opsForHash().put(formatCacheKey(key, value.getClass()), DataKey, value);
            if (time > 0) {
                expire(key, value.getClass(), time);
            }
            return true;
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            return false;
        }
    }

    private String formatCacheKey(String key, Class<?> cacheEntryClass) {
        return String.format("%s,%s,%s", keyPrefix, cacheEntryClass.getSimpleName(), key);
    }
}
