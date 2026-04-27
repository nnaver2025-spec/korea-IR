import { endOfDay, endOfWeek, format, isAfter, isBefore, isSameDay, parseISO, startOfDay, startOfWeek } from "date-fns";
import { ko } from "date-fns/locale";

export function formatKoreanDateTime(isoDate: string) {
  return format(parseISO(isoDate), "M월 d일 EEEE HH:mm", { locale: ko });
}

export function formatKoreanDate(isoDate: string) {
  return format(parseISO(isoDate), "M월 d일 EEEE", { locale: ko });
}

export function getEventBucket(isoDate: string, now = new Date()): "today" | "thisWeek" | "nextWeek" | "later" {
  const date = parseISO(isoDate);
  if (isSameDay(date, now)) return "today";

  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
  if ((isAfter(date, thisWeekStart) || isSameDay(date, thisWeekStart)) && (isBefore(date, thisWeekEnd) || isSameDay(date, thisWeekEnd))) {
    return "thisWeek";
  }

  const nextWeekStart = startOfDay(new Date(thisWeekEnd.getFullYear(), thisWeekEnd.getMonth(), thisWeekEnd.getDate() + 1));
  const nextWeekEnd = endOfDay(new Date(nextWeekStart.getFullYear(), nextWeekStart.getMonth(), nextWeekStart.getDate() + 6));
  if ((isAfter(date, nextWeekStart) || isSameDay(date, nextWeekStart)) && (isBefore(date, nextWeekEnd) || isSameDay(date, nextWeekEnd))) {
    return "nextWeek";
  }

  return "later";
}
