import AppLayout from '@/src/components/AppLayout';
import AdminTopNavbar from '@/src/app/admin-panel/components/AdminTopNavbar';
import LeadFormPageContent from '../../components/LeadFormPageContent';

interface EditLeadPageProps {
  params: Promise<{ leadId: string }>;
}

export default async function EditLeadPage({ params }: EditLeadPageProps) {
  const { leadId } = await params;
  return (
    <AppLayout role="admin" topNavbar={<AdminTopNavbar />}>
      <LeadFormPageContent mode="edit" leadId={leadId} />
    </AppLayout>
  );
}
