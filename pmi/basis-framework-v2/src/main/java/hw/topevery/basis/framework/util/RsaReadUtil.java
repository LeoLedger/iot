package hw.topevery.basis.framework.util;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@Component
public class RsaReadUtil {



    /**
     * 解析文件
     *
     * @return
     * @throws IOException
     */
    public  String getPrivateKey() throws IOException {
        InputStream inputStream = new ClassPathResource("rsa").getInputStream();
        String key;
        // 以文件流的形式逐行读取txt文件(文件存储编码需要utf-8格式，不然会乱码)
        InputStreamReader in = new InputStreamReader(inputStream, StandardCharsets.UTF_8);
        BufferedReader br = new BufferedReader(in);
        while ((key = br.readLine()) != null) {
            return key;
        }
        return null;
    }

}
