const CONTINUOUS_CHAT_TIME = 10 * 60 * 1000;

export function chatInSameTime(
  time1: number,
  time2: number,
  timeRange?: number
) {
  if (!timeRange) timeRange = CONTINUOUS_CHAT_TIME;
  return (
    Math.abs(new Date(time2).getTime() - new Date(time1).getTime()) < timeRange
  );
}
