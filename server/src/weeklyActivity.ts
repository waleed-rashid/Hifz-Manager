const toDayKey = (dateValue: Date) => {
  const date = new Date(dateValue);
  date.setHours(0, 0, 0, 0);

  return date.toISOString();
};

export type WeeklyActivityEntry = {
  date: Date;
  sabaqSaved?: boolean;
  sabaqParaSaved?: boolean;
  manzilSaved?: boolean;
};

export const calculateWeeklyActivity = (
  entries: WeeklyActivityEntry[],
  todayValue = new Date(),
  startDateValue?: Date | null
) => {
  const activityByDay = new Map<
    string,
    { sabaq: boolean; sabaqPara: boolean; manzil: boolean }
  >();

  entries.forEach((entry) => {
    const dayKey = toDayKey(entry.date);
    const activity = activityByDay.get(dayKey) || {
      sabaq: false,
      sabaqPara: false,
      manzil: false,
    };

    activity.sabaq = activity.sabaq || Boolean(entry.sabaqSaved);
    activity.sabaqPara = activity.sabaqPara || Boolean(entry.sabaqParaSaved);
    activity.manzil = activity.manzil || Boolean(entry.manzilSaved);
    activityByDay.set(dayKey, activity);
  });

  const today = new Date(todayValue);
  today.setHours(0, 0, 0, 0);
  const startDate = startDateValue ? new Date(startDateValue) : null;
  startDate?.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));

    const dayKey = toDayKey(date);
    const activity = activityByDay.get(dayKey);
    const completedCount = activity
      ? [activity.sabaq, activity.sabaqPara, activity.manzil].filter(Boolean).length
      : 0;

    return {
      date: dayKey,
      completedCount,
    };
  }).filter((day) => !startDate || new Date(day.date).getTime() >= startDate.getTime());
};
