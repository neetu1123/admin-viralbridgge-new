import React from 'react';

const STATS = [
  { id: 'proof-1', value: '52,000+', label: 'Verified Creators' },
  { id: 'proof-2', value: '₹18.4M', label: 'Paid to Creators' },
  { id: 'proof-3', value: '1,240+', label: 'Active Campaigns' },
  { id: 'proof-4', value: '94%', label: 'Brand Satisfaction' },
];

const BRAND_LOGOS = [
  { id: 'brand-logo-1', name: 'Glossier', width: 80 },
  { id: 'brand-logo-2', name: 'Headspace', width: 100 },
  { id: 'brand-logo-3', name: 'Allbirds', width: 80 },
  { id: 'brand-logo-4', name: 'Oatly', width: 60 },
  { id: 'brand-logo-5', name: 'Notion', width: 72 },
  { id: 'brand-logo-6', name: 'Calm', width: 56 },
];

export default function SocialProofStrip() {
  return (
    <section className="bg-white border-y border-[#E5E7EB] py-12">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {STATS?.map((stat) => (
            <div key={stat?.id} className="text-center">
              <div className="font-display font-800 text-3xl text-[#1F1F2E] tabular-nums">{stat?.value}</div>
              <div className="text-[#9AA0B4] text-sm font-medium mt-1">{stat?.label}</div>
            </div>
          ))}
        </div>

        {/* Brand logos */}
        <div className="flex flex-col items-center gap-6">
          <p className="text-[#9AA0B4] text-sm font-medium tracking-wide uppercase">
            Trusted by leading brands
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10">
            {BRAND_LOGOS?.map((brand) => (
              <div
                key={brand?.id}
                className="font-display font-700 text-[#9AA0B4] text-lg tracking-tight opacity-60 hover:opacity-90 transition-opacity duration-200 cursor-default select-none"
                style={{ minWidth: brand?.width }}
              >
                {brand?.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}