export type ProfilePrompt = {
  id: string;
  label: string;
  done: boolean;
  href?: string;
};

export function creatorProfileCompletion(input: {
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  photo?: string | null;
  niche?: string;
  locality?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  followers?: number;
  mediaKit?: string;
  portfolioCount?: number;
  kycVerified?: boolean;
}): { percent: number; prompts: ProfilePrompt[] } {
  const checks: ProfilePrompt[] = [
    { id: 'name', label: 'Add your full name', done: Boolean(input.name && input.name.trim().length >= 2), href: '/creator-profile' },
    { id: 'email', label: 'Confirm email address', done: Boolean(input.email && input.email.includes('@')), href: '/creator-profile' },
    { id: 'photo', label: 'Upload profile photo', done: Boolean(input.photo), href: '/creator-profile' },
    { id: 'bio', label: 'Add bio', done: Boolean(input.bio && input.bio.length >= 20), href: '/creator-profile' },
    { id: 'niche', label: 'Select your niche', done: Boolean(input.niche), href: '/creator-profile' },
    { id: 'social', label: 'Connect social accounts', done: Boolean(input.instagram || input.youtube || input.tiktok), href: '/creator-profile' },
    { id: 'followers', label: 'Add followers count', done: (input.followers ?? 0) > 0, href: '/creator-profile' },
    { id: 'location', label: 'Add location', done: Boolean(input.locality), href: '/creator-profile' },
    { id: 'media', label: 'Upload media kit or portfolio', done: Boolean(input.mediaKit) || (input.portfolioCount ?? 0) > 0, href: '/creator-profile' },
    { id: 'kyc', label: 'Complete KYC verification', done: Boolean(input.kycVerified), href: '/creator-settings' },
  ];
  const done = checks.filter((c) => c.done).length;
  return { percent: Math.round((done / checks.length) * 100), prompts: checks.filter((c) => !c.done) };
}

export function brandProfileCompletion(input: {
  companyName?: string;
  email?: string;
  description?: string;
  website?: string;
  industry?: string;
  logo?: string | null;
  location?: string;
  kycVerified?: boolean;
}): { percent: number; prompts: ProfilePrompt[] } {
  const checks: ProfilePrompt[] = [
    { id: 'company', label: 'Company name', done: Boolean(input.companyName), href: '/brand-settings' },
    { id: 'email', label: 'Confirm contact email', done: Boolean(input.email && input.email.includes('@')), href: '/brand-settings' },
    { id: 'desc', label: 'Company description', done: Boolean(input.description && input.description.length >= 30), href: '/brand-settings' },
    { id: 'website', label: 'Add website', done: Boolean(input.website), href: '/brand-settings' },
    { id: 'industry', label: 'Select industry', done: Boolean(input.industry), href: '/brand-settings' },
    { id: 'logo', label: 'Upload brand logo', done: Boolean(input.logo), href: '/brand-settings' },
    { id: 'location', label: 'Add business location', done: Boolean(input.location), href: '/brand-settings' },
    { id: 'kyc', label: 'Complete KYC verification', done: Boolean(input.kycVerified), href: '/brand-settings' },
  ];
  const done = checks.filter((c) => c.done).length;
  return { percent: Math.round((done / checks.length) * 100), prompts: checks.filter((c) => !c.done) };
}
