import { surahs } from "../data/surahs";

export const coverageTypes = [
  { key: "sabaq", label: "Sabaq" },
  { key: "sabaqPara", label: "Sabaq Para" },
  { key: "revision", label: "Revision" },
];

export const createDefaultCoverage = () =>
  coverageTypes.reduce((coverage, type) => {
    coverage[type.key] = {
      startSurahNumber: 1,
      startAyah: 1,
      endSurahNumber: 1,
      endAyah: 7,
    };

    return coverage;
  }, {});

export const getSurahByNumber = (surahNumber) =>
  surahs.find((surah) => surah.number === Number(surahNumber)) || surahs[0];

export const formatCoverageRange = (entry) => {
  const startSurah = getSurahByNumber(entry.startSurahNumber);
  const endSurah = getSurahByNumber(entry.endSurahNumber);

  if (startSurah.number === endSurah.number) {
    return `${startSurah.name} ${entry.startAyah} - ${entry.endAyah}`;
  }

  return `${startSurah.name} ${entry.startAyah} - ${endSurah.name} ${entry.endAyah}`;
};

const getSurahByName = (surahName) =>
  surahs.find((surah) => surah.name.toLowerCase() === surahName?.toLowerCase());

export const parseCoverageRange = (coverageText) => {
  const legacyRangeMatch = coverageText?.match(
    /^\d+\.\s*([^:]+):(\d+)\s*-\s*\d+\.\s*([^:]+):(\d+)$/
  );

  if (legacyRangeMatch) {
    const [, startSurahName, startAyah, endSurahName, endAyah] = legacyRangeMatch;
    const startSurah = getSurahByName(startSurahName);
    const endSurah = getSurahByName(endSurahName);

    if (startSurah && endSurah) {
      return {
        startSurahNumber: startSurah.number,
        startAyah: Number(startAyah),
        endSurahNumber: endSurah.number,
        endAyah: Number(endAyah),
      };
    }
  }

  const normalizedRangeMatch = coverageText?.match(/^(.+)\s+(\d+)\s+-\s+(.+)\s+(\d+)$/);

  if (normalizedRangeMatch) {
    const [, startSurahName, startAyah, endSurahName, endAyah] = normalizedRangeMatch;
    const startSurah = getSurahByName(startSurahName);
    const endSurah = getSurahByName(endSurahName);

    if (startSurah && endSurah) {
      return {
        startSurahNumber: startSurah.number,
        startAyah: Number(startAyah),
        endSurahNumber: endSurah.number,
        endAyah: Number(endAyah),
      };
    }
  }

  const sameSurahRangeMatch = coverageText?.match(/^(.+)\s+(\d+)\s+-\s+(\d+)$/);

  if (sameSurahRangeMatch) {
    const [, surahName, startAyah, endAyah] = sameSurahRangeMatch;
    const surah = getSurahByName(surahName);

    if (surah) {
      return {
        startSurahNumber: surah.number,
        startAyah: Number(startAyah),
        endSurahNumber: surah.number,
        endAyah: Number(endAyah),
      };
    }
  }

  return null;
};

export const formatRecentCoverage = (coverageText) => {
  const parsedCoverage = parseCoverageRange(coverageText);

  if (!parsedCoverage) {
    return coverageText;
  }

  const startSurah = getSurahByNumber(parsedCoverage.startSurahNumber);
  const endSurah = getSurahByNumber(parsedCoverage.endSurahNumber);
  const startsAtFirstAyah = parsedCoverage.startAyah === 1;
  const endsAtLastAyah = parsedCoverage.endAyah === endSurah.ayahs;

  if (startSurah.number === endSurah.number) {
    if (startsAtFirstAyah && endsAtLastAyah) {
      return startSurah.name;
    }

    return `${startSurah.name} ${parsedCoverage.startAyah} - ${parsedCoverage.endAyah}`;
  }

  const startReference = startsAtFirstAyah
    ? startSurah.name
    : `${startSurah.name} ${parsedCoverage.startAyah}`;
  const endReference = endsAtLastAyah
    ? endSurah.name
    : `${endSurah.name} ${parsedCoverage.endAyah}`;

  return `${startReference} - ${endReference}`;
};

export const createCoverageFromEntry = (entry) => {
  if (!entry) {
    return createDefaultCoverage();
  }

  return {
    ...createDefaultCoverage(),
    ...(parseCoverageRange(entry.sabaq) ? { sabaq: parseCoverageRange(entry.sabaq) } : {}),
    ...(parseCoverageRange(entry.sabaqPara)
      ? { sabaqPara: parseCoverageRange(entry.sabaqPara) }
      : {}),
    ...(parseCoverageRange(entry.manzil) ? { revision: parseCoverageRange(entry.manzil) } : {}),
  };
};

export const createNextCoverageRange = (coverageText) => {
  const parsedCoverage = parseCoverageRange(coverageText);

  if (!parsedCoverage) {
    return null;
  }

  const endSurah = getSurahByNumber(parsedCoverage.endSurahNumber);
  const nextSurahNumber =
    parsedCoverage.endAyah >= endSurah.ayahs
      ? Math.min(parsedCoverage.endSurahNumber + 1, surahs[surahs.length - 1].number)
      : parsedCoverage.endSurahNumber;
  const nextSurah = getSurahByNumber(nextSurahNumber);
  const nextAyah = parsedCoverage.endAyah >= endSurah.ayahs ? 1 : parsedCoverage.endAyah + 1;

  return {
    startSurahNumber: nextSurah.number,
    startAyah: nextAyah,
    endSurahNumber: nextSurah.number,
    endAyah: nextAyah,
  };
};

