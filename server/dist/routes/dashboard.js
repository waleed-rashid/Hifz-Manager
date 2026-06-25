"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../prisma");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// GET DASHBOARD DATA
router.get("/", auth_1.authMiddleware, async (req, res) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: req.userId },
        include: {
            entries: {
                orderBy: { date: "desc" },
                take: 10,
            },
        },
    });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEntry = user.entries.find((entry) => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === today.getTime();
    });
    res.json({
        studentName: user.name,
        streak: user.streak,
        longestStreak: user.longestStreak,
        todayEntry: todayEntry || null,
        recentEntries: user.entries,
    });
});
exports.default = router;
