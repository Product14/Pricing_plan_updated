"use client";

import { useState, useMemo } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const VINS = [50, 100, 200, 300, 400] as const;
type VinTier = (typeof VINS)[number];
type Plan = "lite" | "pro";

const PRICING = {
  base: {
    lite: { 50: 199,  100: 349,  200: 599,  300: 749,  400: 799  },
    pro:  { 50: 499,  100: 849,  200: 1499, 300: 1899, 400: 1999 },
  },
  instant: {
    lite: { 50: 298,  100: 598,  200: 748,  300: 748,  400: 748  },
    pro:  { 50: 298,  100: 598,  200: 748,  300: 748,  400: 748  },
  },
  create: {
    lite: { 50: 199,  100: 349,  200: 599,  300: 749,  400: 799  },
    pro:  { 50: 499,  100: 849,  200: 1499, 300: 1899, 400: 1999 },
  },
  publish: {
    lite: { 50: 99,   100: 179,  200: 299,  300: 399,  400: 449  },
    pro:  { 50: 149,  100: 249,  200: 399,  300: 499,  400: 549  },
  },
  frame: {
    lite: { 50: 0,    100: 0,    200: 0,    300: 0,    400: 0    },
    pro:  { 50: 0,    100: 0,    200: 0,    300: 0,    400: 0    },
  },
  promote: {
    lite: { 50: 374,  100: 524,  200: 749,  300: 974,  400: 1199 },
    pro:  { 50: 374,  100: 524,  200: 749,  300: 974,  400: 1199 },
  },
} as const;

const PER_VIN = {
  base: {
    lite: { 50: 3.98, 100: 3.49, 200: 3.00, 300: 2.50, 400: 2.00 },
    pro:  { 50: 9.98, 100: 8.49, 200: 7.50, 300: 6.33, 400: 5.00 },
  },
  instant: { 50: 5.94, 100: 5.98, 200: 3.76, 300: 2.50, 400: 1.86 },
  create: {
    lite: { 50: 3.98, 100: 3.49, 200: 3.00, 300: 2.50, 400: 2.00 },
    pro:  { 50: 9.98, 100: 8.49, 200: 7.50, 300: 6.33, 400: 5.00 },
  },
  publish: { 50: 1.98, 100: 1.79, 200: 1.50, 300: 1.33, 400: 1.12 },
  frame:   { 50: 0,    100: 0,    200: 0,    300: 0,    400: 0    },
  promote: { 50: 7.47, 100: 5.24, 200: 3.75, 300: 3.24, 400: 3.00 },
} as const;

const PRODUCTS = [
  {
    id: "instant",
    name: "Studio Instant",
    tagline: "AI background removal & instant photo delivery",
    icon: "ti-bolt",
    color: "#6366f1",
  },
  {
    id: "create",
    name: "Studio Create",
    tagline: "AI-powered studio-quality car photography",
    icon: "ti-camera",
    color: "#0ea5e9",
  },
  {
    id: "publish",
    name: "Studio Publish",
    tagline: "One-click publishing to 30+ automotive marketplaces",
    icon: "ti-send",
    color: "#10b981",
  },
  {
    id: "frame",
    name: "Studio Frame",
    tagline: "360° spin & multi-angle frame capture",
    icon: "ti-rotate-360",
    color: "#f59e0b",
  },
  {
    id: "promote",
    name: "Studio Promote",
    tagline: "Automated ad campaigns across digital channels",
    icon: "ti-speakerphone",
    color: "#ef4444",
  },
] as const;

type ProductId = (typeof PRODUCTS)[number]["id"];

// ─── Component ────────────────────────────────────────────────────────────────

