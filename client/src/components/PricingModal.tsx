import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Check, Shield, AlertTriangle } from "lucide-react";
import { purchaseCredits } from "@/lib/whop-payment";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experienceId?: string;
  companyId?: string;
  currentPlan?: string | null;
}

export function PricingModal({
  open,
  onOpenChange,
  experienceId,
  companyId,
  currentPlan,
}: PricingModalProps) {
  const { toast } = useToast();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const purchaseMutation = useMutation({
    mutationFn: async (planId: string) => {
      setSelectedPlanId(planId);
      const success = await purchaseCredits(planId, {
        experienceId,
        companyId,
      });
      if (!success) {
        throw new Error("Purchase failed");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
      toast({
        title: "Upgrade Successful!",
        description: "Your account has been updated with your new analysis credits limit.",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setSelectedPlanId(null);
    },
  });

  const plans = [
    {
      id: "plan_ZLLdnJssCPIpY",
      name: "Starter",
      price: "$10",
      period: "month",
      analysesLimit: "20 analyses",
      description: "Perfect for testing strategies and casual traders.",
      features: [
        "20 AI Market Analyses / mo",
        "Real-time technical indicators",
        "AI entry/target/stop levels",
        "Discord-style responsive chat",
      ],
      ctaText: "Get Starter Access",
      popular: false,
    },
    {
      id: "plan_mndBT74OUdiNB",
      name: "Basic Access",
      price: "$5",
      period: "week",
      analysesLimit: "10 analyses / week",
      description: "For active traders seeking detailed predictions daily.",
      features: [
        "10 AI Market Analyses / week",
        "Full transparent reasoning access",
        "Higher accuracy Gemini calculations",
        "Prioritized real-time predictions",
        "Audit log & indicator breakdowns",
      ],
      ctaText: "Get Basic Access",
      popular: true,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-2xl mx-auto rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl p-0 gap-0 overflow-hidden shadow-2xl">
        {/* Header decoration */}
        <div className="h-1 w-full gradient-primary" />

        <div className="p-6 md:p-8">
          <DialogHeader className="mb-6 text-center sm:text-center">
            <DialogTitle className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Upgrade Your Analysis Limits
            </DialogTitle>
            <DialogDescription className="text-sm md:text-base text-muted-foreground mt-2 max-w-md mx-auto">
              Choose the tier that fits your trading volume. Analyses reset automatically every month while subscribed.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {plans.map((plan) => {
              const isCurrent = currentPlan === plan.id;
              const isPending = purchaseMutation.isPending && selectedPlanId === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col p-5 md:p-6 rounded-2xl border transition-all duration-300 ${
                    plan.popular
                      ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                      : "border-border/60 bg-card/40"
                  } ${isCurrent ? "ring-2 ring-primary/40 ring-offset-2" : ""}`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 right-4 inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-primary text-primary-foreground">
                      <Sparkles className="w-3 h-3" /> Most Popular
                    </span>
                  )}

                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 min-h-[32px]">
                      {plan.description}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-extrabold text-foreground">{plan.price}</span>
                    <span className="text-xs text-muted-foreground font-medium">/{plan.period}</span>
                    <span className="ml-auto text-xs font-bold px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground">
                      {plan.analysesLimit}
                    </span>
                  </div>

                  <ul className="space-y-2.5 mb-6 flex-1 text-xs md:text-sm">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-foreground/90">
                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => purchaseMutation.mutate(plan.id)}
                    disabled={purchaseMutation.isPending || isCurrent}
                    variant={plan.popular ? "default" : "outline"}
                    className={`w-full font-bold h-11 rounded-xl transition-all duration-300 ${
                      plan.popular ? "gradient-primary text-primary-foreground" : ""
                    }`}
                  >
                    {isCurrent ? "Current Plan" : isPending ? "Processing..." : plan.ctaText}
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-2 mt-6 text-[10px] text-muted-foreground/60 border-t border-border/10 pt-4">
            <Shield className="w-3.5 h-3.5" />
            <span>Secure payment processed via Whop. Monthly subscription cancelable anytime.</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
