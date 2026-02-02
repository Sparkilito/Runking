import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ScoreSliderProps {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
  showQuickScores?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SCORE_COLORS: Record<number, { bg: string; text: string; glow: string }> = {
  1: { bg: "from-red-600 to-red-500", text: "text-red-500", glow: "shadow-red-500/50" },
  2: { bg: "from-red-500 to-orange-500", text: "text-red-400", glow: "shadow-red-400/50" },
  3: { bg: "from-orange-500 to-orange-400", text: "text-orange-500", glow: "shadow-orange-500/50" },
  4: { bg: "from-orange-400 to-yellow-500", text: "text-orange-400", glow: "shadow-orange-400/50" },
  5: { bg: "from-yellow-500 to-yellow-400", text: "text-yellow-500", glow: "shadow-yellow-500/50" },
  6: { bg: "from-yellow-400 to-lime-500", text: "text-yellow-400", glow: "shadow-yellow-400/50" },
  7: { bg: "from-lime-500 to-green-500", text: "text-lime-500", glow: "shadow-lime-500/50" },
  8: { bg: "from-green-500 to-green-400", text: "text-green-500", glow: "shadow-green-500/50" },
  9: { bg: "from-green-400 to-emerald-400", text: "text-green-400", glow: "shadow-green-400/50" },
  10: { bg: "from-emerald-400 to-cyan-400", text: "text-emerald-400", glow: "shadow-emerald-400/50" },
};

const SCORE_LABELS: Record<number, string> = {
  1: "Terrible",
  2: "Muy malo",
  3: "Malo",
  4: "Regular",
  5: "Pasable",
  6: "Decente",
  7: "Bueno",
  8: "Muy bueno",
  9: "Excelente",
  10: "Obra maestra",
};

export function ScoreSlider({
  value,
  onChange,
  disabled = false,
  showQuickScores = true,
  size = "md",
  className,
}: ScoreSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const lastValue = useRef<number | null>(value);

  const sizes = {
    sm: { height: "h-8", thumb: "w-6 h-6", text: "text-lg" },
    md: { height: "h-12", thumb: "w-10 h-10", text: "text-2xl" },
    lg: { height: "h-16", thumb: "w-14 h-14", text: "text-4xl" },
  };

  const currentSize = sizes[size];
  const displayValue = value ?? 5;
  const colors = SCORE_COLORS[displayValue];

  // Trigger burst animation on value change
  useEffect(() => {
    if (value !== null && value !== lastValue.current) {
      setShowBurst(true);
      const timer = setTimeout(() => setShowBurst(false), 400);
      lastValue.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);

  const handleSliderClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || !sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      const newValue = Math.round(percentage * 9) + 1;
      onChange(newValue);

      // Haptic feedback on mobile
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    },
    [disabled, onChange]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || disabled || !sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      const newValue = Math.round(percentage * 9) + 1;
      onChange(newValue);
    },
    [isDragging, disabled, onChange]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || disabled || !sliderRef.current) return;

      const touch = e.touches[0];
      const rect = sliderRef.current.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      const newValue = Math.round(percentage * 9) + 1;

      if (newValue !== value && navigator.vibrate) {
        navigator.vibrate(5);
      }

      onChange(newValue);
    },
    [isDragging, disabled, onChange, value]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const percentage = ((displayValue - 1) / 9) * 100;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Score Display */}
      <div className="flex items-center justify-center gap-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={displayValue}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="relative"
          >
            <span className={cn("font-bold", currentSize.text, colors.text)}>
              {value !== null ? displayValue : "?"}
            </span>

            {/* Burst Animation */}
            <AnimatePresence>
              {showBurst && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className={cn(
                    "absolute inset-0 rounded-full",
                    `bg-gradient-to-r ${colors.bg}`,
                    "blur-xl -z-10"
                  )}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {value !== null && (
            <motion.span
              key={SCORE_LABELS[displayValue]}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="text-white/60 text-sm font-medium"
            >
              {SCORE_LABELS[displayValue]}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Slider Track */}
      <div
        ref={sliderRef}
        className={cn(
          "relative rounded-full cursor-pointer select-none",
          currentSize.height,
          "bg-white/10 backdrop-blur-sm",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={handleSliderClick}
        onMouseDown={() => !disabled && setIsDragging(true)}
        onTouchStart={() => !disabled && setIsDragging(true)}
      >
        {/* Gradient Fill */}
        <motion.div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            `bg-gradient-to-r ${colors.bg}`,
            "shadow-lg",
            colors.glow
          )}
          initial={false}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />

        {/* Scale Markers */}
        <div className="absolute inset-0 flex items-center justify-between px-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <div
              key={num}
              className={cn(
                "w-1 h-1 rounded-full transition-colors duration-200",
                num <= displayValue ? "bg-white/40" : "bg-white/10"
              )}
            />
          ))}
        </div>

        {/* Thumb */}
        <motion.div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2",
            currentSize.thumb,
            "rounded-full bg-white shadow-xl",
            "flex items-center justify-center",
            "border-4",
            isDragging && "scale-110",
            "transition-transform duration-150"
          )}
          style={{
            borderColor: `hsl(${(displayValue - 1) * 12}, 70%, 50%)`,
          }}
          initial={false}
          animate={{ left: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <span className={cn("font-bold text-gray-800", size === "sm" ? "text-xs" : "text-sm")}>
            {value !== null ? displayValue : "?"}
          </span>
        </motion.div>
      </div>

      {/* Quick Score Buttons */}
      {showQuickScores && (
        <div className="flex items-center justify-center gap-2">
          {[1, 5, 7, 10].map((score) => (
            <motion.button
              key={score}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => !disabled && onChange(score)}
              disabled={disabled}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-semibold",
                "transition-all duration-200",
                value === score
                  ? `bg-gradient-to-r ${SCORE_COLORS[score].bg} text-white shadow-lg ${SCORE_COLORS[score].glow}`
                  : "bg-white/10 text-white/70 hover:bg-white/20",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {score}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

// Compact version for list items
export function ScoreIndicator({ score, size = "sm" }: { score: number; size?: "xs" | "sm" | "md" }) {
  const colors = SCORE_COLORS[score] || SCORE_COLORS[5];

  const sizes = {
    xs: "w-5 h-5 text-[10px]",
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
  };

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white",
        `bg-gradient-to-br ${colors.bg}`,
        "shadow-md",
        sizes[size]
      )}
    >
      {score}
    </div>
  );
}

// Score Badge for display
export function ScoreBadge({ score, label }: { score: number; label?: string }) {
  const colors = SCORE_COLORS[score] || SCORE_COLORS[5];

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          `bg-gradient-to-br ${colors.bg}`,
          "shadow-lg",
          colors.glow
        )}
      >
        <span className="text-xl font-bold text-white">{score}</span>
      </div>
      {label && (
        <div className="flex flex-col">
          <span className="text-white/60 text-xs">Puntuación</span>
          <span className={cn("font-semibold", colors.text)}>{SCORE_LABELS[score]}</span>
        </div>
      )}
    </div>
  );
}
