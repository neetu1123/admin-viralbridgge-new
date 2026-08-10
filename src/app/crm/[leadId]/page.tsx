import AppLayout from '@/src/components/AppLayout';
import AdminTopNavbar from '@/src/app/admin-panel/components/AdminTopNavbar';
import LeadDetailContent from './components/LeadDetailContent';

interface LeadDetailPageProps {
  params: Promise<{ leadId: string }>;
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { leadId } = await params;
  return (
    <AppLayout role="admin" topNavbar={<AdminTopNavbar />}>
      <LeadDetailContent leadId={leadId} />
    </AppLayout>
  );
}
