import type { NotificationItem } from '@/src/lib/api';

type NotificationMeta = {
  campaignId?: string;
  campaign_id?: string;
  applicationId?: string;
  application_id?: string;
};

/** Resolve a deep-link URL for a notification CTA. */
export function getNotificationActionUrl(notif: NotificationItem): string | null {
  const entityType = (notif.entity_type ?? '').toUpperCase();
  const entityId = notif.entity_id ?? '';
  const meta = (notif.metadata ?? {}) as NotificationMeta;
  const campaignId = meta.campaignId ?? meta.campaign_id ?? (entityType === 'CAMPAIGN' ? entityId : '');
  const applicationId = meta.applicationId ?? meta.application_id ?? (entityType === 'APPLICATION' ? entityId : '');

  const titleLower = notif.title.toLowerCase();
  const messageLower = notif.message.toLowerCase();
  const isInvite =
    titleLower.includes('invit') ||
    messageLower.includes('invited to apply') ||
    messageLower.includes('campaign invitation');

  if (isInvite && campaignId) {
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

function isCampaignInviteNotification(notif: NotificationItem): boolean {
  const titleLower = notif.title.toLowerCase();
  const messageLower = notif.message.toLowerCase();
  return (
    titleLower.includes('invit') ||
    messageLower.includes('invited to apply') ||
    messageLower.includes('campaign invitation')
  );
}

export function getNotificationActionLabel(notif: NotificationItem): string {
  const url = getNotificationActionUrl(notif);
  if (!url) return '';
  if (url.includes('campaign-discovery') && isCampaignInviteNotification(notif)) return 'Accept Invitation';
  if (url.includes('campaign-discovery')) return 'View Campaign';
  if (url.includes('my-applications')) return 'View Application';
  if (url.includes('messaging-inbox')) return 'Open Messages';
  if (url.includes('wallet-payments')) return 'View Wallet';
  if (url.includes('disputes')) return 'View Disputes';
  return 'View Details';
}
