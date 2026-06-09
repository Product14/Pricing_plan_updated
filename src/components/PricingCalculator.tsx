"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Zap,
  ChevronRight,
  Info,
  Check,
  BarChart3,
  Video,
  Megaphone,
  RotateCcw,
  Car,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  PLANS,
  ADD_ONS,
  calculatePricing,
  getAIInsight,
  type PricingState,
  type PlanTier,
} from "@/lib/pricing";
import { cn } from "@/lib/utils";

const ADDON_ICONS: Record<string, React.ReactNode> = {
  "smartmatch-new": <Car className="w-4 h-4" />,
  "smartmatch-old": <Car className="w-4 h-4" />,
  smartcampaigns: <Megaphone className="w-4 h-4" />,
  "360-spin": <RotateCcw className="w-4 h-4" />,
  "video-studio": <Video className="w-4 h-4" />,
};

export default function PricingCalculator() {
  const [state, setState] = useState<PricingState>({
    plan: "studio-lite",
    vins: 50,
    addOns: new Set(),
  });
  const [annual, setAnnual] = useState(false);

  const pricing = useMemo(() => calculatePricing(state), [state]);
  const insight = useMemo(() => getAIInsight(state), [state]);

  const toggleAddOn = (id: string) => {
    setState((prev) => {
      const next = new Set(prev.addOns);
      next.has(id) ? next.delete(id) : next.add(id);
      return { ...prev, addOns: next };
    });
  };

  const displayMonthly = annual ? pricing.monthlyTotal * 0.833 : pricing.monthlyTotal;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] rounded-full bg-purple-900/10 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-sm text-violet-300 font-medium">AI-Powered Pricing</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-br from-white via-white to-white/50 bg-clip-text text-transparent">
            Configure your plan
          </h1>
          <p className="text-lg text-white/40 max-w-xl mx-auto">
            Real-time cost breakdown with intelligent recommendations tailored to your dealership.
          </p>

          {/* Annual toggle */}
          <div className="inline-flex items-center gap-3 mt-8 bg-white/5 rounded-full px-5 py-2.5 border border-white/10">
            <span className={cn("text-sm", !annual ? "text-white" : "text-white/40")}>Monthly</span>
            <Switch
              checked={annual}
              onCheckedChange={setAnnual}
              className="data-[state=checked]:bg-violet-600"
            />
            <span className={cn("text-sm", annual ? "text-white" : "text-white/40")}>Annual</span>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
              Save 17%
            </Badge>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Left column */}
          <div className="space-y-4">

            {/* Step 1 — VIN slider */}
            <ConfigCard step={1} title="Monthly VIN volume">
              <div className="space-y-5">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-4xl font-bold tabular-nums">{state.vins}</span>
                    <span className="text-white/40 ml-2 text-sm">VINs / month</span>
                  </div>
                  <span className="text-sm text-white/40">
                    ${pricing.plan.pricePerVin.toFixed(2)}{" "}
                    <span className="text-white/30">per VIN</span>
                  </span>
                </div>
                <Slider
                  min={1}
                  max={500}
                  step={1}
                  value={[state.vins]}
                  onValueChange={(vals) =>
                    setState((s) => ({ ...s, vins: (vals as number[])[0] }))
                  }
                  className="[&_[role=slider]]:bg-violet-500 [&_[role=slider]]:border-violet-400"
                />
                <div className="flex justify-between text-xs text-white/25">
                  {[1, 100, 200, 300, 400, 500].map((n) => (
                    <span key={n}>{n}</span>
                  ))}
                </div>
              </div>
            </ConfigCard>

            {/* Step 2 — Plan selection as 3-col table */}
            <ConfigCard step={2} title="Choose your plan">
              <div className="overflow-hidden rounded-xl border border-white/10">
                {/* Table header */}
                <div className="grid grid-cols-4 bg-white/5 px-4 py-3 border-b border-white/10">
                  <div className="text-xs font-semibold text-white/40 uppercase tracking-wider">Plan</div>
                  <div className="text-xs font-semibold text-white/40 uppercase tracking-wider text-center">Max VINs</div>
                  <div className="text-xs font-semibold text-white/40 uppercase tracking-wider text-center">Price / Rooftop</div>
                  <div className="text-xs font-semibold text-white/40 uppercase tracking-wider text-center">Price / VIN</div>
                </div>

                {/* Plan rows */}
                {PLANS.map((plan) => {
                  const selected = state.plan === plan.id;
                  return (
                    <motion.button
                      key={plan.id}
                      onClick={() => setState((s) => ({ ...s, plan: plan.id as PlanTier }))}
                      whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                      className={cn(
                        "w-full grid grid-cols-4 items-center px-4 py-4 transition-colors text-left border-b border-white/5 last:border-0",
                        selected ? "bg-violet-900/30" : "bg-transparent"
                      )}
                    >
                      {/* Plan name */}
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                            selected
                              ? "border-violet-500 bg-violet-500"
                              : "border-white/20 bg-transparent"
                          )}
                        >
                          {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{plan.name}</span>
                            {plan.recommended && (
                              <Badge className="bg-violet-600/80 text-white border-0 text-[10px] px-1.5 py-0">
                                Popular
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-white/35">{plan.tagline}</span>
                        </div>
                      </div>

                      {/* Max VINs */}
                      <div className="text-center">
                        <span className={cn("text-sm font-semibold", selected ? "text-violet-300" : "text-white/60")}>
                          {plan.maxVins}
                        </span>
                      </div>

                      {/* Price / Rooftop */}
                      <div className="text-center">
                        <span className={cn("text-sm font-semibold tabular-nums", selected ? "text-white" : "text-white/60")}>
                          ${plan.pricePerRooftop}
                          <span className="text-white/30 text-xs font-normal">/mo</span>
                        </span>
                      </div>

                      {/* Price / VIN */}
                      <div className="text-center">
                        <span className={cn("text-sm font-semibold tabular-nums", selected ? "text-violet-300" : "text-white/60")}>
                          ${plan.pricePerVin}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </ConfigCard>

            {/* Step 3 — Add-ons */}
            <ConfigCard step={3} title="Add-ons & Features">
              <div className="space-y-2">
                {ADD_ONS.map((addon) => {
                  const active = state.addOns.has(addon.id);
                  return (
                    <motion.div
                      key={addon.id}
                      layout
                      className={cn(
                        "flex items-center justify-between p-3.5 rounded-xl border transition-all",
                        active
                          ? "bg-violet-900/30 border-violet-500/40"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            active ? "bg-violet-500/20 text-violet-400" : "bg-white/5 text-white/30"
                          )}
                        >
                          {ADDON_ICONS[addon.id]}
                        </div>
                        <div>
                          <span className="text-sm font-medium">{addon.name}</span>
                          <p className="text-xs text-white/40">{addon.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold tabular-nums text-white/60">
                          ${addon.pricePerMonth}<span className="text-white/30 text-xs font-normal">/mo</span>
                        </span>
                        <Switch
                          checked={active}
                          onCheckedChange={() => toggleAddOn(addon.id)}
                          className="data-[state=checked]:bg-violet-600"
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ConfigCard>
          </div>

          {/* Right column — summary */}
          <div className="space-y-4 lg:sticky lg:top-6 self-start">
            {/* AI Insight */}
            <motion.div
              layout
              className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-900/40 to-purple-900/20 p-5"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-violet-500/30 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-violet-300" />
                  </div>
                  <span className="text-sm font-medium text-violet-300">AI Insight</span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={insight}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-sm text-white/70 leading-relaxed"
                  >
                    {insight}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Cost breakdown */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 space-y-4">
              <h3 className="font-semibold text-sm text-white/60 uppercase tracking-wider">
                Cost Breakdown
              </h3>

              {/* Big number */}
              <div className="text-center py-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={Math.round(displayMonthly)}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                  >
                    <span className="text-5xl font-bold tabular-nums">
                      ${Math.round(displayMonthly).toLocaleString()}
                    </span>
                    <span className="text-white/40 text-sm">/mo</span>
                  </motion.div>
                </AnimatePresence>
                {annual && (
                  <p className="text-sm text-white/40 mt-1">
                    ${Math.round(displayMonthly * 12).toLocaleString()} billed annually
                  </p>
                )}
              </div>

              <Separator className="bg-white/10" />

              {/* Line items */}
              <div className="space-y-2.5">
                <LineItem
                  label={`${pricing.plan.name} (rooftop)`}
                  value={`$${pricing.basePlan}`}
                />
                <LineItem
                  label={`${state.vins} VINs × $${pricing.plan.pricePerVin}`}
                  value={`$${Math.round(pricing.vinCost)}`}
                />
                {pricing.addOnBreakdown.map((item) => (
                  <LineItem key={item.name} label={item.name} value={`$${item.price}`} />
                ))}
                {annual && (
                  <LineItem
                    label="Annual discount (2 months free)"
                    value={`-$${Math.round(pricing.monthlyTotal * 2)}`}
                    highlight
                  />
                )}
              </div>

              <Separator className="bg-white/10" />

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <MetricBox
                  icon={<BarChart3 className="w-3.5 h-3.5" />}
                  label="Blended / VIN"
                  value={`$${pricing.blendedPerVin.toFixed(2)}`}
                />
                <MetricBox
                  icon={<Zap className="w-3.5 h-3.5" />}
                  label="Annual total"
                  value={`$${Math.round(displayMonthly * 12 / 1000)}k`}
                />
              </div>

              <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 font-semibold text-sm transition-all shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 group">
                Get Started
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <p className="text-center text-xs text-white/30">
                No credit card required · Cancel anytime
              </p>
            </div>

            {/* Included features */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-3.5 h-3.5 text-white/30" />
                <span className="text-xs text-white/40 font-medium">
                  What&apos;s included in {pricing.plan.name}
                </span>
              </div>
              <div className="space-y-2">
                {pricing.plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                    <span className="text-xs text-white/50">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfigCard({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: step * 0.05 }}
      className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-400">
          {step}
        </div>
        <h2 className="font-semibold text-sm text-white/80">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

function LineItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-white/50">{label}</span>
      <span className={cn("text-sm font-medium tabular-nums", highlight ? "text-emerald-400" : "text-white/80")}>
        {value}
      </span>
    </div>
  );
}

function MetricBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
      <div className="flex items-center gap-1.5 text-white/30 mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-lg font-bold tabular-nums">{value}</span>
    </div>
  );
}
