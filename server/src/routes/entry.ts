import express from "express";
import { prisma } from "../prisma";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import {
  calculateCompletedJuz,
  getJuzForAyahReference,
  getJuzProgressPercent,
  normalizeCoverageRange,
  parseCoverageRange,
  parseMemorizedJuzList,
} from "../quranProgress";

const router = express.Router();

// CREATE DAILY ENTRY
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const { sabaq, sabaqPara, manzil, notes, coverage } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: req.userId },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const last = user.lastEntryDate
    ? new Date(user.lastEntryDate)
    : null;

  let newStreak = user.streak;

  if (last) {
    last.setHours(0, 0, 0, 0);

    const diffDays =
      (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      newStreak += 1; // continued streak
    } else if (diffDays > 1) {
      newStreak = 1; // reset streak
    }
  } else {
    newStreak = 1;
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      streak: newStreak,
      longestStreak: Math.max(user.longestStreak, newStreak),
      lastEntryDate: today,
    },
  });

  const entry = await prisma.dailyEntry.create({
    data: {
      userId: req.userId,
      sabaq,
      sabaqPara,
      manzil,
      notes,
    },
  });

  const entries = await prisma.dailyEntry.findMany({
    where: { userId: req.userId },
    select: {
      sabaq: true,
      sabaqPara: true,
      manzil: true,
    },
  });
  const sabaqRange = normalizeCoverageRange(coverage?.sabaq) || parseCoverageRange(sabaq);
  const currentJuz =
    sabaqRange && getJuzForAyahReference(sabaqRange.endSurahNumber, sabaqRange.endAyah);
  const effectiveCurrentJuz = currentJuz ?? user.currentJuz;
  const currentSurah = sabaqRange?.endSurahNumber ?? user.currentSurah;
  const currentAyah = sabaqRange?.endAyah ?? user.currentAyah;
  const currentJuzProgressPercent = getJuzProgressPercent(currentSurah, currentAyah);
  const memorizedJuz = calculateCompletedJuz(
    entries,
    parseMemorizedJuzList(user.memorizedJuzList),
    sabaqRange
  );

  await prisma.user.update({
    where: { id: user.id },
    data: {
      memorizedJuzCount: memorizedJuz.length,
      memorizedJuzList: JSON.stringify(memorizedJuz),
      currentJuz: effectiveCurrentJuz,
      currentSurah,
      currentAyah,
    },
  });

  res.json({
    entry,
    streak: updatedUser.streak,
    longestStreak: updatedUser.longestStreak,
    progress: {
      juz: memorizedJuz.length,
      memorizedJuz,
      currentJuz: effectiveCurrentJuz,
      currentSurah,
      currentAyah,
      currentJuzProgressPercent,
      pages: 0,
      surahs: 0,
    },
  });
});

// GET MY ENTRIES
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const entries = await prisma.dailyEntry.findMany({
    where: { userId: req.userId },
    orderBy: { date: "desc" },
  });

  res.json(entries);
});

export default router;
