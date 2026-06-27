"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../prisma");
const auth_1 = require("../middleware/auth");
const quranProgress_1 = require("../quranProgress");
const router = express_1.default.Router();
// CREATE DAILY ENTRY
router.post("/", auth_1.authMiddleware, async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ message: "Not authenticated" });
    }
    const { sabaq, sabaqPara, manzil, notes, coverage } = req.body;
    const user = await prisma_1.prisma.user.findUnique({
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
        const diffDays = (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays === 1) {
            newStreak += 1; // continued streak
        }
        else if (diffDays > 1) {
            newStreak = 1; // reset streak
        }
    }
    else {
        newStreak = 1;
    }
    const updatedUser = await prisma_1.prisma.user.update({
        where: { id: user.id },
        data: {
            streak: newStreak,
            longestStreak: Math.max(user.longestStreak, newStreak),
            lastEntryDate: today,
        },
    });
    const entry = await prisma_1.prisma.dailyEntry.create({
        data: {
            userId: req.userId,
            sabaq,
            sabaqPara,
            manzil,
            notes,
        },
    });
    const entries = await prisma_1.prisma.dailyEntry.findMany({
        where: { userId: req.userId },
        select: {
            sabaq: true,
            sabaqPara: true,
            manzil: true,
        },
    });
    const sabaqRange = (0, quranProgress_1.normalizeCoverageRange)(coverage?.sabaq) || (0, quranProgress_1.parseCoverageRange)(sabaq);
    const currentJuz = sabaqRange && (0, quranProgress_1.getJuzForAyahReference)(sabaqRange.endSurahNumber, sabaqRange.endAyah);
    const effectiveCurrentJuz = currentJuz ?? user.currentJuz;
    const currentSurah = sabaqRange?.endSurahNumber ?? user.currentSurah;
    const currentAyah = sabaqRange?.endAyah ?? user.currentAyah;
    const currentJuzProgressPercent = (0, quranProgress_1.getJuzProgressPercent)(currentSurah, currentAyah);
    const memorizedJuz = (0, quranProgress_1.calculateCompletedJuz)(entries, (0, quranProgress_1.parseMemorizedJuzList)(user.memorizedJuzList), sabaqRange);
    await prisma_1.prisma.user.update({
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
router.get("/", auth_1.authMiddleware, async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ message: "Not authenticated" });
    }
    const entries = await prisma_1.prisma.dailyEntry.findMany({
        where: { userId: req.userId },
        orderBy: { date: "desc" },
    });
    res.json(entries);
});
exports.default = router;
