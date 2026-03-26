'use client';
import React, { useEffect, useRef, useState } from 'react';
import AppImage from '@/src/components/ui/AppImage';

const initialFeed = [
{
  brand: 'NovaSkin Co.',
  creator: 'Ananya Kapoor',
  category: 'Beauty',
  views: '124K',
  engagement: '9.2%',
  roi: '4.1x',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1cf3a64ed-1772790260162.png",
  avatarAlt: 'Ananya Kapoor beauty influencer avatar',
  ts: '2m ago',
  color: '#F59E0B'
},
{
  brand: 'IronFuel Nutrition',
  creator: 'Jordan Davis',
  category: 'Fitness',
  views: '87K',
  engagement: '7.8%',
  roi: '3.2x',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1fa965c95-1772532604600.png",
  avatarAlt: 'Jordan Davis fitness influencer avatar',
  ts: '5m ago',
  color: '#22C55E'
},
{
  brand: 'TechDrop Store',
  creator: 'Mei Lin Zhang',
  category: 'Tech',
  views: '210K',
  engagement: '6.4%',
  roi: '5.0x',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1e2041d02-1763299138820.png",
  avatarAlt: 'Mei Lin Zhang tech influencer avatar',
  ts: '11m ago',
  color: '#4E40F1'
},
{
  brand: 'UrbanThreads',
  creator: 'Marcus Okafor',
  category: 'Fashion',
  views: '156K',
  engagement: '11.3%',
  roi: '3.8x',
  avatar: "https://images.unsplash.com/photo-1713885753849-3d32cfd3dd6d",
  avatarAlt: 'Marcus Okafor fashion influencer avatar',
  ts: '18m ago',
  color: '#EC4899'
},
{
  brand: 'GreenLeaf Organics',
  creator: 'Sofia Reyes',
  category: 'Lifestyle',
  views: '93K',
  engagement: '8.7%',
  roi: '2.9x',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_15ee14c21-1772124402960.png",
  avatarAlt: 'Sofia Reyes lifestyle influencer avatar',
  ts: '24m ago',
  color: '#10B981'
}];


export default function LiveActivitySection() {
  const [feed, setFeed] = useState(initialFeed);
  const [newItem, setNewItem] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setNewItem(true);
      setTimeout(() => setNewItem(false), 600);
      setFeed((prev) => {
        const rotated = [...prev];
        const first = rotated.shift()!;
        rotated.push({ ...first, ts: 'just now' });
        return rotated;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {if (entry.isIntersecting) el.classList.add('revealed');},
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="section-padding bg-bg-alt">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div ref={sectionRef} className="scroll-reveal">
            <span className="badge badge-primary mb-3">
              <span className="live-dot" />
              Live Activity
            </span>
            <h2 className="font-display text-[32px] lg:text-[40px] font-700 text-heading tracking-tight leading-tight">
              Campaigns running<br />right now
            </h2>
          </div>
          <p className="text-[15px] text-sub max-w-xs">Real campaigns, real creators, real results — updated live.</p>
        </div>

        <div className="space-y-3">
          {feed.map((item, i) =>
          <div
            key={`${item.brand}-${i}`}
            className={`bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm transition-all duration-500 ${
            i === feed.length - 1 && newItem ? 'scale-[1.01] border-primary/30 shadow-md' : ''}`
            }>
            
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                <AppImage src={item.avatar} alt={item.avatarAlt} width={40} height={40} className="object-cover w-full h-full" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-heading">{item.brand}</span>
                  <span className="text-muted text-sm">→</span>
                  <span className="text-sm font-medium text-primary">{item.creator}</span>
                  <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: `${item.color}18`, color: item.color }}>
                  
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Metrics */}
              <div className="hidden sm:flex items-center gap-6 flex-shrink-0">
                <div className="text-center">
                  <p className="text-xs text-muted">Views</p>
                  <p className="text-sm font-700 font-display text-heading">{item.views}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted">Engagement</p>
                  <p className="text-sm font-700 font-display text-green-500">{item.engagement}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted">ROI</p>
                  <p className="text-sm font-700 font-display text-primary">{item.roi}</p>
                </div>
              </div>

              {/* Time */}
              <div className="flex-shrink-0 text-xs text-muted">{item.ts}</div>
            </div>
          )}
        </div>
      </div>
    </section>);

}