export const createNextCoverageFromLatest = (latestCoverage = {}) => ({
  ...createDefaultCoverage(),
  ...(createNextCoverageRange(latestCoverage.sabaq)
    ? { sabaq: createNextCoverageRange(latestCoverage.sabaq) }
    : {}),
  ...(createNextCoverageRange(latestCoverage.sabaqPara)
    ? { sabaqPara: createNextCoverageRange(latestCoverage.sabaqPara) }
    : {}),
  ...(createNextCoverageRange(latestCoverage.manzil)
    ? { revision: createNextCoverageRange(latestCoverage.manzil) }
    : {}),
});

export const buildSabaqCoverageMap = (sabaqEntries = []) => {
  const coverageMap = surahs.reduce((map, surah) => {
    map[surah.number] = new Set();
    return map;
  }, {});

  sabaqEntries.forEach((entry) => {
    const parsedCoverage = parseCoverageRange(entry.sabaq);

    if (!parsedCoverage) {
      return;
    }

    for (
      let surahNumber = parsedCoverage.startSurahNumber;
      surahNumber <= parsedCoverage.endSurahNumber;
      surahNumber += 1
    ) {
      const surah = getSurahByNumber(surahNumber);
      const firstAyah =
        surahNumber === parsedCoverage.startSurahNumber ? parsedCoverage.startAyah : 1;
      const lastAyah =
        surahNumber === parsedCoverage.endSurahNumber ? parsedCoverage.endAyah : surah.ayahs;

      for (let ayah = firstAyah; ayah <= lastAyah; ayah += 1) {
        coverageMap[surahNumber].add(ayah);
      }
    }
  });

  return coverageMap;
};

export const getAvailableSurahsForSabaq = (coverageMap) =>
  surahs.filter((surah) => (coverageMap[surah.number]?.size || 0) < surah.ayahs);

export const getAvailableAyahsForSabaq = (coverageMap, surahNumber) => {
  const surah = getSurahByNumber(surahNumber);
  const coveredAyahs = coverageMap[surah.number] || new Set();

  return Array.from({ length: surah.ayahs }, (_, index) => index + 1).filter(
    (ayah) => !coveredAyahs.has(ayah)
  );
};

const findNextAvailableSabaqReference = (coverageMap, preferredCoverage) => {
  const preferredSurahNumber = preferredCoverage?.startSurahNumber || 1;
  const preferredAyah = preferredCoverage?.startAyah || 1;

  for (const surah of surahs) {
    if (surah.number < preferredSurahNumber) {
      continue;
    }

    const firstAyah = surah.number === preferredSurahNumber ? preferredAyah : 1;
    const coveredAyahs = coverageMap[surah.number] || new Set();

    for (let ayah = firstAyah; ayah <= surah.ayahs; ayah += 1) {
      if (!coveredAyahs.has(ayah)) {
        return { surahNumber: surah.number, ayah };
      }
    }
  }

  return null;
};

export const createNextSabaqCoverage = (coverageMap, preferredCoverage) => {
  const nextReference = findNextAvailableSabaqReference(coverageMap, preferredCoverage);

  if (!nextReference) {
    return null;
  }

  return {
    startSurahNumber: nextReference.surahNumber,
    startAyah: nextReference.ayah,
    endSurahNumber: nextReference.surahNumber,
    endAyah: nextReference.ayah,
  };
};

export const isSabaqRangeAvailable = (coverageMap, entry) => {
  for (
    let surahNumber = Number(entry.startSurahNumber);
    surahNumber <= Number(entry.endSurahNumber);
    surahNumber += 1
  ) {
    const surah = getSurahByNumber(surahNumber);
    const coveredAyahs = coverageMap[surah.number] || new Set();
    const firstAyah = surahNumber === Number(entry.startSurahNumber) ? Number(entry.startAyah) : 1;
    const lastAyah =
      surahNumber === Number(entry.endSurahNumber) ? Number(entry.endAyah) : surah.ayahs;

    for (let ayah = firstAyah; ayah <= lastAyah; ayah += 1) {
      if (coveredAyahs.has(ayah)) {
        return false;
      }
    }
  }

  return true;
};

export const hasSavedCoverage = (coverageText, savedFlag) => {
  if (savedFlag === false) {
    return false;
  }

  const trimmedCoverage = String(coverageText || "").trim();

  return (
    trimmedCoverage.length > 0 &&
    trimmedCoverage.toLowerCase() !== "undefined" &&
    trimmedCoverage.toLowerCase() !== "null"
  );
};

export const isVisibleRecentEntry = (entry) =>
  (hasSavedCoverage(entry.sabaq, entry.sabaqSaved) ||
    hasSavedCoverage(entry.sabaqPara, entry.sabaqParaSaved) ||
    hasSavedCoverage(entry.manzil, entry.manzilSaved) ||
    String(entry.notes || "").trim().length > 0) &&
  !entry.sabaq?.toLowerCase().includes("surah yasin");
