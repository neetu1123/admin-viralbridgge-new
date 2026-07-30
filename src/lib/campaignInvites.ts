export type SentCampaignInvite = {
  id: string;
  campaignId: string;
  campaignTitle: string;
  creatorId: string;
  creatorName: string;
  sentAt: string;
};

const STORAGE_KEY = 'vb_sent_campaign_invites';

export function getSentCampaignInvites(): SentCampaignInvite[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SentCampaignInvite[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordSentCampaignInvite(invite: Omit<SentCampaignInvite, 'id' | 'sentAt'>): SentCampaignInvite {
  const entry: SentCampaignInvite = {
    ...invite,
    id: `${invite.campaignId}-${invite.creatorId}-${Date.now()}`,
    sentAt: new Date().toISOString().slice(0, 10),
  };
  const existing = getSentCampaignInvites().filter(
    (i) => !(i.campaignId === invite.campaignId && i.creatorId === invite.creatorId),
  );
  const next = [entry, ...existing].slice(0, 200);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return entry;
}
