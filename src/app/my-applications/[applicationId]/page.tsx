import AppLayout from '@/src/components/AppLayout';
import ApplicationDetailContent from './components/ApplicationDetailContent';

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;
  return (
    <AppLayout role="creator">
      <ApplicationDetailContent applicationId={applicationId} />
    </AppLayout>
  );
}
