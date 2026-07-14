"use client";

import { useState, useMemo } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const VINS = [50, 100, 200, 300, 400] as const;
type VinTier = (typeof VINS)[number];
type Plan = "lite" | "pro";

const PRICING = {
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
  { id: "instant", name: "Studio Instant", tagline: "AI background removal & instant photo delivery", icon: "ti-bolt", color: "#6366f1" },
  { id: "create",  name: "Studio Create",  tagline: "AI-powered studio-quality car photography",      icon: "ti-camera", color: "#0ea5e9" },
  { id: "publish", name: "Studio Publish", tagline: "One-click publishing to 30+ automotive marketplaces", icon: "ti-send", color: "#10b981" },
  { id: "frame",   name: "Studio Frame",   tagline: "360° spin & multi-angle frame capture",           icon: "ti-rotate-360", color: "#f59e0b" },
  { id: "promote", name: "Studio Promote", tagline: "Automated ad campaigns across digital channels",  icon: "ti-speakerphone", color: "#ef4444" },
] as const;

type ProductId = (typeof PRODUCTS)[number]["id"];

// ─── Component ────────────────────────────────────────────────────────────────

export default function StudioOSCalculator() {
  const [plan, setPlan] = useState<Plan>("lite");
  const [vins, setVins] = useState<VinTier>(50);
  const [enabled, setEnabled] = useState<Set<ProductId>>(new Set());
  const [expanded, setExpanded] = useState<Set<ProductId>>(new Set());

  const toggleProduct = (id: ProductId) => {
    setEnabled((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleExpand = (id: ProductId, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const getPrice = (id: ProductId, p: Plan, v: VinTier): number =>
    (PRICING[id] as Record<Plan, Record<VinTier, number>>)[p][v];

  const getPerVin = (id: ProductId, p: Plan, v: VinTier): number => {
    const pv = PER_VIN[id] as Record<Plan, Record<VinTier, number>> | Record<VinTier, number>;
    return (50 in pv)
      ? (pv as Record<VinTier, number>)[v]
      : (pv as Record<Plan, Record<VinTier, number>>)[p][v];
  };

  const breakdown = useMemo(() => {
    const items = PRODUCTS.map((p) => ({
      ...p,
      price: getPrice(p.id, plan, vins),
      perVin: getPerVin(p.id, plan, vins),
      on: enabled.has(p.id),
    }));
    const total = items.filter((i) => i.on).reduce((s, i) => s + i.price, 0);
    const blended = vins > 0 && total > 0 ? total / vins : 0;
    return { items, total, blended };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, vins, enabled]);

  const fmt = (n: number) => "$" + Math.round(n).toLocaleString();

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

        .os-header { max-width: 1200px; margin: 0 auto 24px; }
        .os-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: #185FA5; margin-bottom: 6px; }
        .os-title { font-size: 28px; font-weight: 700; color: #0d0d0d; margin: 0 0 4px; }
        .os-subtitle { font-size: 14px; color: #6b7280; margin: 0; }

        /* ── Config bar ── */
        .os-config {
          max-width: 1200px; margin: 0 auto 24px;
          background: #fff; border: 1px solid #e5e2dc; border-radius: 14px;
          padding: 18px 24px; display: flex; align-items: center; gap: 32px; flex-wrap: wrap;
        }
        .os-config-group { display: flex; flex-direction: column; gap: 6px; }
        .os-config-label { font-size: 11px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #9ca3af; }
        .os-plan-toggle { display: flex; background: #f3f2ef; border-radius: 8px; padding: 3px; gap: 2px; }
        .os-plan-btn {
          padding: 7px 22px; border: none; border-radius: 6px; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all .15s; background: transparent; color: #6b7280; font-family: inherit;
        }
        .os-plan-btn.active { background: #185FA5; color: #fff; box-shadow: 0 1px 4px rgba(24,95,165,.25); }
        .os-vin-select {
          appearance: none; border: 1px solid #e5e2dc; border-radius: 8px; padding: 8px 36px 8px 12px;
          font-size: 14px; font-weight: 500; color: #1a1a1a; font-family: inherit;
          background: #f9f8f6 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat right 12px center;
          cursor: pointer; min-width: 140px;
        }

        /* ── Two-column body ── */
        .os-body {
          max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 360px; gap: 20px; align-items: start;
        }
        @media (max-width: 700px) { .os-body { grid-template-columns: 1fr; } }

        .os-left { display: flex; flex-direction: column; gap: 0; }
        .os-right { position: sticky; top: 24px; }

        .os-section-label {
          font-size: 11px; font-weight: 600; letter-spacing: .1em;
          text-transform: uppercase; color: #9ca3af; margin-bottom: 12px;
        }

        /* ── Product card ── */
        .os-card {
          background: #fff;
          border: 1.5px solid #e5e2dc;
          border-radius: 0;
          overflow: hidden;
          transition: border-color .15s;
        }
        .os-card:first-child { border-radius: 14px 14px 0 0; }
        .os-card:last-child  { border-radius: 0 0 14px 14px; }
        .os-card:only-child  { border-radius: 14px; }
        .os-card + .os-card  { border-top: none; }
        .os-card.enabled { border-color: #185FA5; z-index: 1; position: relative; }
        .os-card.enabled + .os-card { border-top: 1.5px solid #185FA5; }

        /* card header row */
        .os-card-header {
          display: flex; align-items: center; gap: 14px;
          padding: 16px 20px; cursor: pointer; user-select: none;
        }
        .os-card-icon {
          width: 36px; height: 36px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; flex-shrink: 0;
        }
        .os-card-meta { flex: 1; min-width: 0; }
        .os-card-name { font-size: 14px; font-weight: 700; color: #1a1a1a; }
        .os-card-tagline { font-size: 12px; color: #9ca3af; margin-top: 2px; }
        .os-card-right { display: flex; align-items: center; gap: 16px; flex-shrink: 0; }
        .os-card-price { text-align: right; }
        .os-card-price-val { font-size: 17px; font-weight: 700; color: #1a1a1a; }
        .os-card.enabled .os-card-price-val { color: #185FA5; }
        .os-card-price-sub { font-size: 11px; color: #9ca3af; }

        /* toggle */
        .os-toggle { position: relative; width: 38px; height: 22px; flex-shrink: 0; }
        .os-toggle-track { width: 38px; height: 22px; background: #d1d5db; border-radius: 22px; transition: background .2s; }
        .os-toggle.on .os-toggle-track { background: #185FA5; }
        .os-toggle-thumb {
          position: absolute; top: 4px; left: 4px; width: 14px; height: 14px;
          background: #fff; border-radius: 50%; transition: transform .2s;
          box-shadow: 0 1px 3px rgba(0,0,0,.2);
        }
        .os-toggle.on .os-toggle-thumb { transform: translateX(16px); }

        /* expand chevron */
        .os-chevron {
          width: 28px; height: 28px; border-radius: 6px; border: 1px solid #e5e2dc;
          display: flex; align-items: center; justify-content: center;
          color: #9ca3af; font-size: 13px; transition: background .15s, color .15s;
          flex-shrink: 0; cursor: pointer;
        }
        .os-chevron:hover { background: #f3f2ef; color: #374151; }
        .os-chevron.open { background: #eef6ff; color: #185FA5; border-color: #185FA5; }

        /* pricing table */
        .os-table-wrap {
          border-top: 1px solid #f0ede8;
          overflow: hidden;
          max-height: 0;
          transition: max-height .25s ease;
        }
        .os-table-wrap.open { max-height: 400px; }
        .os-table { width: 100%; border-collapse: collapse; }
        .os-table thead tr { background: #f9f8f6; }
        .os-table th {
          font-size: 10px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase;
          color: #9ca3af; padding: 10px 20px; text-align: left;
        }
        .os-table th:not(:first-child) { text-align: right; }
        .os-table td { padding: 10px 20px; font-size: 13px; color: #374151; border-top: 1px solid #f3f2ef; }
        .os-table td:not(:first-child) { text-align: right; font-weight: 500; }
        .os-table tr.active-row td { background: #f0f6ff; }
        .os-table tr.active-row td:nth-child(2) { color: #185FA5; font-weight: 700; }
        .os-table tr.active-row td:nth-child(3) { color: #185FA5; font-weight: 700; }
        .os-table td:first-child { font-weight: 600; color: #1a1a1a; }

        /* ── Summary ── */
        .os-summary {
          background: #fff; border: 1px solid #e5e2dc; border-radius: 16px; overflow: hidden;
        }
        .os-summary-header {
          padding: 16px 20px; border-bottom: 1px solid #f0ede8;
          display: flex; align-items: center; justify-content: space-between;
        }
        .os-summary-title { font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #6b7280; }
        .os-summary-plan { font-size: 12px; font-weight: 600; background: #eef6ff; color: #185FA5; padding: 3px 10px; border-radius: 20px; }
        .os-summary-body { padding: 6px 20px; }
        .os-summary-empty { padding: 16px 0; font-size: 13px; color: #9ca3af; font-style: italic; }
        .os-summary-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 0; border-bottom: 1px solid #f3f2ef; gap: 12px;
        }
        .os-summary-row:last-child { border-bottom: none; }
        .os-summary-row-name { font-size: 13px; color: #374151; display: flex; align-items: center; gap: 8px; }
        .os-summary-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .os-summary-row-price { font-size: 13px; font-weight: 600; color: #1a1a1a; }
        .os-summary-footer {
          background: #f9f8f6; border-top: 1px solid #e5e2dc; padding: 16px 20px;
          display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;
        }
        .os-stat { display: flex; flex-direction: column; gap: 3px; }
        .os-stat-label { font-size: 10px; font-weight: 600; letter-spacing: .09em; text-transform: uppercase; color: #9ca3af; }
        .os-stat-value { font-size: 20px; font-weight: 700; color: #185FA5; }
        .os-stat-sub { font-size: 10px; color: #9ca3af; }
        .os-no-selection {
          padding: 28px 20px; text-align: center; color: #9ca3af; font-size: 13px;
        }
      `}</style>

      <div className="os-root">
        {/* Header */}
        <div className="os-header">
          <div className="os-eyebrow">Spyne · Pricing Calculator</div>
          <h1 className="os-title">Studio OS</h1>
          <p className="os-subtitle">Select your plan and inventory size, then toggle the products you need.</p>
        </div>

        {/* Config bar */}
        <div className="os-config">
          <div className="os-config-group">
            <div className="os-config-label">Plan</div>
            <div className="os-plan-toggle">
              <button className={`os-plan-btn${plan === "lite" ? " active" : ""}`} onClick={() => setPlan("lite")}>Studio Lite</button>
              <button className={`os-plan-btn${plan === "pro"  ? " active" : ""}`} onClick={() => setPlan("pro")}>Studio Pro</button>
            </div>
          </div>
          <div className="os-config-group">
            <div className="os-config-label">Inventory Count (Max VINs)</div>
            <select className="os-vin-select" value={vins} onChange={(e) => setVins(Number(e.target.value) as VinTier)}>
              {VINS.map((v) => <option key={v} value={v}>{v} VINs</option>)}
            </select>
          </div>
        </div>

        {/* Two-column body */}
        <div className="os-body">

          {/* LEFT: product cards */}
          <div className="os-left">
            <div className="os-section-label">Add-on products — toggle to include</div>
            <div>
              {breakdown.items.map((p) => {
                const isOpen = expanded.has(p.id);
                return (
                  <div key={p.id} className={`os-card${p.on ? " enabled" : ""}`}>
                    {/* Header row */}
                    <div className="os-card-header" onClick={() => toggleProduct(p.id)}>
                      <div className="os-card-icon" style={{ background: p.color + "18", color: p.color }}>
                        <i className={`ti ${p.icon}`} />
                      </div>
                      <div className="os-card-meta">
                        <div className="os-card-name">{p.name}</div>
                        <div className="os-card-tagline">{p.tagline}</div>
                      </div>
                      <div className="os-card-right">
                        <div className="os-card-price">
                          <div className="os-card-price-val">{fmt(p.price)}</div>
                          <div className="os-card-price-sub">${p.perVin.toFixed(2)} / VIN</div>
                        </div>
                        <div className={`os-toggle${p.on ? " on" : ""}`} onClick={(e) => { e.stopPropagation(); toggleProduct(p.id); }}>
                          <div className="os-toggle-track" />
                          <div className="os-toggle-thumb" />
                        </div>
                        <div className={`os-chevron${isOpen ? " open" : ""}`} onClick={(e) => toggleExpand(p.id, e)}>
                          <i className={`ti ti-chevron-${isOpen ? "up" : "down"}`} />
                        </div>
                      </div>
                    </div>

                    {/* Expandable pricing table */}
                    <div className={`os-table-wrap${isOpen ? " open" : ""}`}>
                      <table className="os-table">
                        <thead>
                          <tr>
                            <th>Max VINs</th>
                            <th>Price / Rooftop</th>
                            <th>Price / VIN</th>
                          </tr>
                        </thead>
                        <tbody>
                          {VINS.map((v) => {
                            const rowPrice  = getPrice(p.id, plan, v);
                            const rowPerVin = getPerVin(p.id, plan, v);
                            return (
                              <tr key={v} className={v === vins ? "active-row" : ""}>
                                <td>{v}</td>
                                <td>{fmt(rowPrice)}</td>
                                <td>${rowPerVin.toFixed(2)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: cost breakdown */}
          <div className="os-right">
            <div className="os-summary">
              <div className="os-summary-header">
                <div className="os-summary-title">Cost Breakdown</div>
                <div className="os-summary-plan">Studio {plan === "lite" ? "Lite" : "Pro"} · {vins} VINs</div>
              </div>

              {breakdown.items.filter((i) => i.on).length === 0 ? (
                <div className="os-no-selection">Toggle products on the left to see pricing.</div>
              ) : (
                <>
                  <div className="os-summary-body">
                    {breakdown.items.filter((i) => i.on).map((i) => (
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
                      <div className="os-stat-label">Monthly</div>
                      <div className="os-stat-value">{fmt(breakdown.total)}</div>
                      <div className="os-stat-sub">per rooftop</div>
                    </div>
                    <div className="os-stat">
                      <div className="os-stat-label">Annual</div>
                      <div className="os-stat-value">{fmt(breakdown.total * 12)}</div>
                      <div className="os-stat-sub">per rooftop</div>
                    </div>
                    <div className="os-stat">
                      <div className="os-stat-label">Per VIN</div>
                      <div className="os-stat-value">${breakdown.blended.toFixed(2)}</div>
                      <div className="os-stat-sub">blended / mo</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
