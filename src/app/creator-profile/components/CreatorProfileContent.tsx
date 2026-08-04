'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { toast, Toaster } from 'sonner';
import { creatorApi, kycApi } from '@/src/lib/api';
import { Camera, Save, Star, TrendingUp, Users, Briefcase } from 'lucide-react';
import Icon from '@/src/components/ui/AppIcon';
import ProfileCompletionBanner from '@/src/components/ProfileCompletionBanner';
import CreatorPortfolioSection from '@/src/components/portfolio/CreatorPortfolioSection';
import { creatorProfileCompletion } from '@/src/lib/profileCompletion';



const niches = ['Beauty & Skincare', 'Fitness & Wellness', 'Food & Cooking', 'Tech & Gadgets', 'Fashion & Style', 'Travel & Adventure', 'Gaming', 'Finance & Investing', 'Lifestyle', 'Parenting', 'Education', 'Music & Entertainment'];

type PortfolioItem = {
  id: string;
  title: string;
  platform: string;
  views: string;
  engagement: string;
  url: string;
};

function formatHandleForDisplay(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
}

function toPortfolioItem(item: unknown, index: number): PortfolioItem {
  const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
  return {
    id: String(row.id ?? `p${index}`),
    title: String(row.title ?? 'Portfolio item'),
    platform: String(row.platform ?? 'Instagram'),
    views: String(row.views ?? '—'),
    engagement: String(row.engagement ?? '—'),
    url: String(row.url ?? ''),
  };
}

