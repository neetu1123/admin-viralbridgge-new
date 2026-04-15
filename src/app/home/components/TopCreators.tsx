import React from 'react';
import Link from 'next/link';
import AppImage from '@/src/components/ui/AppImage';
import { ArrowRight, TrendingUp, Star } from 'lucide-react';

const TOP_CREATORS = [
{
  id: 'top-creator-001',
  name: 'Sofia Chen',
  handle: '@sofiabeauty',
  niche: 'Beauty',
  platform: 'Instagram',
  followers: '284K',
  engagement: '6.8%',
  avgRate: '₹1,800/post',
  rating: 4.9,
  completedDeals: 42,
  avatar: "https://images.unsplash.com/photo-1556335466-0adf089ac4ef",
  alt: 'Young Asian woman with long dark hair smiling against neutral background',
  verified: true,
  nicheBg: '#FFF0F6',
  nicheColor: '#F357A8'
},
{
  id: 'top-creator-002',
  name: 'Marcus Reid',
  handle: '@marcusfitness',
  niche: 'Fitness',
  platform: 'YouTube',
  followers: '512K',
  engagement: '4.2%',
  avgRate: '₹3,200/video',
  rating: 4.8,
  completedDeals: 67,
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_13145da71-1773203122086.png",
  alt: 'Athletic Black man with short hair wearing white t-shirt against light background',
  verified: true,
  nicheBg: '#EFEAFF',
  nicheColor: '#7B2FF7'
},
{
  id: 'top-creator-003',
  name: 'Priya Sharma',
  handle: '@priyacooks',
  niche: 'Food',
  platform: 'TikTok',
  followers: '198K',
  engagement: '8.1%',
  avgRate: '₹1,200/post',
  rating: 5.0,
  completedDeals: 28,
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_12ea42ac5-1772258592389.png",
  alt: 'Indian woman with bright smile and curly hair in warm-toned kitchen setting',
  verified: true,
  nicheBg: '#FFF8EC',
  nicheColor: '#F9A826'
},
{
  id: 'top-creator-004',
  name: 'Liam Torres',
  handle: '@liamtechreviews',
  niche: 'Tech',
  platform: 'YouTube',
  followers: '841K',
  engagement: '3.6%',
  avgRate: '₹4,500/video',
  rating: 4.7,
  completedDeals: 91,
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_14e5f043b-1763293600409.png",
  alt: 'Hispanic man with glasses and friendly smile in casual office setting',
  verified: true,
  nicheBg: '#F0F8FF',
  nicheColor: '#1DA1F2'
},
{
  id: 'top-creator-005',
  name: 'Aisha Okonkwo',
  handle: '@aishalifestyle',
  niche: 'Lifestyle',
  platform: 'Instagram',
  followers: '376K',
  engagement: '5.9%',
  avgRate: '₹2,400/post',
  rating: 4.9,
  completedDeals: 55,
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1703231c0-1765278179841.png",
  alt: 'Nigerian woman with natural hair and warm smile wearing colorful outfit',
  verified: true,
  nicheBg: '#F0FFF4',
  nicheColor: '#22C55E'
},
{
  id: 'top-creator-006',
  name: 'Jake Nguyen',
  handle: '@jakegames',
  niche: 'Gaming',
  platform: 'TikTok',
  followers: '1.2M',
  engagement: '7.4%',
  avgRate: '₹5,800/post',
  rating: 4.6,
  completedDeals: 33,
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1882b194b-1763293730336.png",
  alt: 'Young Vietnamese man with headphones around neck smiling in gaming setup',
  verified: true,
  nicheBg: '#EFEAFF',
  nicheColor: '#7B2FF7'
},
{
  id: 'top-creator-007',
  name: 'Elena Russo',
  handle: '@elenatravel',
  niche: 'Travel',
  platform: 'Instagram',
  followers: '623K',
  engagement: '4.8%',
  avgRate: '₹3,800/post',
  rating: 4.8,
  completedDeals: 48,
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_10ca6927d-1772977923048.png",
  alt: 'Italian woman with blonde hair smiling outdoors in European city setting',
  verified: false,
  nicheBg: '#FFF8EC',
  nicheColor: '#F9A826'
},
{
  id: 'top-creator-008',
  name: 'Darius Webb',
  handle: '@dariusmindset',
  niche: 'Wellness',
  platform: 'YouTube',
  followers: '289K',
  engagement: '6.2%',
  avgRate: '₹2,100/video',
  rating: 4.9,
  completedDeals: 37,
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1ef6a4c1c-1772101813406.png",
  alt: 'Black man with calm expression wearing light blue shirt against neutral background',
  verified: true,
  nicheBg: '#F0FFF4',
  nicheColor: '#22C55E'
}];


