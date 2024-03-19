package hw.topevery.basis.framework.util;

import com.fasterxml.uuid.Generators;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * UUIDGeneratorImpl
 *
 * @Summary
 * @Author zhk
 * @Date 2021/5/18 16:57
 */
@Component
public class UUIDGeneratorImpl implements UUIDGenerator {
    @Override
    public UUID generate() {
        return Generators.timeBasedGenerator().generate();
    }
}
