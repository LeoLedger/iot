package hw.topevery.basis.framework.util;

import lombok.extern.slf4j.Slf4j;

/**
 * @description:  工具类
 * @author: zzk
 * @since: 2021.08.19
 **/
@Slf4j
public class PmiUtils {

    public  static String padLeft(String src, int len, char ch) {
        int diff = len - src.length();
        if (diff <= 0) {
            return src;
        }

        char[] charr = new char[len];
        System.arraycopy(src.toCharArray(), 0, charr, diff, src.length());
        for (int i = 0; i < diff; i++) {
            charr[i] = ch;
        }
        return new String(charr);
    }

}
