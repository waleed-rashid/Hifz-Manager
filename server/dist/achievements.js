"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAchievementStats = void 0;
const quranProgress_1 = require("./quranProgress");
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const toDayKey = (dateValue) => {
    const date = new Date(dateValue);
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
};
const getCompletedDayKeys = (entries) => {
    const days = new Map();
    entries.forEach((entry) => {
        const dayKey = toDayKey(entry.date);
        const day = days.get(dayKey) || {
            sabaq: false,
            sabaqPara: false,
            manzil: false,
        };
        day.sabaq = day.sabaq || Boolean(entry.sabaqSaved);
        day.sabaqPara = day.sabaqPara || Boolean(entry.sabaqParaSaved);
        day.manzil = day.manzil || Boolean(entry.manzilSaved);
        days.set(dayKey, day);
    });
    return Array.from(days.entries())
        .filter(([, day]) => day.sabaq && day.sabaqPara && day.manzil)
        .map(([dayKey]) => dayKey)
        .sort();
};
const getFirstStreakThresholdDate = (entries, threshold) => {
    const dayKeys = getCompletedDayKeys(entries);
    if (dayKeys.length < threshold) {
        return null;
    }
    let currentLength = 1;
    for (let index = 1; index < dayKeys.length; index += 1) {
        const previousDate = new Date(dayKeys[index - 1]);
        const currentDate = new Date(dayKeys[index]);
        const diffDays = (currentDate.getTime() - previousDate.getTime()) / MS_PER_DAY;
        currentLength = diffDays === 1 ? currentLength + 1 : 1;
        if (currentLength >= threshold) {
            return dayKeys[index];
        }
    }
    return threshold === 1 ? dayKeys[0] : null;
};
const getRevisionThresholdDate = (entries, threshold) => {
    let revisionSessions = 0;
    for (const entry of entries) {
        if (entry.manzilSaved && entry.manzil.trim()) {
            revisionSessions += 1;
        }
        if (revisionSessions >= threshold) {
            return entry.date.toISOString();
        }
    }
    return null;
};
const getJuzThresholdDate = (entries, onboardingMemorizedJuzList, threshold) => {
    const baselineJuz = (0, quranProgress_1.parseMemorizedJuzList)(onboardingMemorizedJuzList);
    if (baselineJuz.length >= threshold) {
        return null;
    }
    for (let index = 0; index < entries.length; index += 1) {
        const completedJuz = (0, quranProgress_1.calculateCompletedJuz)(entries.slice(0, index + 1), baselineJuz);
        if (completedJuz.length >= threshold) {
            return entries[index].date.toISOString();
        }
    }
    return null;
};
const getSurahThresholdDate = (entries, threshold) => {
    for (let index = 0; index < entries.length; index += 1) {
        const completedSurahs = (0, quranProgress_1.calculateCompletedSurahs)(entries.slice(0, index + 1));
        if (completedSurahs >= threshold) {
            return entries[index].date.toISOString();
        }
    }
    return null;
};
const calculateAchievementStats = (entries, onboardingMemorizedJuzList = "[]") => {
    const chronologicalEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const revisionSessions = chronologicalEntries.filter((entry) => entry.manzilSaved && entry.manzil.trim()).length;
    return {
        totalEntries: entries.length,
        revisionSessions,
        awardedDates: {
            firstEntry: chronologicalEntries[0]?.date.toISOString() || null,
            sevenDayStreak: getFirstStreakThresholdDate(chronologicalEntries, 7),
            thirtyDayStreak: getFirstStreakThresholdDate(chronologicalEntries, 30),
            firstJuz: getJuzThresholdDate(chronologicalEntries, onboardingMemorizedJuzList, 1),
            fiveAjzaa: getJuzThresholdDate(chronologicalEntries, onboardingMemorizedJuzList, 5),
            fifteenAjzaa: getJuzThresholdDate(chronologicalEntries, onboardingMemorizedJuzList, 15),
            firstSurah: getSurahThresholdDate(chronologicalEntries, 1),
            fiftyRevisions: getRevisionThresholdDate(chronologicalEntries, 50),
            hundredRevisions: getRevisionThresholdDate(chronologicalEntries, 100),
        },
    };
};
exports.calculateAchievementStats = calculateAchievementStats;
