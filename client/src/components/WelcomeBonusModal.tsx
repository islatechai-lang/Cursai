import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles, BarChart3, Shield, ChevronRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const WELCOME_KEY = "cursai_welcome_bonus_claimed";
const UPGRADE_KEY = "cursai_upgrade_v3.1_seen";

export default function WelcomeBonusModal() {
    const [open, setOpen] = useState(false);
    const [claiming, setClaiming] = useState(false);
    const [claimed, setClaimed] = useState(false);
    const queryClient = useQueryClient();

    useEffect(() => {
        const alreadyClaimed = localStorage.getItem(WELCOME_KEY);
        if (alreadyClaimed) return;

        // Wait for upgrade announcement to be dismissed first
        const checkUpgradeDismissed = () => {
            const upgradeSeen = localStorage.getItem(UPGRADE_KEY);
            if (upgradeSeen) {
                // Small delay after upgrade modal closes for smooth transition
                const timer = setTimeout(() => setOpen(true), 800);
                return () => clearTimeout(timer);
            }
        };

        // Check immediately
        const cleanup = checkUpgradeDismissed();
        if (cleanup) return cleanup;

        // Poll for when upgrade modal gets dismissed
        const interval = setInterval(() => {
            const upgradeSeen = localStorage.getItem(UPGRADE_KEY);
            if (upgradeSeen) {
                clearInterval(interval);
                setTimeout(() => setOpen(true), 800);
            }
        }, 300);

        return () => clearInterval(interval);
    }, []);

    const handleClaim = async () => {
        setClaiming(true);
        try {
            const response = await fetch("/api/credits/claim-welcome", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            if (response.ok) {
                setClaimed(true);
                localStorage.setItem(WELCOME_KEY, "true");
                queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
                // Close after a brief celebration
                setTimeout(() => setOpen(false), 2000);
            }
        } catch (error) {
            console.error("Failed to claim welcome bonus:", error);
        } finally {
            setClaiming(false);
        }
    };

    const handleDismiss = () => {
        localStorage.setItem(WELCOME_KEY, "true");
        setOpen(false);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) handleDismiss();
            }}
        >
            <DialogContent
                className="
          w-[calc(100%-2rem)] max-w-md mx-auto
          rounded-2xl border border-border/60
          bg-card/95 backdrop-blur-xl
          p-0 gap-0 overflow-hidden
          shadow-xl
          data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
          data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
        "
            >
                {/* Top gradient accent bar */}
                <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-primary to-violet-500" />

                {/* Content wrapper */}
                <div className="relative px-5 pt-5 pb-5 sm:px-8 sm:pt-6 sm:pb-6">
                    {/* Background glow */}
                    <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 right-0 w-48 h-48 rounded-full bg-primary/8 blur-3xl" />

                    {/* Badge */}
                    <div className="relative flex justify-center mb-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
                            <Sparkles className="w-3 h-3" />
                            Welcome Gift
                        </span>
                    </div>

                    {/* Icon */}
                    <div className="relative flex justify-center mb-3">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-xl bg-emerald-500/20 blur-xl scale-125 animate-pulse" />
                            <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                                <Gift className={`w-7 h-7 text-white drop-shadow-md ${claimed ? 'animate-bounce' : ''}`} />
                            </div>
                        </div>
                    </div>

                    <DialogHeader className="relative space-y-1.5 mb-4">
                        <DialogTitle className="text-center text-xl font-bold tracking-tight text-foreground">
                            {claimed ? "🎉 Bonus Claimed!" : "Welcome to Cursai!"}
                        </DialogTitle>
                        <DialogDescription className="text-center text-[13px] leading-relaxed text-muted-foreground max-w-[340px] mx-auto">
                            {claimed ? (
                                <>
                                    You've got{" "}
                                    <span className="font-bold text-emerald-500">1 free analysis credit</span>
                                    . Try analyzing any crypto pair now!
                                </>
                            ) : (
                                <>
                                    Your AI-powered crypto analysis companion is ready. Claim your{" "}
                                    <span className="font-bold text-emerald-500">
                                        free analysis credit
                                    </span>{" "}
                                    to get started!
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    {!claimed && (
                        <>
                            {/* Feature highlights */}
                            <div className="relative grid gap-2 mb-5">
                                <WelcomeFeature
                                    icon={<BarChart3 className="w-3.5 h-3.5" />}
                                    title="AI-Powered Analysis"
                                    description="Deep market insights powered by Gemini 3.1 Pro"
                                    color="emerald"
                                />
                                <WelcomeFeature
                                    icon={<Shield className="w-3.5 h-3.5" />}
                                    title="Hedge Fund-Grade"
                                    description="Professional-level crypto predictions and signals"
                                    color="primary"
                                />
                            </div>

                            {/* Claim button */}
                            <div className="relative flex justify-center">
                                <Button
                                    id="welcome-bonus-claim-btn"
                                    onClick={handleClaim}
                                    disabled={claiming}
                                    size="default"
                                    className="w-full sm:w-auto min-w-[200px] h-12 font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-[15px]"
                                >
                                    {claiming ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Claiming...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Gift className="w-4 h-4" />
                                            Claim Free Credit
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    )}
                                </Button>
                            </div>

                            {/* Credit info */}
                            <div className="relative mt-4 p-3 rounded-xl border border-border/40 bg-muted/30">
                                <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
                                    <span className="font-semibold text-foreground/70">1 free analysis</span>{" "}
                                    included • Need more?{" "}
                                    <span className="font-semibold text-primary">Starter plan</span> starts at $10/mo
                                </p>
                            </div>
                        </>
                    )}

                    {claimed && (
                        <div className="relative flex justify-center mt-2">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[12px] font-semibold text-emerald-500">
                                    +1 Credit Added
                                </span>
                            </div>
                        </div>
                    )}

                    <p className="relative text-center text-[10px] font-medium text-muted-foreground/50 mt-4">
                        Powered by Cursai AI
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function WelcomeFeature({
    icon,
    title,
    description,
    color,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: "emerald" | "primary";
}) {
    const styles = {
        emerald: {
            card: "border-emerald-500/20 bg-emerald-500/5",
            icon: "bg-emerald-500/15 text-emerald-500",
        },
        primary: {
            card: "border-primary/20 bg-primary/5",
            icon: "bg-primary/15 text-primary",
        },
    };

    const s = styles[color];

    return (
        <div
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-colors duration-200 ${s.card}`}
        >
            <div
                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${s.icon}`}
            >
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[13px] font-bold text-foreground/90 leading-tight">
                    {title}
                </p>
                <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                    {description}
                </p>
            </div>
        </div>
    );
}
