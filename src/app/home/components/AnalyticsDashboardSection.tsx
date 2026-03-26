'use client';
import React, { useEffect, useRef, useState } from 'react';

const kpis = [
  { label: 'Total Views', value: '2.4M', change: '+18%', up: true },
  { label: 'Cost per Result', value: '$0.12', change: '-23%', up: true },
  { label: 'Avg ROI', value: '3.4x', change: '+0.6x', up: true },
  { label: 'Active Creators', value: '47', change: '+12', up: true },
];

const chartPoints = [18, 32, 28, 45, 40, 62, 55, 78, 70, 90, 85, 100];

export default function AnalyticsDashboardSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = sectionRef?.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          el.classList.add('revealed');
        }
      },
      { threshold: 0.2 }
    );
    observer?.observe(el);
    return () => observer?.disconnect();
  }, []);

  const w = 520;
  const h = 120;
  const pad = 16;
  const points = chartPoints?.map((v, i) => {
    const x = pad + (i / (chartPoints?.length - 1)) * (w - 2 * pad);
    const y = h - pad - (v / 100) * (h - 2 * pad);
    return `${x},${y}`;
  });
  const polyline = points?.join(' ');
  const areaPath = `M${points?.[0]} L${points?.slice(1)?.join(' L')} L${w - pad},${h - pad} L${pad},${h - pad} Z`;

  return (
    <section className="section-padding bg-bg-alt">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="badge badge-primary mb-4">Analytics</span>
          <h2 className="font-display text-[32px] lg:text-[40px] font-700 text-heading tracking-tight leading-tight">
            Your campaign dashboard,<br />always live
          </h2>
          <p className="text-[17px] text-sub mt-4">
            Every metric you need, updated hourly. No more waiting for agency reports.
          </p>
        </div>

        <div
          ref={sectionRef}
          className="scroll-reveal bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden"
        >
          {/* Dashboard header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-3 text-sm font-semibold text-sub">ViralBridgge Dashboard — Q1 2026</span>
            </div>
            <span className="badge badge-primary text-xs">
              <span className="live-dot" />
              Live
            </span>
          </div>

          <div className="p-6">
            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {kpis?.map((k, i) => (
                <div key={i} className="bg-bg-base rounded-xl p-4">
                  <p className="text-xs text-muted mb-1">{k?.label}</p>
                  <p className="font-display text-[24px] font-700 text-heading">{k?.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <svg
                      width="12" height="12" viewBox="0 0 12 12" fill="none"
                      className={k?.up ? 'text-green-500' : 'text-red-500'}
                    >
                      <path d={k?.up ? 'M6 9V3M3 6l3-3 3 3' : 'M6 3v6M3 6l3 3 3-3'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className={`text-xs font-semibold ${k?.up ? 'text-green-500' : 'text-red-500'}`}>{k?.change}</span>
                    <span className="text-xs text-muted">vs last month</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="bg-bg-base rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-heading">Campaign Views Over Time</p>
                <div className="flex items-center gap-4 text-xs text-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-primary inline-block rounded" />
                    Views
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-cta inline-block rounded" />
                    Engagement
                  </span>
                </div>
              </div>
              <svg
                viewBox={`0 0 ${w} ${h}`}
                className="w-full h-28"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4E40F1" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#4E40F1" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={areaPath} fill="url(#areaGrad2)" />
                <polyline
                  points={polyline}
                  fill="none"
                  stroke="#4E40F1"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="600"
                  strokeDashoffset={drawn ? '0' : '600'}
                  style={{ transition: 'stroke-dashoffset 1.6s ease-out' }}
                />
                {chartPoints?.map((v, i) => {
                  const x = pad + (i / (chartPoints?.length - 1)) * (w - 2 * pad);
                  const y = h - pad - (v / 100) * (h - 2 * pad);
                  return <circle key={i} cx={x} cy={y} r="3.5" fill="white" stroke="#4E40F1" strokeWidth="2" />;
                })}
              </svg>
              {/* X axis labels */}
              <div className="flex justify-between mt-2 px-4">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']?.map((m) => (
                  <span key={m} className="text-[10px] text-muted">{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}