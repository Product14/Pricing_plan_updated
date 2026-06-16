"use client";

import { useState, useMemo, useCallback } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const VINS = [50, 100, 200, 300, 400] as const;
type VinTier = (typeof VINS)[number];
type Plan = "lite" | "pro";

const PRICING = {
  base: {
    lite: { 50: 199, 100: 349, 200: 599, 300: 749, 400: 799 },
    pro:  { 50: 499, 100: 849, 200: 1499, 300: 1899, 400: 1999 },
  },
  smNew: { 50: 149, 100: 299, 200: 374, 300: 374, 400: 374 },
  smOld: { 50: 149, 100: 299, 200: 374, 300: 374, 400: 374 },
  sc:    { 50: 374, 100: 524, 200: 749, 300: 974, 400: 1199 },
} as const;

const PER_VIN = {
  base: {
    lite: { 50: 3.98, 100: 3.49, 200: 3.0,  300: 2.5,  400: 2.0  },
    pro:  { 50: 9.98, 100: 8.49, 200: 7.5,  300: 6.33, 400: 5.0  },
  },
  smNew: { 50: 2.97, 100: 2.99, 200: 1.88, 300: 1.25, 400: 0.93 },
  smOld: { 50: 2.97, 100: 2.99, 200: 1.88, 300: 1.25, 400: 0.93 },
  sc:    { 50: 7.47, 100: 5.24, 200: 3.75, 300: 3.24, 400: 3.0  },
} as const;

