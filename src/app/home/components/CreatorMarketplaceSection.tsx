'use client';
import React, { useEffect, useRef } from 'react';
import AppImage from '@/src/components/ui/AppImage';

const creators = [
{
  name: 'Ananya Kapoor',
  category: 'Beauty & Skincare',
  followers: '420K',
  engagement: '9.1%',
  src: "https://img.rocket.new/generatedImages/rocket_gen_img_12d00e908-1772206554742.png",
  alt: 'Ananya Kapoor beauty and skincare influencer, smiling headshot',
  tags: ['Skincare', 'Makeup'],
  verified: true
},
{
  name: 'Jordan Davis',
  category: 'Fitness & Health',
  followers: '310K',
  engagement: '7.8%',
  src: "https://img.rocket.new/generatedImages/rocket_gen_img_1aff74711-1763298873016.png",
  alt: 'Jordan Davis fitness and health influencer, professional headshot',
  tags: ['Fitness', 'Nutrition'],
  verified: true
},
{
  name: 'Mei Lin Zhang',
  category: 'Tech & Gadgets',
  followers: '185K',
  engagement: '6.4%',
  src: "https://img.rocket.new/generatedImages/rocket_gen_img_11da40f54-1763293529528.png",
  alt: 'Mei Lin Zhang tech and gadgets influencer, confident headshot',
  tags: ['Tech', 'Reviews'],
  verified: true
},
{
  name: 'Marcus Okafor',
  category: 'Fashion & Style',
  followers: '560K',
  engagement: '11.3%',
  src: "https://img.rocket.new/generatedImages/rocket_gen_img_19b695be3-1763299385413.png",
  alt: 'Marcus Okafor fashion and style influencer, stylish headshot',
  tags: ['Fashion', 'Lifestyle'],
  verified: false
},
{
  name: 'Sofia Reyes',
  category: 'Lifestyle & Travel',
  followers: '230K',
  engagement: '8.7%',
  src: "https://images.unsplash.com/photo-1710969494722-0083a8c8b305",
  alt: 'Sofia Reyes lifestyle and travel influencer, outdoor headshot',
  tags: ['Travel', 'Lifestyle'],
  verified: true
},
{
  name: 'Raj Mehta',
  category: 'Finance & Crypto',
  followers: '142K',
  engagement: '5.9%',
  src: "https://img.rocket.new/generatedImages/rocket_gen_img_15f8b8568-1763295382450.png",
  alt: 'Raj Mehta finance and crypto influencer, professional headshot',
  tags: ['Finance', 'Investing'],
  verified: true
},
{
  name: 'Naomi Clarke',
  category: 'Food & Recipes',
  followers: '390K',
  engagement: '10.2%',
  src: "https://img.rocket.new/generatedImages/rocket_gen_img_1194d4361-1763294462946.png",
  alt: 'Naomi Clarke food and recipe influencer, warm headshot',
  tags: ['Food', 'Cooking'],
  verified: true
},
{
  name: 'Tyler Kim',
  category: 'Gaming & Esports',
  followers: '820K',
  engagement: '13.4%',
  src: "https://img.rocket.new/generatedImages/rocket_gen_img_143222348-1763292451066.png",
  alt: 'Tyler Kim gaming and esports influencer, casual headshot',
  tags: ['Gaming', 'Streaming'],
  verified: true
}];


export default function CreatorMarketplaceSection() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('revealed');
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="marketplace" className="section-padding bg-bg-base">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="badge badge-primary mb-3">Creator Marketplace</span>
            <h2 className="font-display text-[32px] lg:text-[40px] font-700 text-heading tracking-tight leading-tight">
              Find creators who<br />actually convert
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-sub">12,000+ verified creators</p>
            <a
              href="#"
              className="btn-secondary text-sm py-2.5 px-5">
              
              Browse All Creators
            </a>
          </div>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {creators.map((c, i) =>
          <div
            key={i}
            ref={(el) => {cardRefs.current[i] = el;}}
            className="creator-card scroll-reveal"
            style={{ transitionDelay: `${i * 0.07}s` }}>
            
              {/* Avatar + verified */}
              <div className="relative w-fit mx-auto mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-bg-alt">
                  <AppImage src={c.src} alt={c.alt} width={64} height={64} className="object-cover w-full h-full" />
                </div>
                {c.verified &&
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-white">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
              }
              </div>

              {/* Info */}
              <div className="text-center mb-4">
                <h3 className="font-display text-[15px] font-700 text-heading mb-0.5">{c.name}</h3>
                <p className="text-xs text-muted">{c.category}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-bg-base rounded-xl p-2 text-center">
                  <p className="text-xs text-muted">Followers</p>
                  <p className="text-sm font-700 font-display text-heading">{c.followers}</p>
                </div>
                <div className="bg-bg-base rounded-xl p-2 text-center">
                  <p className="text-xs text-muted">Engagement</p>
                  <p className="text-sm font-700 font-display text-green-500">{c.engagement}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                {c.tags.map((t) =>
              <span key={t} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-bg-alt text-primary">
                    {t}
                  </span>
              )}
              </div>

              {/* CTA */}
              <button className="w-full text-center text-sm font-semibold text-primary border border-primary/20 bg-bg-alt rounded-xl py-2.5 hover:bg-primary hover:text-white transition-all duration-200">
                View Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </section>);

}