export default function CreatorProfileContent() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [youtube, setYoutube] = useState('');
  const [twitter, setTwitter] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [mediaKitUrl, setMediaKitUrl] = useState('');
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [kycVerified, setKycVerified] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const [profile, kyc] = await Promise.all([
        creatorApi.getProfile() as Promise<Record<string, unknown>>,
        kycApi.getStatus().catch(() => null),
      ]);
      const user = (profile.user as Record<string, unknown>) ?? {};
      const social = (profile.social_links as Record<string, string>) ?? {};
      setName(String(profile.full_name || user.name || ''));
      const rawHandle = String(profile.handle ?? social.handle ?? (social.instagram ? String(social.instagram).split('/').pop() : ''));
      setHandle(formatHandleForDisplay(rawHandle));
      setBio(String(profile.bio ?? ''));
      setLocation(String(profile.locality ?? ''));
      setEmail(String(profile.contact_email || user.email || ''));
      setPhone(String(profile.phone ?? ''));
      setInstagram(String(social.instagram ?? ''));
      setYoutube(String(social.youtube ?? ''));
      setTiktok(String(social.tiktok ?? ''));
      setTwitter(String(social.twitter ?? ''));
      setWebsite(String(social.website ?? ''));
      const nicheRaw = social.niches;
      if (Array.isArray(nicheRaw) && nicheRaw.length > 0) {
        setSelectedNiches(nicheRaw.map(String).slice(0, 5));
      } else if (profile.niche) {
        setSelectedNiches(String(profile.niche).split(',').map((n) => n.trim()).filter(Boolean).slice(0, 5));
      } else {
        setSelectedNiches([]);
      }
      setMediaKitUrl(String(profile.media_kit ?? ''));
      setPhotoUrl(profile.photo ? String(profile.photo) : profile.profile_photo ? String(profile.profile_photo) : null);
      setFollowersCount(Number(profile.followers ?? profile.followers_count ?? 0));
      const portfolioRaw = profile.portfolio;
      let portfolioArr: unknown[] = [];
      if (Array.isArray(portfolioRaw)) {
        portfolioArr = portfolioRaw;
      } else if (typeof portfolioRaw === 'string' && portfolioRaw.trim()) {
        try {
          const parsed = JSON.parse(portfolioRaw);
          portfolioArr = Array.isArray(parsed) ? parsed : [{ id: 'p0', title: 'Portfolio', platform: 'Instagram', views: '—', engagement: '—', url: portfolioRaw }];
        } catch {
          portfolioArr = [{ id: 'p0', title: 'Portfolio', platform: 'Instagram', views: '—', engagement: '—', url: portfolioRaw }];
        }
      }
      setPortfolioItems(portfolioArr.map(toPortfolioItem));
      const kycStatus = kyc && typeof kyc === 'object' ? String((kyc as Record<string, unknown>).status ?? '') : '';
      setKycVerified(kycStatus === 'APPROVED' || kycStatus === 'VERIFIED');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const profileCompletion = creatorProfileCompletion({
    name,
    email,
    phone,
    bio,
    photo: photoUrl,
    niche: selectedNiches[0],
    locality: location,
    instagram,
    youtube,
    tiktok,
    followers: followersCount,
    mediaKit: mediaKitUrl,
    portfolioCount: portfolioItems.length,
    kycVerified,
  });

  const saveProfile = async () => {
    const handleClean = handle.trim();
    if (handleClean && !/^@?[a-zA-Z0-9._-]{2,30}$/.test(handleClean.replace(/^@/, ''))) {
      toast.error('Handle must be 2–30 characters (letters, numbers, . _ -). @ is allowed.');
      return;
    }
    if (website.trim()) {
      try {
        const url = website.trim().startsWith('http') ? website.trim() : `https://${website.trim()}`;
        new URL(url);
      } catch {
        toast.error('Please enter a valid website URL (e.g. https://yoursite.com)');
        return;
      }
    }
    setSaving(true);
    try {
      await creatorApi.updateProfile({
        fullName: name,
        bio,
        niche: selectedNiches[0] || 'General',
        niches: selectedNiches,
        locality: location,
        contactEmail: email,
        phone,
        instagram,
        youtube,
        tiktok,
        twitter,
        website,
        handle: handle.replace(/^@/, ''),
        mediaKit: mediaKitUrl,
        portfolio: portfolioItems.length > 0 ? JSON.stringify(portfolioItems) : undefined,
        followers: followersCount || undefined,
        languages: ['English'],
      });
      toast.success('Profile saved successfully!');
      setHandle(formatHandleForDisplay(handleClean));
      await loadProfile();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const toggleNiche = (niche: string) => {
    setSelectedNiches(prev =>
      prev.includes(niche) ? prev.filter(n => n !== niche) : prev.length < 5 ? [...prev, niche] : prev
    );
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5MB or smaller');
      e.target.value = '';
      return;
    }
    setUploadingPhoto(true);
    try {
      const result = (await creatorApi.uploadPhoto(file)) as Record<string, unknown>;
      const url = String(result.photo ?? result.url ?? '');
      if (url) setPhotoUrl(url);
      toast.success('Profile photo uploaded!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const photoInitials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'U';

  const socialLinks = [
    { label: 'Instagram', value: instagram, setter: setInstagram, placeholder: 'https://instagram.com/yourhandle', color: 'text-pink-500', initials: 'IG' },
    { label: 'YouTube', value: youtube, setter: setYoutube, placeholder: 'https://youtube.com/@yourchannel', color: 'text-red-500', initials: 'YT' },
    { label: 'Twitter / X', value: twitter, setter: setTwitter, placeholder: 'https://twitter.com/yourhandle', color: 'text-blue-400', initials: 'TW' },
    { label: 'TikTok', value: tiktok, setter: setTiktok, placeholder: 'https://tiktok.com/@yourhandle', color: 'text-slate-700', initials: 'TK' },
    { label: 'Website', value: website, setter: setWebsite, placeholder: 'https://yourwebsite.com', color: 'text-slate-500', initials: 'WB' },
  ];

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Update your creator profile, social links, and media kit</p>
        </div>
        <button
          onClick={saveProfile}
          disabled={saving || loading}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all disabled:opacity-70"
        >
          <Save size={15} /> {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      <ProfileCompletionBanner
        percent={profileCompletion.percent}
        prompts={profileCompletion.prompts}
        role="creator"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — photo + stats */}
        <div className="space-y-5">
          {/* Profile photo */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Profile Photo</h2>
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={name || 'Profile'}
                    className="w-24 h-24 rounded-full object-cover border-2 border-violet-100"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-violet-100 flex items-center justify-center">
                    <span className="text-violet-700 text-2xl font-bold">{photoInitials}</span>
                  </div>
                )}
                <label
                  htmlFor="creatorProfilePhotoUpload"
                  className="absolute bottom-0 right-0 w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center shadow-md hover:bg-violet-700 transition-colors cursor-pointer"
                  title="Upload profile photo"
                >
                  <Camera size={14} className="text-white" />
                </label>
              </div>
              <p className="text-xs text-slate-500 text-center">JPG, PNG or GIF. Max 5MB.</p>
              <div className="mt-3 w-full">
                <label htmlFor="creatorProfilePhotoUpload" className="block text-xs font-semibold text-violet-700 mb-1.5">
                  Upload Image
                </label>
                <input
                  type="file"
                  id="creatorProfilePhotoUpload"
                  name="image"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto || loading}
                  className="block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                />
                {uploadingPhoto && <p className="text-xs text-slate-400 mt-1">Uploading…</p>}
              </div>
            </div>
          </div>

          {/* Stats overview */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Profile Stats</h2>
            <div className="space-y-3">
              {[
                { label: 'Total Followers', value: '48.2K', icon: Users, color: 'text-violet-600' },
                { label: 'Avg. Engagement', value: '5.2%', icon: TrendingUp, color: 'text-emerald-600' },
                { label: 'Campaigns Done', value: '14', icon: Briefcase, color: 'text-blue-600' },
                { label: 'Avg. ROI', value: '3.1x', icon: Star, color: 'text-amber-600' },
              ].map(stat => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className={stat.color} />
                      <p className="text-xs text-slate-500">{stat.label}</p>
                    </div>
                    <p className={`text-sm font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column — main form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Basic info */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Handle / Username</label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) {
                      setHandle('');
                      return;
                    }
                    setHandle(val.startsWith('@') ? val : `@${val}`);
                  }}
                  placeholder="@yourhandle"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Location</label>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500" placeholder="City, Country" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Contact Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone Number</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Website</label>
                <input type="url" value={website} onChange={e => setWebsite(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500" placeholder="https://" />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 resize-none" placeholder="Tell brands about yourself, your content style, and your audience..." />
              <p className="text-xs text-slate-400 mt-1">{bio.length}/500 characters</p>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Social Links</h2>
            <div className="space-y-3">
              {socialLinks.map(social => (
                <div key={social.label} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 ${social.color}`}>
                    <span className="text-xs font-bold">{social.initials}</span>
                  </div>
                  <div className="flex-1">
                    <input
                      type="url"
                      value={social.value}
                      onChange={e => social.setter(e.target.value)}
                      placeholder={social.placeholder}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Niche / Categories */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-700">Niche / Categories</h2>
              <p className="text-xs text-slate-400">Select up to 5</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {niches.map(niche => (
                <button
                  key={niche}
                  onClick={() => toggleNiche(niche)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${selectedNiches.includes(niche) ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600'}`}
                >
                  {niche}
                </button>
              ))}
            </div>
          </div>

          {/* Media Kit */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Media Kit</h2>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Media Kit URL</label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={mediaKitUrl}
                onChange={e => setMediaKitUrl(e.target.value)}
                placeholder="Link to your media kit (PDF, Notion, etc.)"
                className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
              />
              <button onClick={() => toast.success('Media kit uploaded')} className="flex items-center gap-1.5 text-xs text-slate-600 border border-slate-200 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap">
                Upload PDF
              </button>
            </div>
          </div>

          {/* Portfolio gallery (mock data) */}
          <CreatorPortfolioSection items={portfolioItems} />

          <button
            onClick={saveProfile}
            disabled={saving || loading}
            className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-3 rounded-xl text-sm transition-all disabled:opacity-70"
          >
            <Save size={15} /> {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
