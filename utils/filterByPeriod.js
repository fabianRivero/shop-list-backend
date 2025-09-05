import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter.js";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export function filterByPeriod(purchases, period, baseDate, tz = "UTC") {
  const base = baseDate.tz(tz);

  let start, end;

  switch (period) {
    case "day":
      start = base.startOf("day");
      end = base.endOf("day");
      break;
    case "week":
      start = base.startOf("week");
      end = base.endOf("week");
      break;
    case "month":
      start = base.startOf("month");
      end = base.endOf("month");
      break;
    case "year":
      start = base.startOf("year");
      end = base.endOf("year");
      break;
    default:
      return purchases; 
  }

  return purchases.filter(log => {
    const purchaseDate = dayjs.tz(log.date, tz);
    return purchaseDate.isSameOrAfter(start) && purchaseDate.isSameOrBefore(end);
  });
}
