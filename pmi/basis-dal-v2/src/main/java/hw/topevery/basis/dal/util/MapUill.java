package hw.topevery.basis.dal.util;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import hw.topevery.basis.device.dto.MapRer;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

public class MapUill {

    /**
     * 通过 id 获取到当前所在地址
     * @param ip
     * @return
     */
    public static String getIp(String ip){
        StringBuffer url = new StringBuffer("http://api.map.baidu.com");
        url.append("/location/ip");
        url.append("?ak=pdc4rQjlF8k538fg04tfA56Ir1CmiVlp");
        url.append("&ip=" + ip);
        String baidu = getBaidu(url.toString());
        JSONObject bodyData = (JSONObject)JSONObject.parse(baidu);
        JSONObject content = bodyData.getJSONObject("content");
        if(content != null){
            return content.getString("address");
        }
        return "深圳";
    }

    public static MapRer getData(String query,String address){
        StringBuffer url = new StringBuffer("http://api.map.baidu.com");
        url.append("/place/v2/search");
        url.append("?query=" + query);
        url.append("&region=" + address);
        url.append("&output=json&ak=pdc4rQjlF8k538fg04tfA56Ir1CmiVlp");
        String baidu = getBaidu(url.toString());
        MapRer mapRer = JSON.parseObject(baidu,MapRer.class);
        return mapRer;
    }


    /**
     * get 请求
     * @param url
     * @return
     */
    public static String getBaidu(String url){
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        HttpEntity<String> requestEntity = new HttpEntity<>(null, headers);
        ResponseEntity<String> resEntity = restTemplate.exchange(url.toString(), HttpMethod.GET, requestEntity, String.class);
        return resEntity.getBody();
    }

}