export default function TopCreators() {
  return (
    <section className="py-24 bg-[#F8F7FC]">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="inline-block text-[#7B2FF7] font-semibold text-sm uppercase tracking-widest mb-3 font-display">
              Top Creators
            </span>
            <h2 className="font-display font-800 text-4xl text-[#1F1F2E] tracking-tight">
              Work with the best
            </h2>
          </div>
          <Link
            href="/creators-explore-page"
            className="hidden md:flex items-center gap-2 text-[#7B2FF7] font-semibold text-sm hover:gap-3 transition-all duration-200">
            
            Browse all creators <ArrowRight size={15} />
          </Link>
        </div>

        {/* Creator grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {TOP_CREATORS?.map((creator) =>
          <div
            key={creator?.id}
            className="group bg-white rounded-2xl border border-[#E5E7EB] shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1 p-5 flex flex-col items-center text-center gap-4">
            
              {/* Avatar */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-[#F2F3F7] ring-4 ring-[#F8F7FC] group-hover:ring-[#EFEAFF] transition-all duration-200">
                  <AppImage
                  src={creator?.avatar}
                  alt={creator?.alt}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full" />
                
                </div>
                {creator?.verified &&
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#7B2FF7] flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
              }
              </div>

              {/* Info */}
              <div>
                <h3 className="font-display font-700 text-[#1F1F2E] text-base">{creator?.name}</h3>
                <p className="text-[#9AA0B4] text-xs mt-0.5">{creator?.handle}</p>
              </div>

              {/* Niche badge */}
              <span
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ color: creator?.nicheColor, backgroundColor: creator?.nicheBg }}>
              
                {creator?.niche}
              </span>

              {/* Stats grid */}
              <div className="w-full grid grid-cols-2 gap-3">
                <div className="bg-[#F8F7FC] rounded-xl p-2.5 text-center">
                  <div className="font-display font-700 text-[#1F1F2E] text-sm tabular-nums">{creator?.followers}</div>
                  <div className="text-[#9AA0B4] text-[10px] mt-0.5">Followers</div>
                </div>
                <div className="bg-[#F8F7FC] rounded-xl p-2.5 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp size={11} className="text-green-500" />
                    <span className="font-display font-700 text-[#1F1F2E] text-sm tabular-nums">{creator?.engagement}</span>
                  </div>
                  <div className="text-[#9AA0B4] text-[10px] mt-0.5">Engagement</div>
                </div>
              </div>

              {/* Rate + Rating */}
              <div className="w-full flex items-center justify-between">
                <span className="text-[#1F1F2E] font-display font-700 text-sm tabular-nums">{creator?.avgRate}</span>
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-[#F9A826] fill-[#F9A826]" />
                  <span className="text-[#1F1F2E] font-display font-700 text-sm tabular-nums">{creator?.rating}</span>
                </div>
              </div>

              {/* CTA */}
              <Link
              href="/creators-explore-page"
              className="w-full text-center py-2 rounded-xl border border-[#E5E7EB] text-[#6B6B8A] text-sm font-medium hover:border-[#7B2FF7] hover:text-[#7B2FF7] hover:bg-[#EFEAFF] transition-all duration-150">
              
                View Profile
              </Link>
            </div>
            
          )}
        </div>

        {/* Mobile see all */}
        <div className="mt-8 text-center md:hidden">
          <Link href="/creators-explore-page" className="btn-secondary inline-flex items-center gap-2">
            Browse all creators <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>);

}