import AppLayout from '@/src/components/AppLayout';
import BrandApplicantDetailContent from './components/BrandApplicantDetailContent';

export default async function BrandApplicantDetailPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;
  return (
    <AppLayout role="brand">
      <BrandApplicantDetailContent applicationId={applicationId} />
    </AppLayout>
  );
}
