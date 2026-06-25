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

export const formatRecentCoverage = (coverageText) => {
  const rangeMatch = coverageText?.match(
    /^\d+\.\s*([^:]+):(\d+)\s*-\s*\d+\.\s*([^:]+):(\d+)$/
  );

  if (!rangeMatch) {
    return coverageText;
  }

  const [, startSurahName, startAyah, endSurahName, endAyah] = rangeMatch;

  if (startSurahName === endSurahName) {
    return `${startSurahName} ${startAyah} - ${endAyah}`;
  }

  return `${startSurahName} ${startAyah} - ${endSurahName} ${endAyah}`;
};

export const isVisibleRecentEntry = (entry) =>
  !entry.sabaq?.toLowerCase().includes("surah yasin");