export default function StudioOSCalculator() {
  const [plan, setPlan] = useState<Plan>("lite");
  const [vins, setVins] = useState<VinTier>(50);
  const [enabled, setEnabled] = useState<Set<ProductId>>(new Set());

  const toggleProduct = (id: ProductId) => {
    setEnabled((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const breakdown = useMemo(() => {
    const base = PRICING.base[plan][vins];
    const basePerVin = PER_VIN.base[plan][vins];

    const items = PRODUCTS.map((p) => {
      const price = (PRICING[p.id] as Record<Plan, Record<VinTier, number>>)[plan][vins];
      const pvEntry = PER_VIN[p.id] as Record<Plan, Record<VinTier, number>> | Record<VinTier, number>;
      const perVin = (50 in pvEntry)
        ? (pvEntry as Record<VinTier, number>)[vins]
        : (pvEntry as Record<Plan, Record<VinTier, number>>)[plan][vins];
      const on = enabled.has(p.id);
      return { ...p, price, perVin, on };
    });

    const addonsTotal = items.filter((i) => i.on).reduce((s, i) => s + i.price, 0);
    const total = base + addonsTotal;
    const blended = total / vins;

    return { base, basePerVin, items, addonsTotal, total, blended };
  }, [plan, vins, enabled]);

  const fmt = (n: number) =>
    "$" + Math.round(n).toLocaleString();

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        .os-root {
          min-height: 100vh;
          background: #f0ede8;
          font-family: 'DM Sans', sans-serif;
          color: #1a1a1a;
          padding: 40px 24px 80px;
        }

        /* ── Header ── */
        .os-header {
          max-width: 1200px;
          margin: 0 auto 32px;
        }
        .os-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: #185FA5;
          margin-bottom: 6px;
        }
        .os-title {
          font-size: 28px;
          font-weight: 700;
          color: #0d0d0d;
          margin: 0 0 4px;
        }
        .os-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        /* ── Config bar ── */
        .os-config {
          max-width: 1200px;
          margin: 0 auto 28px;
          background: #fff;
          border: 1px solid #e5e2dc;
          border-radius: 14px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 32px;
          flex-wrap: wrap;
        }
        .os-config-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
          min-width: 160px;
        }
        .os-config-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: #9ca3af;
        }
        .os-plan-toggle {
          display: flex;
          background: #f3f2ef;
          border-radius: 8px;
          padding: 3px;
          gap: 2px;
        }
        .os-plan-btn {
          flex: 1;
          padding: 7px 18px;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all .15s;
          background: transparent;
          color: #6b7280;
        }
        .os-plan-btn.active {
          background: #185FA5;
          color: #fff;
          box-shadow: 0 1px 4px rgba(24,95,165,.25);
        }
        .os-vin-select {
          appearance: none;
          border: 1px solid #e5e2dc;
          border-radius: 8px;
          padding: 8px 36px 8px 12px;
          font-size: 14px;
          font-weight: 500;
          color: #1a1a1a;
          background: #f9f8f6 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat right 12px center;
          cursor: pointer;
          font-family: inherit;
        }
        .os-total-pill {
          margin-left: auto;
          text-align: right;
        }
        .os-total-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: #9ca3af;
          margin-bottom: 4px;
        }
        .os-total-value {
          font-size: 28px;
          font-weight: 700;
          color: #185FA5;
          line-height: 1;
        }
        .os-total-sub {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 2px;
        }

        /* ── Two-column body ── */
        .os-body {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 20px;
          align-items: start;
        }
        @media (max-width: 700px) {
          .os-body { grid-template-columns: 1fr; }
        }

        .os-left { display: flex; flex-direction: column; gap: 16px; }
        .os-right { position: sticky; top: 24px; }

        /* ── Section label ── */
        .os-section-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: #9ca3af;
          margin-bottom: 10px;
        }

        /* ── Base plan row ── */
        .os-base-card {
          background: #fff;
          border: 1px solid #e5e2dc;
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .os-base-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #eef6ff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #185FA5;
          font-size: 17px;
          flex-shrink: 0;
        }
        .os-base-name {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
        }
        .os-base-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-left: 8px;
          background: #dcfce7;
          color: #15803d;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 20px;
        }
        .os-base-desc {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 2px;
        }
        .os-base-price {
          margin-left: auto;
          text-align: right;
        }
        .os-base-price-val {
          font-size: 18px;
          font-weight: 700;
          color: #185FA5;
        }
        .os-base-price-sub {
          font-size: 11px;
          color: #9ca3af;
        }

        /* ── Product cards grid ── */
        .os-products {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .os-product-card {
          background: #fff;
          border: 1.5px solid #e5e2dc;
          border-radius: 14px;
          padding: 18px 16px;
          cursor: pointer;
          transition: border-color .15s, box-shadow .15s;
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
          user-select: none;
        }
        .os-product-card:hover {
          border-color: #c5d5e8;
          box-shadow: 0 2px 10px rgba(0,0,0,.06);
        }
        .os-product-card.enabled {
          border-color: #185FA5;
          box-shadow: 0 0 0 3px rgba(24,95,165,.1);
        }

        .os-product-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }
        .os-product-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          flex-shrink: 0;
        }

        /* toggle switch */
        .os-toggle {
          position: relative;
          width: 36px;
          height: 20px;
          flex-shrink: 0;
        }
        .os-toggle input { display: none; }
        .os-toggle-track {
          width: 36px;
          height: 20px;
          background: #d1d5db;
          border-radius: 20px;
          transition: background .2s;
        }
        .os-toggle.on .os-toggle-track { background: #185FA5; }
        .os-toggle-thumb {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 14px;
          height: 14px;
          background: #fff;
          border-radius: 50%;
          transition: transform .2s;
          box-shadow: 0 1px 3px rgba(0,0,0,.2);
        }
        .os-toggle.on .os-toggle-thumb { transform: translateX(16px); }

        .os-product-name {
          font-size: 13px;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.3;
        }
        .os-product-desc {
          font-size: 11px;
          color: #9ca3af;
          line-height: 1.4;
          flex: 1;
        }
        .os-product-price {
          border-top: 1px solid #f3f2ef;
          padding-top: 10px;
          display: flex;
          align-items: baseline;
          justify-content: space-between;
        }
        .os-product-price-val {
          font-size: 17px;
          font-weight: 700;
          color: #1a1a1a;
        }
        .os-product-card.enabled .os-product-price-val { color: #185FA5; }
        .os-product-price-sub {
          font-size: 10px;
          color: #9ca3af;
        }

        /* ── Summary ── */
        .os-summary {
          max-width: 1100px;
          margin: 0 auto;
          background: #fff;
          border: 1px solid #e5e2dc;
          border-radius: 16px;
          overflow: hidden;
        }
        .os-summary-header {
          padding: 18px 24px;
          border-bottom: 1px solid #f0ede8;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .os-summary-title {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: #6b7280;
        }
        .os-summary-plan {
          font-size: 12px;
          font-weight: 600;
          background: #eef6ff;
          color: #185FA5;
          padding: 3px 10px;
          border-radius: 20px;
        }
        .os-summary-body {
          padding: 8px 24px;
        }
        .os-summary-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 0;
          border-bottom: 1px solid #f3f2ef;
          gap: 12px;
        }
        .os-summary-row:last-child { border-bottom: none; }
        .os-summary-row-name {
          font-size: 13px;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .os-summary-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .os-summary-row-price {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a1a;
        }
        .os-summary-footer {
          background: #f9f8f6;
          border-top: 1px solid #e5e2dc;
          padding: 18px 24px;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
        }
        .os-stat {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .os-stat-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .09em;
          text-transform: uppercase;
          color: #9ca3af;
        }
        .os-stat-value {
          font-size: 22px;
          font-weight: 700;
          color: #185FA5;
        }
        .os-stat-sub {
          font-size: 11px;
          color: #9ca3af;
        }
        .os-stat.highlight .os-stat-value { color: #185FA5; }
      `}</style>

      <div className="os-root">
        {/* Header */}
        <div className="os-header">
          <div className="os-eyebrow">Spyne · Pricing Calculator</div>
          <h1 className="os-title">Studio OS</h1>
          <p className="os-subtitle">
            Select your plan and inventory size, then toggle the products you need.
          </p>
        </div>

        {/* Config bar */}
        <div className="os-config">
          {/* Plan */}
          <div className="os-config-group">
            <div className="os-config-label">Plan</div>
            <div className="os-plan-toggle">
              <button
                className={`os-plan-btn${plan === "lite" ? " active" : ""}`}
                onClick={() => setPlan("lite")}
              >
                Studio Lite
              </button>
              <button
                className={`os-plan-btn${plan === "pro" ? " active" : ""}`}
                onClick={() => setPlan("pro")}
              >
                Studio Pro
              </button>
            </div>
          </div>

          {/* Inventory */}
          <div className="os-config-group">
            <div className="os-config-label">Inventory Count (Max VINs)</div>
            <select
              className="os-vin-select"
              value={vins}
              onChange={(e) => setVins(Number(e.target.value) as VinTier)}
            >
              {VINS.map((v) => (
                <option key={v} value={v}>
                  {v} VINs
                </option>
              ))}
            </select>
          </div>

        </div>

        <div className="os-body">
          {/* ── LEFT: products ── */}
          <div className="os-left">
            {/* Base Plan */}
            <div>
              <div className="os-section-label">Base Plan — always included</div>
              <div className="os-base-card">
                <div className="os-base-icon">
                  <i className="ti ti-layout-grid" />
                </div>
                <div>
                  <div className="os-base-name">
                    Base Plan
                    <span className="os-base-tag">
                      <i className="ti ti-check" style={{ fontSize: 10 }} />
                      Always included
                    </span>
                  </div>
                  <div className="os-base-desc">
                    Core platform access · AI processing · Analytics dashboard ·{" "}
                    {plan === "pro" ? "Dedicated account manager" : "Email support"}
                  </div>
                </div>
                <div className="os-base-price">
                  <div className="os-base-price-val">{fmt(breakdown.base)}</div>
                  <div className="os-base-price-sub">
                    ${breakdown.basePerVin.toFixed(2)} / VIN
                  </div>
                </div>
              </div>
            </div>

            {/* Product cards */}
            <div>
              <div className="os-section-label">Add-on products — toggle to include</div>
              <div className="os-products">
                {breakdown.items.map((p) => (
                  <div
                    key={p.id}
                    className={`os-product-card${p.on ? " enabled" : ""}`}
                    onClick={() => toggleProduct(p.id)}
                  >
                    <div className="os-product-top">
                      <div
                        className="os-product-icon"
                        style={{ background: p.color + "18", color: p.color }}
                      >
                        <i className={`ti ${p.icon}`} />
                      </div>
                      <div className={`os-toggle${p.on ? " on" : ""}`}>
                        <div className="os-toggle-track" />
                        <div className="os-toggle-thumb" />
                      </div>
                    </div>
                    <div>
                      <div className="os-product-name">{p.name}</div>
                      <div className="os-product-desc">{p.tagline}</div>
                    </div>
                    <div className="os-product-price">
                      <div className="os-product-price-val">{fmt(p.price)}</div>
                      <div className="os-product-price-sub">
                        ${p.perVin.toFixed(2)} / VIN
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: cost breakdown ── */}
          <div className="os-right">
            <div className="os-summary">
              <div className="os-summary-header">
                <div className="os-summary-title">Cost Breakdown</div>
                <div className="os-summary-plan">
                  Studio {plan === "lite" ? "Lite" : "Pro"} · {vins} VINs
                </div>
              </div>

              <div className="os-summary-body">
                <div className="os-summary-row">
                  <div className="os-summary-row-name">
                    <div className="os-summary-dot" style={{ background: "#185FA5" }} />
                    Base Plan
                  </div>
                  <div className="os-summary-row-price">{fmt(breakdown.base)}</div>
                </div>

                {breakdown.items.filter((i) => i.on).length === 0 && (
                  <div className="os-summary-row">
                    <div className="os-summary-row-name" style={{ color: "#9ca3af", fontStyle: "italic" }}>
                      Toggle products on the left to add them.
                    </div>
                    <div className="os-summary-row-price" style={{ color: "#d1d5db" }}>—</div>
                  </div>
                )}
                {breakdown.items
                  .filter((i) => i.on)
                  .map((i) => (
                    <div key={i.id} className="os-summary-row">
                      <div className="os-summary-row-name">
                        <div className="os-summary-dot" style={{ background: i.color }} />
                        {i.name}
                      </div>
                      <div className="os-summary-row-price">{fmt(i.price)}</div>
                    </div>
                  ))}
              </div>

              <div className="os-summary-footer">
                <div className="os-stat">
                  <div className="os-stat-label">Monthly Total</div>
                  <div className="os-stat-value">{fmt(breakdown.total)}</div>
                  <div className="os-stat-sub">per rooftop / month</div>
                </div>
                <div className="os-stat">
                  <div className="os-stat-label">Annual</div>
                  <div className="os-stat-value">{fmt(breakdown.total * 12)}</div>
                  <div className="os-stat-sub">per rooftop / year</div>
                </div>
                <div className="os-stat">
                  <div className="os-stat-label">Per VIN</div>
                  <div className="os-stat-value">${breakdown.blended.toFixed(2)}</div>
                  <div className="os-stat-sub">blended / month</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
