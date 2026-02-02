import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Zap, Trophy, Shield, Crown, Star, TrendingUp, Award } from "lucide-react";
import {
  type UserGamification,
  type Badge,
  type League,
  LEVEL_TITLES,
  XP_FOR_LEVEL,
  LEAGUE_NAMES,
  LEAGUE_COLORS,
} from "@/types/database";

// =====================================================
// XP Progress Bar
// =====================================================

interface XPProgressBarProps {
  xpTotal: number;
  level: number;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
  className?: string;
}

export function XPProgressBar({
  xpTotal,
  level,
  size = "md",
  showDetails = true,
  className,
}: XPProgressBarProps) {
  const currentLevelXP = XP_FOR_LEVEL[level] || 0;
  const nextLevelXP = XP_FOR_LEVEL[level + 1] || currentLevelXP + 5000;
  const xpInCurrentLevel = xpTotal - currentLevelXP;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;
  const progress = Math.min(100, (xpInCurrentLevel / xpNeededForLevel) * 100);
  const title = LEVEL_TITLES[Math.min(level, 20)] || "Leyenda";

  const sizes = {
    sm: { bar: "h-2", text: "text-xs", icon: "w-4 h-4" },
    md: { bar: "h-3", text: "text-sm", icon: "w-5 h-5" },
    lg: { bar: "h-4", text: "text-base", icon: "w-6 h-6" },
  };

  const currentSize = sizes[size];

  return (
    <div className={cn("space-y-2", className)}>
      {showDetails && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{level}</span>
            </div>
            <div>
              <span className="text-white font-semibold">{title}</span>
              <p className={cn("text-white/50", currentSize.text)}>
                Nivel {level}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className={cn("text-white/70", currentSize.text)}>
              {xpInCurrentLevel.toLocaleString()} / {xpNeededForLevel.toLocaleString()} XP
            </span>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className={cn("relative bg-white/10 rounded-full overflow-hidden", currentSize.bar)}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"
        />
        {/* Shimmer effect */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
          style={{ backgroundSize: "200% 100%" }}
        />
      </div>
    </div>
  );
}

// =====================================================
// Streak Counter
// =====================================================

interface StreakCounterProps {
  currentStreak: number;
  longestStreak?: number;
  shieldActive?: boolean;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
}

export function StreakCounter({
  currentStreak,
  longestStreak,
  shieldActive = false,
  size = "md",
  animated = true,
  className,
}: StreakCounterProps) {
  const [showFlame, setShowFlame] = useState(false);

  useEffect(() => {
    if (animated && currentStreak > 0) {
      const interval = setInterval(() => {
        setShowFlame((prev) => !prev);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [animated, currentStreak]);

  const sizes = {
    sm: { container: "gap-1", flame: "w-5 h-5", text: "text-lg", subtext: "text-xs" },
    md: { container: "gap-2", flame: "w-8 h-8", text: "text-2xl", subtext: "text-sm" },
    lg: { container: "gap-3", flame: "w-12 h-12", text: "text-4xl", subtext: "text-base" },
  };

  const currentSize = sizes[size];
  const isHot = currentStreak >= 7;
  const isOnFire = currentStreak >= 30;

  return (
    <div className={cn("flex items-center", currentSize.container, className)}>
      <div className="relative">
        <motion.div
          animate={
            animated && currentStreak > 0
              ? {
                  scale: showFlame ? 1.1 : 1,
                  rotate: showFlame ? 5 : -5,
                }
              : {}
          }
          transition={{ duration: 0.3 }}
        >
          <Flame
            className={cn(
              currentSize.flame,
              currentStreak === 0
                ? "text-white/30"
                : isOnFire
                ? "text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]"
                : isHot
                ? "text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]"
                : "text-orange-500"
            )}
            fill={currentStreak > 0 ? "currentColor" : "none"}
          />
        </motion.div>

        {/* Shield indicator */}
        {shieldActive && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center">
            <Shield className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>

      <div>
        <span
          className={cn(
            "font-bold",
            currentSize.text,
            currentStreak === 0
              ? "text-white/30"
              : isOnFire
              ? "text-orange-400"
              : isHot
              ? "text-yellow-400"
              : "text-white"
          )}
        >
          {currentStreak}
        </span>
        <p className={cn("text-white/50", currentSize.subtext)}>
          día{currentStreak !== 1 ? "s" : ""} de racha
        </p>
        {longestStreak && longestStreak > currentStreak && (
          <p className={cn("text-white/30", currentSize.subtext)}>
            Mejor: {longestStreak} días
          </p>
        )}
      </div>
    </div>
  );
}

// =====================================================
// League Badge
// =====================================================

interface LeagueBadgeProps {
  league: League;
  rank?: number | null;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
}

export function LeagueBadge({
  league,
  rank,
  size = "md",
  showName = true,
  className,
}: LeagueBadgeProps) {
  const sizes = {
    sm: { badge: "w-8 h-8", icon: "w-4 h-4", text: "text-xs" },
    md: { badge: "w-12 h-12", icon: "w-6 h-6", text: "text-sm" },
    lg: { badge: "w-16 h-16", icon: "w-8 h-8", text: "text-base" },
  };

  const currentSize = sizes[size];
  const color = LEAGUE_COLORS[league];
  const name = LEAGUE_NAMES[league];

  const LeagueIcon = league === "master" ? Crown : league === "diamond" ? Star : Trophy;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "rounded-xl flex items-center justify-center",
          currentSize.badge,
          "shadow-lg"
        )}
        style={{
          background: `linear-gradient(135deg, ${color}, ${color}99)`,
          boxShadow: `0 4px 14px ${color}40`,
        }}
      >
        <LeagueIcon className={cn(currentSize.icon, "text-white")} />
      </div>
      {showName && (
        <div>
          <p className={cn("font-semibold text-white", currentSize.text)}>{name}</p>
          {rank && (
            <p className="text-white/50 text-xs">#{rank} esta semana</p>
          )}
        </div>
      )}
    </div>
  );
}

// =====================================================
// Badge Card
// =====================================================

interface BadgeCardProps {
  badge: Badge;
  earned?: boolean;
  earnedAt?: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
}

export function BadgeCard({
  badge,
  earned = false,
  earnedAt,
  size = "md",
  onClick,
  className,
}: BadgeCardProps) {
  const sizes = {
    sm: { container: "p-2", icon: "text-2xl", title: "text-xs", desc: "text-[10px]" },
    md: { container: "p-3", icon: "text-3xl", title: "text-sm", desc: "text-xs" },
    lg: { container: "p-4", icon: "text-4xl", title: "text-base", desc: "text-sm" },
  };

  const currentSize = sizes[size];

  const tierColors = {
    bronze: "from-amber-700 to-amber-600",
    silver: "from-gray-400 to-gray-300",
    gold: "from-yellow-500 to-amber-400",
    platinum: "from-cyan-400 to-blue-400",
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative rounded-2xl text-center",
        "border border-white/10",
        currentSize.container,
        earned ? "bg-white/10" : "bg-white/5 opacity-50",
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Tier indicator */}
      <div
        className={cn(
          "absolute top-1 right-1 w-2 h-2 rounded-full",
          `bg-gradient-to-br ${tierColors[badge.tier]}`
        )}
      />

      {/* Icon */}
      <div className={cn(currentSize.icon, earned ? "" : "grayscale")}>
        {badge.icon}
      </div>

      {/* Title */}
      <h4 className={cn("font-semibold text-white mt-1", currentSize.title)}>
        {badge.name}
      </h4>

      {/* Description */}
      <p className={cn("text-white/50 line-clamp-2", currentSize.desc)}>
        {badge.description}
      </p>

      {/* XP Reward */}
      {badge.xp_reward > 0 && (
        <div className="flex items-center justify-center gap-1 mt-1">
          <Zap className="w-3 h-3 text-yellow-400" />
          <span className="text-yellow-400 text-xs font-medium">
            +{badge.xp_reward} XP
          </span>
        </div>
      )}

      {/* Earned date */}
      {earned && earnedAt && (
        <p className="text-white/30 text-[10px] mt-1">
          {new Date(earnedAt).toLocaleDateString()}
        </p>
      )}

      {/* Secret badge overlay */}
      {badge.is_secret && !earned && (
        <div className="absolute inset-0 rounded-2xl bg-midnight/80 flex items-center justify-center">
          <span className="text-2xl">🔒</span>
        </div>
      )}
    </motion.button>
  );
}

// =====================================================
// Badge Showcase (Grid of badges)
// =====================================================

interface BadgeShowcaseProps {
  badges: (Badge & { earned?: boolean; earnedAt?: string })[];
  columns?: 3 | 4 | 5 | 6;
  showUnearned?: boolean;
  className?: string;
}

export function BadgeShowcase({
  badges,
  columns = 4,
  showUnearned = true,
  className,
}: BadgeShowcaseProps) {
  const displayBadges = showUnearned
    ? badges
    : badges.filter((b) => b.earned);

  const gridCols = {
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
  };

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-400" />
          Logros
        </h3>
        <span className="text-white/50 text-sm">
          {earnedCount} / {badges.length}
        </span>
      </div>

      <div className={cn("grid gap-3", gridCols[columns])}>
        {displayBadges.map((badge) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            earned={badge.earned}
            earnedAt={badge.earnedAt}
            size="sm"
          />
        ))}
      </div>
    </div>
  );
}

// =====================================================
// XP Notification (Toast for XP earned)
// =====================================================

interface XPNotificationProps {
  amount: number;
  reason: string;
  isVisible: boolean;
  onClose: () => void;
}

export function XPNotification({ amount, reason, isVisible, onClose }: XPNotificationProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className={cn(
            "fixed bottom-24 left-1/2 -translate-x-1/2 z-50",
            "px-6 py-3 rounded-2xl",
            "bg-gradient-to-r from-purple-500 to-pink-500",
            "shadow-2xl shadow-purple-500/30"
          )}
        >
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Zap className="w-6 h-6 text-yellow-300 fill-yellow-300" />
            </motion.div>
            <div>
              <p className="text-white font-bold text-lg">+{amount} XP</p>
              <p className="text-white/80 text-sm">{reason}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// =====================================================
// Level Up Celebration
// =====================================================

interface LevelUpCelebrationProps {
  level: number;
  isVisible: boolean;
  onClose: () => void;
}

export function LevelUpCelebration({ level, isVisible, onClose }: LevelUpCelebrationProps) {
  const title = LEVEL_TITLES[Math.min(level, 20)] || "Leyenda";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Confetti background effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: "50%",
                    y: "50%",
                    scale: 0,
                  }}
                  animate={{
                    x: `${Math.random() * 100}%`,
                    y: `${Math.random() * 100}%`,
                    scale: [0, 1, 0],
                    rotate: Math.random() * 360,
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.05,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                  className={cn(
                    "absolute w-3 h-3 rounded-full",
                    i % 3 === 0
                      ? "bg-purple-500"
                      : i % 3 === 1
                      ? "bg-pink-500"
                      : "bg-yellow-400"
                  )}
                />
              ))}
            </div>

            {/* Content */}
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="relative z-10"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-4xl font-bold text-white mb-2">¡Nivel {level}!</h2>
              <p className="text-xl text-purple-300 mb-6">{title}</p>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/50"
              >
                <TrendingUp className="w-12 h-12 text-white" />
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={onClose}
                className="mt-8 px-8 py-3 rounded-full bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors"
              >
                ¡Genial!
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// =====================================================
// Gamification Stats Card
// =====================================================

interface GamificationStatsCardProps {
  gamification: UserGamification;
  className?: string;
}

export function GamificationStatsCard({ gamification, className }: GamificationStatsCardProps) {
  return (
    <div
      className={cn(
        "p-4 rounded-2xl",
        "bg-gradient-to-br from-purple-500/20 to-pink-500/20",
        "border border-white/10",
        className
      )}
    >
      {/* XP Progress */}
      <XPProgressBar
        xpTotal={gamification.xp_total}
        level={gamification.level}
        size="md"
      />

      {/* Stats Row */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
        <StreakCounter
          currentStreak={gamification.current_streak}
          longestStreak={gamification.longest_streak}
          shieldActive={gamification.streak_shield_active}
          size="sm"
        />

        <LeagueBadge
          league={gamification.league}
          rank={gamification.league_rank}
          size="sm"
        />
      </div>
    </div>
  );
}
