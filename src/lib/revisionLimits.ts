/** Brand plan revision limits for deliverable review requests. */
export type BrandPlanTier = 'starter' | 'growth' | 'pro' | 'enterprise';

const REVISION_LIMITS: Record<BrandPlanTier, number> = {
  starter: 2,
  growth: 3,
  pro: 4,
  enterprise: 5,
};

export function getBrandRevisionLimit(plan?: string | null): number {
  const key = (plan ?? 'growth').toLowerCase() as BrandPlanTier;
  return REVISION_LIMITS[key] ?? REVISION_LIMITS.growth;
}

/** Remaining revisions based on deliverable version (each revision request increments version). */
export function revisionsRemaining(plan: string | null | undefined, version: number): number {
  const limit = getBrandRevisionLimit(plan);
  const used = Math.max(0, (version ?? 1) - 1);
  return Math.max(0, limit - used);
}
