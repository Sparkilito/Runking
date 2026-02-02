import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Copy,
  Check,
  MessageCircle,
  Twitter,
  Facebook,
  Link2,
  Mail,
  Share2,
  Sparkles,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// =====================================================
// Share Modal - Prominent sharing CTAs
// =====================================================

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  url: string;
  imageUrl?: string;
}

export function ShareModal({
  isOpen,
  onClose,
  title,
  description,
  url,
  imageUrl,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const shareText = description || title;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("¡Enlace copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Error al copiar");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url,
        });
      } catch {
        // User cancelled
      }
    }
  };

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "from-green-500 to-green-600",
      onClick: () => {
        const text = encodeURIComponent(`${title}\n\n${url}`);
        window.open(`https://wa.me/?text=${text}`, "_blank");
      },
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "from-sky-400 to-sky-500",
      onClick: () => {
        const text = encodeURIComponent(title);
        window.open(
          `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`,
          "_blank"
        );
      },
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "from-blue-600 to-blue-700",
      onClick: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank"
        );
      },
    },
    {
      name: "Email",
      icon: Mail,
      color: "from-purple-500 to-purple-600",
      onClick: () => {
        const subject = encodeURIComponent(title);
        const body = encodeURIComponent(`${shareText}\n\n${url}`);
        window.open(`mailto:?subject=${subject}&body=${body}`);
      },
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 bottom-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md z-50"
          >
            <div className="glass rounded-3xl border border-white/10 overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple to-solar flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Compartir</h3>
                    <p className="text-xs text-white/50">
                      Comparte este ranking con tus amigos
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Content preview */}
              <div className="p-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 mb-4">
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm line-clamp-2">
                      {title}
                    </p>
                    {description && (
                      <p className="text-xs text-white/50 line-clamp-1 mt-1">
                        {description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Share options */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {shareOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.name}
                        onClick={option.onClick}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all active:scale-95"
                      >
                        <div
                          className={cn(
                            "w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center",
                            option.color
                          )}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs text-white/70">{option.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Copy link */}
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    {copied ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <Link2 className="w-5 h-5 text-white/70" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-white">
                      {copied ? "¡Copiado!" : "Copiar enlace"}
                    </p>
                    <p className="text-xs text-white/50 truncate">{url}</p>
                  </div>
                  <Copy className="w-5 h-5 text-white/40" />
                </button>

                {/* Native share button (mobile) */}
                {typeof navigator !== "undefined" && navigator.share && (
                  <Button
                    onClick={handleNativeShare}
                    className="w-full mt-4"
                    size="lg"
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    Más opciones
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// =====================================================
// Referral Share Card - For profile/referral CTA
// =====================================================

interface ReferralShareCardProps {
  referralCode: string;
  referralCount: number;
  onCopy: () => void;
  onShare: () => void;
}

export function ReferralShareCard({
  referralCode,
  referralCount,
  onCopy,
  onShare,
}: ReferralShareCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple/30 to-solar/30 p-6 border border-white/10">
      {/* Background sparkles */}
      <div className="absolute top-2 right-2 opacity-30">
        <Sparkles className="w-20 h-20 text-solar" />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-solar to-orange-500 flex items-center justify-center">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">Invita amigos</h3>
            <p className="text-sm text-white/60">
              Gana <span className="text-solar font-bold">100 XP</span> por cada invitado
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-white">{referralCount}</p>
            <p className="text-xs text-white/50">Invitados</p>
          </div>
          <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-solar">{referralCount * 100}</p>
            <p className="text-xs text-white/50">XP ganado</p>
          </div>
        </div>

        {/* Referral code */}
        <div className="bg-white/10 rounded-xl p-3 mb-4">
          <p className="text-xs text-white/50 mb-1">Tu código</p>
          <div className="flex items-center justify-between">
            <code className="text-lg font-mono font-bold text-white tracking-wider">
              {referralCode}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="text-white/70 hover:text-white"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Share button */}
        <Button onClick={onShare} className="w-full" size="lg">
          <Share2 className="w-5 h-5 mr-2" />
          Compartir invitación
        </Button>
      </div>
    </div>
  );
}

// =====================================================
// Quick Share Button - For ranking cards
// =====================================================

interface QuickShareButtonProps {
  title: string;
  url: string;
  className?: string;
}

export function QuickShareButton({ title, url, className }: QuickShareButtonProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled
      }
    } else {
      const text = encodeURIComponent(`${title}\n\n${url}`);
      window.open(`https://wa.me/?text=${text}`, "_blank");
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        handleShare();
      }}
      className={cn("text-white/60 hover:text-solar hover:bg-solar/10", className)}
    >
      <Share2 className="w-5 h-5" />
    </Button>
  );
}

export default ShareModal;
