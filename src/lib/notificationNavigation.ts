import type { NotificationItem } from '@/src/lib/api';

export type NotificationRole = 'creator' | 'brand' | 'admin';

type NotificationMeta = {
  campaignId?: string;
  campaign_id?: string;
  applicationId?: string;
  application_id?: string;
};

function getMetaIds(notif: NotificationItem) {
  const entityType = (notif.entity_type ?? '').toUpperCase();
  const entityId = notif.entity_id ?? '';
  const meta = (notif.metadata ?? {}) as NotificationMeta;
  const campaignId = meta.campaignId ?? meta.campaign_id ?? (entityType === 'CAMPAIGN' ? entityId : '');
  const applicationId =
    meta.applicationId ?? meta.application_id ?? (entityType === 'APPLICATION' ? entityId : '');
  return { campaignId, applicationId };
}

export function isCampaignInviteNotification(notif: NotificationItem): boolean {
  if (notif.type === 'CAMPAIGN_INVITE') return true;
  const titleLower = notif.title.toLowerCase();
  const messageLower = notif.message.toLowerCase();
  return (
    titleLower.includes('invit') ||
    messageLower.includes('invited to apply') ||
    messageLower.includes('campaign invitation')
  );
}

export function isCampaignApplicationNotification(notif: NotificationItem): boolean {
  if (notif.type === 'CAMPAIGN_APPLICATION') return true;
  const titleLower = notif.title.toLowerCase();
  const messageLower = notif.message.toLowerCase();
  return titleLower.includes('new campaign application') || /\bapplied to\b/.test(messageLower);
}

export function isApproachNotification(notif: NotificationItem): boolean {
  return isCampaignInviteNotification(notif) || isCampaignApplicationNotification(notif);
}

/** Resolve a deep-link URL for a notification CTA. */
export function getNotificationActionUrl(
  notif: NotificationItem,
  role: NotificationRole = 'creator',
): string | null {
  const { campaignId, applicationId } = getMetaIds(notif);

  if (role === 'brand') {
    if (applicationId) return `/brand-applicant/${applicationId}`;
    if (campaignId) return '/brand-applicant';
    if (notif.type === 'MESSAGE') return '/brand-messages';
    if (notif.type === 'PAYMENT' || notif.type === 'WITHDRAWAL') return '/brand-wallet';
    if (notif.type === 'DISPUTE') return '/brand-disputes';
    return null;
  }

  if (isCampaignInviteNotification(notif) && campaignId) {
    return `/campaign-discovery?apply=${campaignId}`;
  }

  if (campaignId) {
    return `/campaign-discovery?apply=${campaignId}`;
  }

  if (applicationId) {
    return `/my-applications/${applicationId}`;
  }

  if (notif.type === 'MESSAGE') return '/messaging-inbox';
  if (notif.type === 'PAYMENT' || notif.type === 'WITHDRAWAL') return '/wallet-payments';
  if (notif.type === 'DISPUTE') return '/creator-disputes';

  return null;
}

export function getNotificationActionLabel(
  notif: NotificationItem,
  role: NotificationRole = 'creator',
): string {
  const url = getNotificationActionUrl(notif, role);
  if (!url) return '';
  if (url.includes('campaign-discovery') && isCampaignInviteNotification(notif)) return 'View Invitation';
  if (url.includes('campaign-discovery')) return 'View Campaign';
  if (url.includes('my-applications')) return 'View Application';
  if (url.includes('brand-applicant')) return isCampaignApplicationNotification(notif) ? 'Review Application' : 'View Applicants';
  if (url.includes('messaging-inbox') || url.includes('brand-messages')) return 'Open Messages';
  if (url.includes('wallet')) return 'View Wallet';
  if (url.includes('disputes')) return 'View Disputes';
  return 'View Details';
}