function fmt(n: number) {
  return "$" + n.toLocaleString("en-US");
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function PricingCalculator() {
  const [vins, setVins]   = useState<VinTier>(50);
  const [plan, setPlan]   = useState<Plan>("lite");
  const [sm, setSm]       = useState(false);
  const [sc, setSc]       = useState(false);
  const [smOpen, setSmOpen] = useState(false);
  const [scOpen, setScOpen] = useState(false);

  const bp    = PRICING.base[plan][vins];
  const bpv   = PER_VIN.base[plan][vins];
  const smTotal = sm ? PRICING.smNew[vins] + PRICING.smOld[vins] : 0;
  const scTotal = sc ? PRICING.sc[vins] : 0;
  const total   = bp + smTotal + scTotal;
  const blended = (total / vins).toFixed(2);

  const selectCell = useCallback((v: VinTier, p: Plan) => {
    setVins(v); setPlan(p);
  }, []);

  const toggleSm = (checked: boolean) => {
    setSm(checked);
    if (!checked) setSmOpen(false);
  };

  const toggleSc = (checked: boolean) => {
    setSc(checked);
    if (!checked) setScOpen(false);
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .pc-wrap {
          font-family: 'DM Sans', sans-serif;
          background: #f8f7f4;
          color: #1a1a1a;
          min-height: 100vh;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 2rem 1rem;
        }
        .pc-page { width: 100%; max-width: 640px; }
        .pc-header { margin-bottom: 2rem; }
        .pc-header h1 { font-size: 26px; font-weight: 600; margin-bottom: 4px; }
        .pc-header p  { font-size: 14px; color: #555; }
        .pc-section { margin-bottom: 1.75rem; }
        .pc-step-label {
          font-size: 11px; font-weight: 600; color: #999;
          letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px;
        }

        /* Plan table */
        .pc-table {
          width: 100%; border-collapse: collapse; background: #fff;
          border-radius: 14px; overflow: hidden; border: 1px solid rgba(0,0,0,0.10);
        }
        .pc-table th {
          padding: 10px 16px; font-size: 12px; font-weight: 600; color: #999;
          text-transform: uppercase; letter-spacing: 0.06em; text-align: center;
          background: #f1f0ed; border-bottom: 1px solid rgba(0,0,0,0.10);
        }
        .pc-table th:first-child { text-align: left; width: 110px; }
        .pc-table td { padding: 0; border-bottom: 1px solid rgba(0,0,0,0.10); text-align: center; }
        .pc-table tr:last-child td { border-bottom: none; }
        .pc-table td:first-child {
          padding: 12px 16px; font-size: 13px; font-weight: 600; color: #555;
          text-align: left; background: #f1f0ed; border-right: 1px solid rgba(0,0,0,0.10);
        }
        .pc-col-divider { border-left: 1px solid rgba(0,0,0,0.10); }

        .pc-cell {
          display: block; width: 100%; padding: 12px 16px; cursor: pointer;
          font-size: 13px; color: #555; transition: background 0.12s; text-align: center;
          background: none; border: none; font-family: inherit; position: relative;
        }
        .pc-cell:hover { background: #e6f1fb; color: #0c447c; }
        .pc-cell.selected { background: #e6f1fb; color: #0c447c; font-weight: 600; }
        .pc-cell.selected::after {
          content: '✓'; position: absolute; right: 10px; top: 50%;
          transform: translateY(-50%); font-size: 12px; color: #185FA5;
        }
        .pc-cell-price { font-size: 13px; font-weight: 600; display: block; }

        /* Mini addon table */
        .pc-mini-table {
          width: 100%; border-collapse: collapse; font-size: 12px;
          border-radius: 8px; overflow: hidden; border: 1px solid rgba(0,0,0,0.10);
        }
        .pc-mini-table th {
          padding: 6px 10px; font-size: 11px; font-weight: 600; color: #999;
          text-transform: uppercase; letter-spacing: 0.05em; text-align: center;
          background: #f1f0ed; border-bottom: 1px solid rgba(0,0,0,0.10);
        }
        .pc-mini-table th:first-child { text-align: left; width: 80px; }
        .pc-mini-table td {
          padding: 7px 10px; border-bottom: 1px solid rgba(0,0,0,0.10);
          text-align: center; color: #555; font-size: 12px;
        }
        .pc-mini-table tr:last-child td { border-bottom: none; }
        .pc-mini-table td:first-child {
          text-align: left; font-weight: 600;
          background: #f1f0ed; border-right: 1px solid rgba(0,0,0,0.10);
        }
        .pc-mini-table td.active { background: #e6f1fb; color: #0c447c; font-weight: 600; }

        /* Feature cards */
        .pc-card {
          background: #fff; border: 1px solid rgba(0,0,0,0.10);
          border-radius: 14px; padding: 1rem 1.25rem; margin-bottom: 10px;
        }
        .pc-card.included { background: #eaf3de; border-color: rgba(59,109,17,0.25); }
        .pc-card.active   { border: 2px solid #185FA5; }

        .pc-card-header { display: flex; align-items: center; justify-content: space-between; }
        .pc-card-name   { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 500; }
        .pc-card-right  { display: flex; align-items: center; gap: 12px; }

        .pc-badge {
          font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 20px;
        }
        .pc-badge-included { background: #eaf3de; color: #3B6D11; border: 1px solid rgba(59,109,17,0.3); }
        .pc-badge-addon    { background: #e6f1fb; color: #0c447c; border: 1px solid rgba(24,95,165,0.3); }

        .pc-price { font-size: 14px; font-weight: 600; color: #0c447c; min-width: 70px; text-align: right; }
        .pc-price.muted { color: #999; }

        /* Toggle */
        .pc-toggle { position: relative; width: 40px; height: 22px; cursor: pointer; flex-shrink: 0; }
        .pc-toggle input { opacity: 0; width: 0; height: 0; position: absolute; }
        .pc-toggle-track {
          position: absolute; inset: 0; border-radius: 20px;
          background: #d0d0d0; transition: background 0.2s;
        }
        .pc-toggle input:checked ~ .pc-toggle-track { background: #185FA5; }
        .pc-toggle-thumb {
          position: absolute; left: 3px; top: 3px; width: 16px; height: 16px;
          border-radius: 50%; background: white; transition: transform 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2); pointer-events: none;
        }
        .pc-toggle input:checked ~ .pc-toggle-track .pc-toggle-thumb { transform: translateX(18px); }

        /* Expand section */
        .pc-expand { display: none; margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.10); }
        .pc-expand.open { display: block; }
        .pc-hint { font-size: 11px; color: #999; display: flex; align-items: center; gap: 4px; margin-bottom: 10px; }
        .pc-expand-label { font-size: 11px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }

        .pc-chevron { font-size: 13px; color: #999; transition: transform 0.2s; display: inline-block; }
        .pc-chevron.open { transform: rotate(180deg); }

        /* Summary */
        .pc-summary {
          background: #f1f0ed; border-radius: 14px; padding: 1.25rem; margin-bottom: 12px;
        }
        .pc-summary-title {
          font-size: 12px; font-weight: 600; color: #999;
          text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px;
        }
        .pc-sum-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 5px 0; font-size: 14px; color: #555;
        }
        .pc-sum-total {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 20px; font-weight: 600; color: #1a1a1a;
          border-top: 1px solid rgba(0,0,0,0.20); margin-top: 10px; padding-top: 12px;
        }
        .pc-pervin { font-size: 12px; color: #999; margin-top: 6px; text-align: right; }

        @media (max-width: 480px) {
          .pc-wrap { padding: 1rem 0.75rem; }
          .pc-header h1 { font-size: 22px; }
        }
      `}</style>

      <div className="pc-wrap">
        <div className="pc-page">

          {/* Header */}
          <div className="pc-header">
            <h1>Pricing Calculator</h1>
            <p>Configure your plan and see real-time cost breakdown with AI-powered insights.</p>
          </div>

          {/* Step 1 — Plan table */}
          <div className="pc-section">
            <div className="pc-step-label">Step 1 — Select Max VINs &amp; plan</div>
            <table className="pc-table">
              <thead>
                <tr>
                  <th>Max VINs</th>
                  <th colSpan={2}>Studio Lite</th>
                  <th colSpan={2} className="pc-col-divider">Studio Pro</th>
                </tr>
                <tr>
                  <th></th>
                  <th style={{ fontSize: 11, fontWeight: 500 }}>Price / Rooftop</th>
                  <th style={{ fontSize: 11, fontWeight: 500 }}>Price / VIN</th>
                  <th style={{ fontSize: 11, fontWeight: 500 }} className="pc-col-divider">Price / Rooftop</th>
                  <th style={{ fontSize: 11, fontWeight: 500 }}>Price / VIN</th>
                </tr>
              </thead>
              <tbody>
                {VINS.map((v) => {
                  const lSel = vins === v && plan === "lite";
                  const pSel = vins === v && plan === "pro";
                  return (
                    <tr key={v}>
                      <td>{v}</td>
                      <td>
                        <button className={`pc-cell${lSel ? " selected" : ""}`} onClick={() => selectCell(v, "lite")}>
                          <span className="pc-cell-price">{fmt(PRICING.base.lite[v])}</span>
                        </button>
                      </td>
                      <td>
                        <button className={`pc-cell${lSel ? " selected" : ""}`} onClick={() => selectCell(v, "lite")}>
                          <span className="pc-cell-price">${PER_VIN.base.lite[v].toFixed(2)}</span>
                        </button>
                      </td>
                      <td className="pc-col-divider">
                        <button className={`pc-cell${pSel ? " selected" : ""}`} onClick={() => selectCell(v, "pro")}>
                          <span className="pc-cell-price">{fmt(PRICING.base.pro[v])}</span>
                        </button>
                      </td>
                      <td>
                        <button className={`pc-cell${pSel ? " selected" : ""}`} onClick={() => selectCell(v, "pro")}>
                          <span className="pc-cell-price">${PER_VIN.base.pro[v].toFixed(2)}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Step 2 — Features */}
          <div className="pc-section">
            <div className="pc-step-label">Step 2 — Features</div>

            {/* Base plan */}
            <div className="pc-card included">
              <div className="pc-card-header">
                <div className="pc-card-name">
                  <i className="ti ti-layout-grid" style={{ fontSize: 18, color: "#3B6D11" }} />
                  Base Plan
                  <span className="pc-badge pc-badge-included">Always included</span>
                </div>
                <div className="pc-price">{fmt(bp)}</div>
              </div>
              <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                ${bpv.toFixed(2)} per VIN
              </div>
            </div>

            {/* Studio Instant */}
            <div className={`pc-card${sm ? " active" : ""}`}>
              <div
                className="pc-card-header"
                onClick={() => sm && setSmOpen((o) => !o)}
                style={{ cursor: sm ? "pointer" : "default" }}
              >
                <div className="pc-card-name">
                  <i className="ti ti-brain" style={{ fontSize: 18, color: sm ? "#185FA5" : "#999" }} />
                  Studio Instant
                  <span className="pc-badge pc-badge-addon">Add-on</span>
                  {sm && <span className={`pc-chevron${smOpen ? " open" : ""}`}>▾</span>}
                </div>
                <div className="pc-card-right">
                  <div className={`pc-price${sm ? "" : " muted"}`}>
                    {sm ? fmt(smTotal) : "$0"}
                  </div>
                  <label className="pc-toggle" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={sm} onChange={(e) => toggleSm(e.target.checked)} />
                    <div className="pc-toggle-track"><div className="pc-toggle-thumb" /></div>
                  </label>
                </div>
              </div>
              <div className={`pc-expand${smOpen ? " open" : ""}`}>
                <div className="pc-hint">
                  <i className="ti ti-table" style={{ fontSize: 14 }} /> All-tier pricing
                </div>
                <div className="pc-expand-label">Studio Instant — New + Pre-owned</div>
                <AddonTable pricing={PRICING.smNew} perVin={PER_VIN.smNew} activeVin={vins} combine={PRICING.smOld} combinePerVin={PER_VIN.smOld} />
              </div>
            </div>

            {/* Studio Promote */}
            <div className={`pc-card${sc ? " active" : ""}`}>
              <div
                className="pc-card-header"
                onClick={() => sc && setScOpen((o) => !o)}
                style={{ cursor: sc ? "pointer" : "default" }}
              >
                <div className="pc-card-name">
                  <i className="ti ti-speakerphone" style={{ fontSize: 18, color: sc ? "#185FA5" : "#999" }} />
                  Studio Promote
                  <span className="pc-badge pc-badge-addon">Add-on</span>
                  {sc && <span className={`pc-chevron${scOpen ? " open" : ""}`}>▾</span>}
                </div>
                <div className="pc-card-right">
                  <div className={`pc-price${sc ? "" : " muted"}`}>
                    {sc ? fmt(scTotal) : "$0"}
                  </div>
                  <label className="pc-toggle" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={sc} onChange={(e) => toggleSc(e.target.checked)} />
                    <div className="pc-toggle-track"><div className="pc-toggle-thumb" /></div>
                  </label>
                </div>
              </div>
              <div className={`pc-expand${scOpen ? " open" : ""}`}>
                <div className="pc-hint">
                  <i className="ti ti-table" style={{ fontSize: 14 }} /> All-tier pricing
                </div>
                <AddonTable pricing={PRICING.sc} perVin={PER_VIN.sc} activeVin={vins} />
              </div>
            </div>
          </div>

          {/* Cost breakdown */}
          <div className="pc-section">
            <div className="pc-summary">
              <div className="pc-summary-title">Cost breakdown</div>
              <div className="pc-sum-row"><span>Base plan</span><span>{fmt(bp)}</span></div>
              {sm && (
                <div className="pc-sum-row">
                  <span>Studio Instant (New + Pre-owned)</span>
                  <span>{fmt(smTotal)}</span>
                </div>
              )}
              {sc && (
                <div className="pc-sum-row">
                  <span>Studio Promote</span>
                  <span>{fmt(scTotal)}</span>
                </div>
              )}
              <div className="pc-sum-total">
                <span>Monthly total</span>
                <span>{fmt(total)}</span>
              </div>
              <div className="pc-pervin">Blended: ${blended} per VIN</div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

// ─── Addon Table ─────────────────────────────────────────────────────────────

type TierPricing = Record<number, number>;

function AddonTable({
  pricing,
  perVin,
  activeVin,
  combine,
  combinePerVin,
}: {
  pricing: TierPricing;
  perVin: TierPricing;
  activeVin: number;
  combine?: TierPricing;
  combinePerVin?: TierPricing;
}) {
  return (
    <table className="pc-mini-table">
      <thead>
        <tr>
          <th>Max VINs</th>
          <th>Price / Rooftop</th>
          <th>Price / VIN</th>
        </tr>
      </thead>
      <tbody>
        {VINS.map((v) => {
          const price  = combine ? pricing[v] + combine[v] : pricing[v];
          const pv     = combinePerVin ? perVin[v] + combinePerVin[v] : perVin[v];
          const active = v === activeVin;
          return (
            <tr key={v}>
              <td>{v}</td>
              <td className={active ? "active" : ""}>${price}</td>
              <td className={active ? "active" : ""}>${pv.toFixed(2)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
