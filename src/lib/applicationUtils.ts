/** Application statuses that block re-applying to the same campaign. */
const BLOCKING_STATUSES = new Set(['PENDING', 'SHORTLISTED', 'ACCEPTED', 'APPROVED', 'IN_PROGRESS']);

export function canReapplyToCampaign(applicationStatus: string): boolean {
  return !BLOCKING_STATUSES.has((applicationStatus ?? '').toUpperCase());
}

export function isActiveApplicationStatus(status: string): boolean {
  const s = (status ?? '').toLowerCase();
  return s === 'approved' || s === 'pending' || s === 'shortlisted';
}

export function applicationBlocksCampaign(applicationStatus: string): boolean {
  return !canReapplyToCampaign(applicationStatus);
}
