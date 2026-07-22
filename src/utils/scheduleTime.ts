const TIME_CODE_START_MINUTES: Record<number, number> = {
  1: 7 * 60 + 30,
  9: 13 * 60,
  17: 17 * 60 + 30,
};

const getTimeCodeStartMinutes = (timeCode: string): number | null => {
  const match = timeCode.match(/^T(\d+)$/i);
  if (!match) return null;

  const order = Number(match[1]);
  if (order >= 1 && order <= 8) {
    return TIME_CODE_START_MINUTES[1] + (order - 1) * 30;
  }
  if (order >= 9 && order <= 16) {
    return TIME_CODE_START_MINUTES[9] + (order - 9) * 30;
  }
  if (order >= 17 && order <= 20) {
    return TIME_CODE_START_MINUTES[17] + (order - 17) * 30;
  }

  return null;
};

const getScheduleStartMinutes = (schedule: any): number => {
  const displayValue =
    schedule?.timeTypeData?.valueVi || schedule?.timeTypeData?.valueEn || "";
  const displayMatch = String(displayValue).match(/(\d{1,2}):(\d{2})/);

  if (displayMatch) {
    const hour = Number(displayMatch[1]);
    const minute = Number(displayMatch[2]);
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return hour * 60 + minute;
    }
  }

  const timeCode = String(
    schedule?.timeType || schedule?.timeTypeData?.keyMap || "",
  );
  return getTimeCodeStartMinutes(timeCode) ?? Number.MAX_SAFE_INTEGER;
};

export const sortSchedulesChronologically = <T>(schedules: T[] = []): T[] =>
  [...schedules].sort(
    (first, second) =>
      getScheduleStartMinutes(first) - getScheduleStartMinutes(second),
  );
