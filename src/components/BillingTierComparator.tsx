import { useEffect, useState } from 'react';

type Projection = {
  tier: string;
  includedUnits: number;
  basePrice: number;
  overageUnits: number;
  overageCost: number;
  total: number;
};

function fallbackProjections(units: number): Projection[] {
  const plans: Projection[] = [
    {
      tier: 'Free',
      includedUnits: 100_000,
      basePrice: 0,
      overageUnits: Math.max(0, units - 100_000),
      overageCost: Math.max(0, units - 100_000) * 0.00002,
      total: Math.max(0, units - 100_000) * 0.00002,
    },
    {
      tier: 'Builder',
      includedUnits: 1_000_000,
      basePrice: 29,
      overageUnits: Math.max(0, units - 1_000_000),
      overageCost: Math.max(0, units - 1_000_000) * 0.000015,
      total: 29 + Math.max(0, units - 1_000_000) * 0.000015,
    },
    {
      tier: 'Scale',
      includedUnits: 10_000_000,
      basePrice: 199,
      overageUnits: 0,
      overageCost: 0,
      total: 199,
    },
    {
      tier: 'Enterprise',
      includedUnits: 100_000_000,
      basePrice: 999,
      overageUnits: 0,
      overageCost: 0,
      total: 999,
    },
  ];

  return plans.sort((a, b) => a.total - b.total);
}

export default function BillingTierComparator() {
  const [units, setUnits] = useState(2_500_000);
  const [rows, setRows] = useState<Projection[]>([]);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/tiers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ units }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to calculate tier projections');
        }
        return response.json() as Promise<{ projections?: Projection[] }>;
      })
      .then((data) => {
        if (!cancelled) {
          setRows(
            Array.isArray(data.projections)
              ? data.projections
              : fallbackProjections(units),
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRows(fallbackProjections(units));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [units]);

  return (
    <section className="panel p-5">
      <b>Billing tier workbench</b>
      <p className="mt-1 text-xs muted">
        Monthly cost projection across plans
      </p>

      <div className="mt-5 flex justify-between">
        <span className="eyebrow">Monthly volume</span>
        <span className="mono text-cyan-300">
          {(units / 1_000_000).toFixed(2)}M units
        </span>
      </div>

      <input
        className="mt-3"
        type="range"
        min="0"
        max="50000000"
        step="100000"
        value={units}
        onChange={(event) => setUnits(Number(event.target.value))}
      />

      <div className="mt-4 space-y-2">
        {rows.map((row, index) => (
          <div
            className="rounded-lg border border-slate-800 p-3"
            key={row.tier}
          >
            <div className="flex justify-between">
              <b>
                {row.tier}{' '}
                {index === 0 && (
                  <small className="text-violet-300">BEST VALUE</small>
                )}
              </b>
              <span className="mono">${row.total.toFixed(2)}/mo</span>
            </div>
            <div className="mt-2 text-[10px] text-slate-500">
              {row.includedUnits.toLocaleString()} included ·{' '}
              {row.overageUnits.toLocaleString()} overage · $
              {row.overageCost.toFixed(2)} overage charge
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
