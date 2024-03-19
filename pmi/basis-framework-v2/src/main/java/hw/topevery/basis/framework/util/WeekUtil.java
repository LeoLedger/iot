package hw.topevery.basis.framework.util;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;

public class WeekUtil {

    private static final HashMap<DayOfWeek, String> weekMap = new HashMap<DayOfWeek, String>();

    static {
        weekMap.put(DayOfWeek.MONDAY, "星期一");
        weekMap.put(DayOfWeek.TUESDAY, "星期二");
        weekMap.put(DayOfWeek.WEDNESDAY, "星期三");
        weekMap.put(DayOfWeek.THURSDAY, "星期四");
        weekMap.put(DayOfWeek.FRIDAY, "星期五");
        weekMap.put(DayOfWeek.SATURDAY, "星期六");
        weekMap.put(DayOfWeek.SUNDAY, "星期日");

    }

    public static String caculateWeekDay(LocalDateTime localDateTime) {
        return caculateWeekDay(localDateTime.toLocalDate());
    }

    public static String caculateWeekDay(LocalDate localDate) {
        String weekstr = "";
        DayOfWeek dayOfWeek = localDate.getDayOfWeek();
        weekstr = weekMap.get(dayOfWeek);

//        switch (dayOfWeek) {
//            case MONDAY:
//                weekstr = "星期一";
//                break;
//            case TUESDAY:
//                weekstr = "星期二";
//                break;
//            case WEDNESDAY:
//                weekstr = "星期三";
//                break;
//            case THURSDAY:
//                weekstr = "星期四";
//                break;
//            case FRIDAY:
//                weekstr = "星期五";
//                break;
//            case SATURDAY:
//                weekstr = "星期六";
//                break;
//            case SUNDAY:
//                weekstr = "星期日";
//                break;
//        }

        return weekstr;
    }
}
